package main

import (
	"fmt"
	"net/http"
	"time"
)

const (
	createHistoriesTable = `
		CREATE TABLE IF NOT EXISTS histories (
			id 			INT PRIMARY KEY AUTO_INCREMENT,
			user_id		INT NOT NULL,
			get_on_id 	INT NULL DEFAULT -1,
			get_off_id 	INT NULL DEFAULT -1,
			date 		DATETIME DEFAULT CURRENT_TIMESTAMP,
			fair 		INT NOT NULL,
			balance 	INT NOT NULL,
			type_id 	INT NOT NULL,
			company_id	INT NOT NULL
		)
	`

	insertHistory = "INSERT INTO histories (user_id, get_on_id, get_off_id, date, fair, balance, type_id, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

	selectHistories = "SELECT * FROM histories WHERE user_id = ? ORDER BY date DESC"
)

type History struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	GetOnID   int    `json:"get_on_id"`
	GetOffID  int    `json:"get_off_id"`
	Date      string `json:"date"`
	Fair      int    `json:"fair"`
	Balance   int    `json:"balance"`
	TypeID    int    `json:"type_id"`
	CompanyID int    `json:"company_id"`
}

func getHistories(w http.ResponseWriter, r *http.Request) {
	var history History
	if err := decodeBody(r, &history); err != nil {
		logger.Error("The bad request is occurred: getHistories-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	rows, err := db.Query(selectHistories, history.UserID)
	if err != nil {
		logger.Error("The bad request is occurred: getHistories-Query")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	defer rows.Close()

	var histories = []History{}

	for rows.Next() {
		var history History
		err := rows.Scan(&history.ID, &history.UserID, &history.GetOnID, &history.GetOffID, &history.Date, &history.Fair, &history.Balance, &history.TypeID, &history.CompanyID)
		if err != nil {
			logger.Error("The internal server error is occurred: getHistories-Scan")
			logger.ErrorE(err)
			respondJSON(w, http.StatusInternalServerError, err.Error())
			return
		}
		histories = append(histories, history)
	}

	respondJSON(w, http.StatusOK, histories)
}

func createHistory(w http.ResponseWriter, r *http.Request) {
	var history History
	if err := decodeBody(r, &history); err != nil {
		logger.Error("The bad request is occurred: createHistory-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	now := time.Now()

	result, err := db.Exec(insertHistory, history.UserID, history.GetOnID, history.GetOffID, now, history.Fair, history.Balance, history.TypeID, history.CompanyID)
	if err != nil {
		logger.Error("The internal server error is occurred: createHistory-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("The internal server error is occurred: createHistory-LastInsertId")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	history.ID = int(id)
	history.Date = now.Format("2006-01-02 15:04:05")

	logger.Info("========= The new history was created.=========")
	logger.Info(fmt.Sprintf("ID: %d", history.ID))
	logger.Info(fmt.Sprintf("UserID: %d", history.UserID))
	logger.Info(fmt.Sprintf("GetOnID: %d", history.GetOnID))
	logger.Info(fmt.Sprintf("GetOffID: %d", history.GetOffID))
	logger.Info(fmt.Sprintf("Date: %s", history.Date))
	logger.Info(fmt.Sprintf("Fair: %d", history.Fair))
	logger.Info(fmt.Sprintf("Balance: %d", history.Balance))
	logger.Info(fmt.Sprintf("TypeID: %d", history.TypeID))
	logger.Info(fmt.Sprintf("CompanyID: %d", history.CompanyID))
	logger.Info("===============================================")

	respondJSON(w, http.StatusCreated, history)
}
