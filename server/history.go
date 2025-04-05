package main

import (
	"net/http"
	"time"
)

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

type History struct {
	ID       int    `json:"id"`
	GetOnID  int    `json:"get_on_id"`
	GetOffID int    `json:"get_off_id"`
	Date     string `json:"date"`
	Fair     int    `json:"fair"`
	Balance  int    `json:"balance"`
	TypeID   int    `json:"type_id"`
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
