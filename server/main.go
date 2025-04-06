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
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

var secret []byte
var db *sql.DB

const dbFileName = "db.sqlite3"

func init() {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	secretRaw := os.Getenv("SECRET")
	if secretRaw == "" {
		panic("SECRET is not set")
	}
	secret = []byte(secretRaw)

	db, err = sql.Open("sqlite3", "db.sqlite3")
	if err != nil {
		panic(err)
	}

	defer db.Close()

	_, err = db.Exec(createHistoriesTable)
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(createUsersTable)
	if err != nil {
		panic(err)
	}

	_, err = db.Exec(createTicketTable)
	if err != nil {
		panic(err)
	}
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", dbFileName)
	if err != nil {
		panic(err)
	}

	defer db.Close()

	http.HandleFunc("/api/histories", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getHistories(w, r)
		case http.MethodPost:
			handleAuthRequire(createHistory)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/api/me", handleCORS(handleAuthRequire(getMe)))

	http.HandleFunc("/login", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			loginUser(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/register", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			registerUser(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/api/tickets", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handleAuthRequire(issueTicket)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/useTicket", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			useTicket(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/api/users", handleCORS(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			getUserById(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	fmt.Println("Server is booted. Endpoint: http://localhost:8080")
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
		panic(err)
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
		userID, ok := claims["user_id"].(float64)
		if !ok {
			respondJSON(w, http.StatusUnauthorized, "Invalid token was sent.")
			return
		}

		ctx := context.WithValue(r.Context(), AuthCtxKey("user_id"), int(userID))

		h(w, r.WithContext(ctx))
	}
}
