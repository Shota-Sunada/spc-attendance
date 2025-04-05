package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/dgrijalva/jwt-go"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var secret []byte
var db *sql.DB

const dbFileName = "db.sqlite3"

const (
	createHistoriesTable = `
		CREATE TABLE IF NOT EXISTS histories (
			id 			INTEGER PRIMARY KEY AUTOINCREMENT,
			get_on_id 	INTEGER NOT NULL,
			get_off_id 	INTEGER NOT NULL,
			date 		DATETIME DEFAULT CURRENT_TIMESTAMP,
			fair 		INTEGER NOT NULL,
			balance 	INTEGER NOT NULL,
			type_id 	INTEGER NOT NULL
		)
	`

	insertHistory = "INSERT INTO histories (get_on_id, get_off_id, date, fair, balance, type_id) VALUES (?, ?, ?, ?, ?, ?)"

	selectHistories = "SELECT * FROM histories ORDER BY date DESC"
)

const (
	createUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id 				INTEGER PRIMARY KEY AUTOINCREMENT,
			name	 		TEXT NOT NULL,
			password 		TEXT NOT NULL,
			is_admin 		BOOLEAN NOT NULL,
			balance			INTEGER NOT NULL,
			is_getting_on	BOOLEAN NOT NULL,
			created_at 		DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`

	insertUser = "INSERT INTO users (name, password, is_admin, balance, is_getting_on, created_at) VALUES (?, ?, ?, ?, ?, ?)"

	selectUserByID = "SELECT * FROM users WHERE id = ?"
)

const (
	createTicketTable = `
		CREATE TABLE IF NOT EXISTS tickets (
			id			INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id 	INTEGER NOT NULL,
			uuid 		TEXT NOT NULL,
			date_limit	DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`

	insertTicket = "INSERT INTO tickets (user_id, uuid, date_limit) VALUES (?, ?, ?)"

	selectTickets = "SELECT * FROM tickets WHERE id = ?"
)

type History struct {
	ID       int    `json:"id"`
	GetOnID  int    `json:"get_on_id"`
	GetOffID int    `json:"get_off_id"`
	Date     string `json:"date"`
	Fair     int    `json:"fair"`
	Balance  int    `json:"balance"`
	TypeID   int    `json:"type_id"`
}

type User struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Password    string `json:"password"`
	IsAdmin     bool   `json:"is_admin"`
	Balance     int    `json:"balance"`
	IsGettingOn bool   `json:"is_getting_on"`
	CreatedAt   string `json:"created_at"`
}

type Ticket struct {
	ID        int    `json:"id"`
	UserId    int    `json:"user_id"`
	Uuid      string `json:"uuid"`
	DateLimit string `json:"date_limit"`
}

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
		case http.MethodGet:
			getTicket(w, r)
		case http.MethodPost:
			handleAuthRequire(issueTicket)(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}))

	fmt.Println("Server is booted. Endpoint: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func getHistories(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(selectHistories)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var histories = []History{}

	for rows.Next() {
		var history History
		err := rows.Scan(&history.ID, &history.GetOnID, &history.GetOffID, &history.Date, &history.Fair, &history.Balance, &history.TypeID)
		if err != nil {
			panic(err)
		}
		histories = append(histories, history)
	}

	respondJSON(w, http.StatusOK, histories)
}

func createHistory(w http.ResponseWriter, r *http.Request) {
	var history History
	if err := decodeBody(r, &history); err != nil {
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	now := time.Now()

	result, err := db.Exec(insertHistory, history.GetOnID, history.GetOffID, now, history.Fair, history.Balance, history.TypeID)
	if err != nil {
		panic(err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		panic(err)
	}
	history.ID = int(id)
	history.Date = now.Format("2006-01-02 15:04:05")

	respondJSON(w, http.StatusCreated, history)
}

func registerUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := decodeBody(r, &user); err != nil {
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	now := time.Now()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード1"})
		return
	}

	result, err := db.Exec(insertUser, user.Name, string(hashedPassword), user.IsAdmin, 0, false, now)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード2"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード3"})
		return
	}
	user.ID = int(id)
	user.CreatedAt = now.Format("2006-01-02 15:04:05")
	user.Password = ""

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(secret)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "内部サーバーエラー: エラーコード4"})
		return
	}

	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

func loginUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := decodeBody(r, &user); err != nil {
		respondJSON(w, http.StatusBadRequest, "不正なリクエストです。")
		return
	}

	row := db.QueryRow(selectUserByID, user.ID)
	var temp User
	err := row.Scan(&temp.ID, &temp.Name, &temp.Password, &temp.IsAdmin, &temp.Balance, &temp.IsGettingOn, &temp.CreatedAt)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "IDまたはパスワードが間違っています。"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(temp.Password), []byte(user.Password)); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "IDまたはパスワードが間違っています。"})
		return
	}

	claims := jwt.MapClaims{
		"user_id": temp.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(secret)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "内部サーバーエラー: エラーコード5"})
		return
	}

	temp.Password = ""

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"user":  temp,
	})
}

func getMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(AuthCtxKey("user_id")).(int)

	row := db.QueryRow(selectUserByID, userID)
	var user User
	err := row.Scan(&user.ID, &user.Name, &user.Password, &user.IsAdmin, &user.Balance, &user.IsGettingOn, &user.CreatedAt)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	user.Password = ""

	respondJSON(w, http.StatusOK, user)
}

func issueTicket(w http.ResponseWriter, r *http.Request) {
	var ticket Ticket
	if err := decodeBody(r, &ticket); err != nil {
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	now := time.Now().Add(5 * time.Minute)
	uuid, err := uuid.NewRandom()

	result, err := db.Exec(insertTicket, ticket.UserId, uuid.String(), now)
	if err != nil {
		panic(err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		panic(err)
	}
	ticket.ID = int(id)
	ticket.Uuid = uuid.String()
	ticket.DateLimit = now.Format("2006-01-02 15:04:05")

	respondJSON(w, http.StatusCreated, ticket)
}

func getTicket(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(selectTickets)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	var tickets = []Ticket{}

	for rows.Next() {
		var ticket Ticket
		err := rows.Scan(&ticket.ID, &ticket.UserId, &ticket.Uuid, &ticket.DateLimit)
		if err != nil {
			panic(err)
		}
		tickets = append(tickets, ticket)
	}

	respondJSON(w, http.StatusOK, tickets)
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
			respondJSON(w, http.StatusUnauthorized, "no token")
			return
		}

		bearerToken := strings.Split(authorizationHeader, " ")
		if len(bearerToken) != 2 {
			respondJSON(w, http.StatusUnauthorized, "invalid token")
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
			respondJSON(w, http.StatusUnauthorized, "invalid token")
			return
		}
		userID, ok := claims["user_id"].(float64)
		if !ok {
			respondJSON(w, http.StatusUnauthorized, "invalid token")
			return
		}

		ctx := context.WithValue(r.Context(), AuthCtxKey("user_id"), int(userID))

		h(w, r.WithContext(ctx))
	}
}
