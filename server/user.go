package main

import (
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
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

type User struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Password    string `json:"password"`
	IsAdmin     bool   `json:"is_admin"`
	Balance     int    `json:"balance"`
	IsGettingOn bool   `json:"is_getting_on"`
	CreatedAt   string `json:"created_at"`
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
