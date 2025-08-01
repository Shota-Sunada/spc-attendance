package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"

	"github.com/joho/godotenv"
	"golang.org/x/time/rate"
)

var secret []byte
var db *sql.DB
var logger Logger

var userLimiters = make(map[string]*rate.Limiter)

const dbDriver = "mysql"

var databaseName string = ""
var databaseUser string = ""
var databasePassword string = ""
var databaseAddress string = ""
var databaseProtocol string = ""

var dsn string = ""

var port string = ""

func init() {
	logger.Init()
	logger.Info("Booting \"BUTSURY DAYS\" server...")
	logger.Info("Copyright 2025 Shudo Physics Club")
	logger.Empty()
	logger.Info("＿人人人人人人人人人人人人人人人人人人人人人人人人＿")
	logger.Info(">　QRコードは(株)デンソーウェーブの登録商標です　<")
	logger.Info("￣Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^￣")
	logger.Empty()

	logger.Info("Starting initializing process...")

	err := godotenv.Load()
	if err != nil {
		logger.ErrorE(err)
	}

	secretRaw := os.Getenv("SECRET")
	if secretRaw == "" {
		logger.Error("SECRET is not set")
	}
	secret = []byte(secretRaw)

	databaseName = os.Getenv("DATABASE_NAME")
	if databaseName == "" {
		logger.Error("DATABASE_NAME is not set")
	}
	databaseUser = os.Getenv("DATABASE_USER")
	if databaseUser == "" {
		logger.Error("DATABASE_USER is not set")
	}
	databasePassword = os.Getenv("DATABASE_PASSWORD")
	if databasePassword == "" {
		logger.Error("DATABASE_PASSWORD is not set")
	}
	databaseAddress = os.Getenv("DATABASE_ADDRESS")
	if databaseAddress == "" {
		logger.Error("DATABASE_ADDRESS is not set")
	}
	databaseProtocol = os.Getenv("DATABASE_PROTOCOL")
	if databaseProtocol == "" {
		logger.Error("DATABASE_PROTOCOL is not set")
	}

	logger.Info("Initializing database...")
	dsn = fmt.Sprintf("%s:%s@%s(%s)/%s",databaseUser,databasePassword,databaseProtocol,databaseAddress,databaseName)
	logger.Info(fmt.Sprintf("DSN: %s", dsn))
	if dsn == "" {
		logger.Error("DSN is not set")
	}

	db, err = sql.Open(dbDriver, dsn)
	if err != nil {
		logger.ErrorE(err)
	}

	defer db.Close()

	_, err = db.Exec(createHistoriesTable)
	if err != nil {
		logger.ErrorE(err)
	}

	_, err = db.Exec(createUsersTable)
	if err != nil {
		logger.ErrorE(err)
	}

	_, err = db.Exec(createTicketTable)
	if err != nil {
		logger.ErrorE(err)
	}

	_, err = db.Exec(createPurchaseHistoriesTable)
	if err != nil {
		logger.ErrorE(err)
	}

	_, err = db.Exec(createAdminTable)
	if err != nil {
		logger.ErrorE(err)
	}

	logger.Info("Initializing process is done.")
}

func main() {
	logger.Info("Staring main process...")

	logger.Info("Opening database file")
	var err error
	db, err = sql.Open(dbDriver, dsn)
	if err != nil {
		logger.ErrorE(err)
	}

	defer db.Close()

	logger.Info("Handling \"/api/histories\" function")
	http.HandleFunc("/api/histories", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				handleAuthRequire(createHistory)(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/getHistories\" function")
	http.HandleFunc("/getHistories", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				handleAuthRequire(getHistories)(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/api/me\" function")
	http.HandleFunc("/api/me", handleCORS(handleAuthRequire(getMe)))

	logger.Info("Handling \"/login\" function")
	http.HandleFunc("/login", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			loginUser(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/register\" function")
	http.HandleFunc("/register", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			registerUser(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/api/tickets\" function")
	http.HandleFunc("/api/tickets", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				handleAuthRequire(issueTicket)(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/useTicket\" function")
	http.HandleFunc("/useTicket", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			useTicket(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/api/users\" function")
	http.HandleFunc("/api/users", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			getUserById(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/api/update\" function")
	http.HandleFunc("/api/update", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				update(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/api/purchases\" function")
	http.HandleFunc("/api/purchases", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				handleAuthRequire(createPurchaseHistory)(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/getPurchases\" function")
	http.HandleFunc("/getPurchases", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("User-ID")
		lim := getLimiter(id)

		if lim.Allow() {
			switch r.Method {
			case http.MethodPost:
				handleAuthRequire(getPurchaseHistories)(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
	}))

	logger.Info("Handling \"/api/admin\" function")
	http.HandleFunc("/api/admin", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			createAdmin(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/getAdmin\" function")
	http.HandleFunc("/getAdmin", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			getAdmin(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/updateAdmin\" function")
	http.HandleFunc("/updateAdmin", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			updateAdminF(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/deleteAdmin\" function")
	http.HandleFunc("/deleteAdmin", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			deleteAdminF(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	port = os.Getenv("PORT")
	if port == "" {
		logger.Error("PORT is not set")
	}

	logger.Info(fmt.Sprintf("Server is booted. Endpoint: http://localhost:%s", port))
	http.ListenAndServe(fmt.Sprintf(":%s", port), nil)
}

/* 処理系 */

func handleCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, User-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		h(w, r)
	}
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		logger.ErrorE(err)
	}
}

func decodeBody(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		return err
	}
	return nil
}

type AuthCtxKey string

func handleAuthRequire(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader == "" {
			respondJSON(w, http.StatusUnauthorized, "No token is set.")
			return
		}

		bearerToken := strings.Split(authorizationHeader, " ")
		if len(bearerToken) != 2 {
			respondJSON(w, http.StatusUnauthorized, "Invalid token was sent.")
			return
		}

		tokenString := bearerToken[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		if err != nil {
			respondJSON(w, http.StatusUnauthorized, err.Error())
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			respondJSON(w, http.StatusUnauthorized, "Invalid token was sent.")
			return
		}
		userName, ok := claims["user_name"].(string)
		if !ok {
			respondJSON(w, http.StatusUnauthorized, "Invalid token was sent.")
			return
		}

		ctx := context.WithValue(r.Context(), AuthCtxKey("user_name"), userName)

		h(w, r.WithContext(ctx))
	}
}

func getLimiter(id string) *rate.Limiter {
	if limiter, exists := userLimiters[id]; exists {
		return limiter
	}

	limiter := rate.NewLimiter(1, 3)
	userLimiters[id] = limiter

	return limiter
}
