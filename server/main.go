package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	// _ "github.com/mattn/go-sqlite3"
)

var secret []byte
var db *sql.DB
var logger Logger

const dbDriver = "mysql"
const dsn = "butsury_days:shota0817@(localhost:3306)/butsury_days"

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

	logger.Info("Initializing database...")
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
		switch r.Method {
		case http.MethodPost:
			handleAuthRequire(createHistory)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/getHistories\" function")
	http.HandleFunc("/getHistories", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			getHistories(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
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
		switch r.Method {
		case http.MethodPost:
			handleAuthRequire(issueTicket)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
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
		switch r.Method {
		case http.MethodPost:
			update(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/api/purchases\" function")
	http.HandleFunc("/api/purchases", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handleAuthRequire(createPurchaseHistory)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Handling \"/getPurchases\" function")
	http.HandleFunc("/getPurchases", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			getPurchaseHistories(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	logger.Info("Server is booted. Endpoint: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

/* 処理系 */

func handleCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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
