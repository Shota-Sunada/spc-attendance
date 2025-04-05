package main

import (
	"net/http"
	"time"

	"github.com/google/uuid"
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

type Ticket struct {
	ID        int    `json:"id"`
	UserId    int    `json:"user_id"`
	Uuid      string `json:"uuid"`
	DateLimit string `json:"date_limit"`
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
