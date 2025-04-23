package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

const (
	createUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id 					INT PRIMARY KEY AUTO_INCREMENT,
			name	 			TEXT NOT NULL,
			password 			TEXT NOT NULL,
			is_admin 			BOOLEAN NOT NULL DEFAULT FALSE,
			balance				INT NOT NULL DEFAULT 0,
			last_get_on_id		INT NOT NULL DEFAULT 0,
			created_at 			DATETIME DEFAULT CURRENT_TIMESTAMP,
			enable_auto_charge 	BOOLEAN NOT NULL DEFAULT TRUE,
			auto_charge_balance INT NOT NULL DEFAULT 1000,
			auto_charge_charge  INT NOT NULL DEFAULT 1000,
			is_banned			BOOLEAN NOT NULL DEFAULT FALSE,
			pass_is_student		BOOLEAN NOT NULL DEFAULT FALSE,
			pass_company_name	TEXT NOT NULL DEFAULT "物理班電鉄",
			pass_start_id		TEXT NOT NULL DEFAULT "bk2",
			pass_end_id			TEXT NOT NULL DEFAULT "physics"
		)
	`

	insertUser = "INSERT INTO users (name, password, is_admin, balance, last_get_on_id, created_at, enable_auto_charge, auto_charge_balance, auto_charge_charge, is_banned, pass_is_student, pass_company_name, pass_start_id, pass_end_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

	selectUserByName = "SELECT * FROM users WHERE name = ?"

	selectUserById = "SELECT * FROM users WHERE id = ?"

	updateUserByName = "UPDATE users SET balance = ?, last_get_on_id = ?, enable_auto_charge = ?, auto_charge_balance = ?, auto_charge_charge = ?, is_banned = ?, pass_is_student = ?, pass_company_name = ?, pass_start_id = ?, pass_end_id = ?, is_admin = ? WHERE name = ?"
)

type User struct {
	ID                int    `json:"id"`
	Name              string `json:"name"`
	Password          string `json:"password"`
	IsAdmin           bool   `json:"is_admin"`
	Balance           int    `json:"balance"`
	LastGetOnId       int    `json:"last_get_on_id"`
	CreatedAt         string `json:"created_at"`
	EnableAutoCharge  bool   `json:"enable_auto_charge"`
	AutoChargeBalance int    `json:"auto_charge_balance"`
	AutoChargeCharge  int    `json:"auto_charge_charge"`
	IsBanned          bool   `json:"is_banned"`
	PassIsStudent     bool   `json:"pass_is_student"`
	PassCompanyName   string `json:"pass_company_name"`
	PassStartId       string `json:"pass_start_id"`
	PassEndId         string `json:"pass_end_id"`
}

func registerUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := decodeBody(r, &user); err != nil {
		logger.Error("The bad request is occurred: registerUser-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	row := db.QueryRow(selectUserByName, user.Name)
	var temp User
	err := row.Scan(&temp.ID, &temp.Name, &temp.Password, &temp.IsAdmin, &temp.Balance, &temp.LastGetOnId, &temp.CreatedAt, &temp.EnableAutoCharge, &temp.AutoChargeBalance, &temp.AutoChargeCharge, &temp.IsBanned, &temp.PassIsStudent, &temp.PassCompanyName, &temp.PassStartId, &temp.PassEndId)
	if err == nil {
		logger.Error("The internal server error is occurred: registerUser-QueryRow")
		logger.Error("The given username is already exists!")
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "ユーザー名が既に使用されています。別のユーザー名を入力してください。"})
		return
	}

	now := time.Now()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error("The internal server error is occurred: registerUser-GenerateFromPassword")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード1"})
		return
	}

	result, err := db.Exec(insertUser, user.Name, string(hashedPassword), false, 0, false, now, true, 1000, 1000, false, false, "物理班電鉄", "bk2", "physics")
	if err != nil {
		logger.Error("The internal server error is occurred: registerUser-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード2"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("The internal server error is occurred: registerUser-LastInsertId")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード3"})
		return
	}
	user.ID = int(id)
	user.CreatedAt = now.Format("2006-01-02 15:04:05")
	user.Password = ""

	claims := jwt.MapClaims{
		"user_name": user.Name,
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(secret)
	if err != nil {
		logger.Error("The internal server error is occurred: registerUser-SignedString")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード4"})
		return
	}

	logger.Info("======= The new user was registered. ========")
	logger.Info(fmt.Sprintf("ID: %d", user.ID))
	logger.Info(fmt.Sprintf("Name: %s", user.Name))
	logger.Info(fmt.Sprintf("IsAdmin: %t", user.IsAdmin))
	logger.Info(fmt.Sprintf("Balance: %d", user.Balance))
	logger.Info(fmt.Sprintf("LastGetOnId: %d", user.LastGetOnId))
	logger.Info(fmt.Sprintf("CreatedAt: %s", user.CreatedAt))
	logger.Info(fmt.Sprintf("EnableAutoCharge: %t", user.EnableAutoCharge))
	logger.Info(fmt.Sprintf("AutoChargeBalance: %d", user.AutoChargeBalance))
	logger.Info(fmt.Sprintf("AutoChargeCharge: %d", user.AutoChargeCharge))
	logger.Info(fmt.Sprintf("IsBanned: %t", user.IsBanned))
	logger.Info(fmt.Sprintf("PassIsStudent: %t", user.PassIsStudent))
	logger.Info(fmt.Sprintf("PassCompanyName: %s", user.PassCompanyName))
	logger.Info(fmt.Sprintf("PassStartId: %s", user.PassStartId))
	logger.Info(fmt.Sprintf("PassEndId: %s", user.PassEndId))
	logger.Info("=============================================")

	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

func loginUser(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := decodeBody(r, &user); err != nil {
		logger.Error("The bad request is occurred: loginUser-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, "不正なリクエストです。")
		return
	}

	row := db.QueryRow(selectUserByName, user.Name)
	var temp User
	err := row.Scan(&temp.ID, &temp.Name, &temp.Password, &temp.IsAdmin, &temp.Balance, &temp.LastGetOnId, &temp.CreatedAt, &temp.EnableAutoCharge, &temp.AutoChargeBalance, &temp.AutoChargeCharge, &temp.IsBanned, &temp.PassIsStudent, &temp.PassCompanyName, &temp.PassStartId, &temp.PassEndId)
	if err != nil {
		logger.Error("The bad request is occurred: loginUser-ID")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "IDまたはパスワードが間違っています。"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(temp.Password), []byte(user.Password)); err != nil {
		logger.Error("The bad request is occurred: loginUser-PS")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, map[string]string{"message": "IDまたはパスワードが間違っています。"})
		return
	}

	claims := jwt.MapClaims{
		"user_name": temp.Name,
		"exp":       time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(secret)
	if err != nil {
		logger.Error("The internal server error is occurred: loginUser-SignedString")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"message": "内部サーバーエラー: エラーコード5"})
		return
	}

	temp.Password = ""

	logger.Info("The user was logged in.")
	logger.Info(fmt.Sprintf("Logged in user ID: %d, Name: %s", temp.ID, temp.Name))

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"user":  temp,
	})
}

func getMe(w http.ResponseWriter, r *http.Request) {
	userName := r.Context().Value(AuthCtxKey("user_name")).(string)

	row := db.QueryRow(selectUserByName, userName)
	var user User
	err := row.Scan(&user.ID, &user.Name, &user.Password, &user.IsAdmin, &user.Balance, &user.LastGetOnId, &user.CreatedAt, &user.EnableAutoCharge, &user.AutoChargeBalance, &user.AutoChargeCharge, &user.IsBanned, &user.PassIsStudent, &user.PassCompanyName, &user.PassStartId, &user.PassEndId)
	if err != nil {
		logger.Error("The internal server error is occurred: getMe-Scan")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	user.Password = ""

	respondJSON(w, http.StatusOK, user)
}

func getUserById(w http.ResponseWriter, r *http.Request) {
	var arg User
	if err := decodeBody(r, &arg); err != nil {
		logger.Error("The internal server error is occurred: getUserById-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	row := db.QueryRow(selectUserById, arg.ID)
	var user User
	err := row.Scan(&user.ID, &user.Name, &user.Password, &user.IsAdmin, &user.Balance, &user.LastGetOnId, &user.CreatedAt, &user.EnableAutoCharge, &user.AutoChargeBalance, &user.AutoChargeCharge, &user.IsBanned, &user.PassIsStudent, &user.PassCompanyName, &user.PassStartId, &user.PassEndId)
	if err != nil {
		logger.Error("The internal server error is occurred: getUserById-Scan")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	user.Password = ""

	respondJSON(w, http.StatusOK, user)
}

func update(w http.ResponseWriter, r *http.Request) {
	var arg User
	if err := decodeBody(r, &arg); err != nil {
		logger.Error("The internal server error is occurred: update-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	_, err := db.Exec(updateUserByName, arg.Balance, arg.LastGetOnId, arg.EnableAutoCharge, arg.AutoChargeBalance, arg.AutoChargeCharge, arg.IsBanned, arg.PassIsStudent, arg.PassCompanyName, arg.PassStartId, arg.PassEndId, arg.IsAdmin, arg.Name)
	if err != nil {
		logger.Error("The internal server error is occurred: update-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	logger.Info("======= The user status was updated. ========")
	logger.Info(fmt.Sprintf("Name: %s", arg.Name))
	logger.Info(fmt.Sprintf("Balance: %d", arg.Balance))
	logger.Info(fmt.Sprintf("LastGetOnId: %d", arg.LastGetOnId))
	logger.Info(fmt.Sprintf("EnableAutoCharge: %t", arg.EnableAutoCharge))
	logger.Info(fmt.Sprintf("AutoChargeBalance: %d", arg.AutoChargeBalance))
	logger.Info(fmt.Sprintf("AutoChargeCharge: %d", arg.AutoChargeCharge))
	logger.Info(fmt.Sprintf("IsBanned: %t", arg.IsBanned))
	logger.Info(fmt.Sprintf("IsAdmin: %t", arg.IsAdmin))
	logger.Info(fmt.Sprintf("PassIsStudent: %t", arg.PassIsStudent))
	logger.Info(fmt.Sprintf("PassCompanyName: %s", arg.PassCompanyName))
	logger.Info(fmt.Sprintf("PassStartId: %s", arg.PassStartId))
	logger.Info(fmt.Sprintf("PassEndId: %s", arg.PassEndId))
	logger.Info("=============================================")

	respondJSON(w, http.StatusOK, nil)
}
