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
			disabled	BOOLEAN NOT NULL,
			date_limit	DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`

	insertTicket = "INSERT INTO tickets (user_id, uuid, disabled, date_limit) VALUES (?, ?, ?, ?)"

	selectTicketByUUID = "SELECT * FROM tickets WHERE uuid = ?"

	updateTicketDisabled = "UPDATE tickets SET disabled = true WHERE uuid = ?"
)

type Ticket struct {
	ID        int    `json:"id"`
	UserId    int    `json:"user_id"`
	Uuid      string `json:"uuid"`
	Disabled  bool   `json:"disabled"`
	DateLimit string `json:"date_limit"`
}

func issueTicket(w http.ResponseWriter, r *http.Request) {
	var ticket Ticket
	if err := decodeBody(r, &ticket); err != nil {
		println("The bad request is occurred: issueTicket-decodeBody")
		println(err.Error())
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	limit := time.Now().Add(5 * time.Minute)
	uuid, err := uuid.NewRandom()

	result, err := db.Exec(insertTicket, ticket.UserId, uuid.String(), false, limit)
	if err != nil {
		println("The internal server error is occurred: issueTicket-Exec")
		println(err.Error())
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		println("The internal server error is occurred: issueTicket-LastInsertId")
		println(err.Error())
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	ticket.ID = int(id)
	ticket.Uuid = uuid.String()
	ticket.DateLimit = limit.Format("2006-01-02 15:04:05")

	println("========= The new ticket was issued.=========")
	print("ID: ")
	println(ticket.ID)
	print("UserID: ")
	println(ticket.UserId)
	print("UUID: ")
	println(ticket.Uuid)
	print("Disabled: ")
	println(ticket.Disabled)
	print("Limit: ")
	println(ticket.DateLimit)
	println("=============================================")

	respondJSON(w, http.StatusCreated, ticket)
}

func useTicket(w http.ResponseWriter, r *http.Request) {
	var arg Ticket
	if err := decodeBody(r, &arg); err != nil {
		println("The bad request is occurred: useTicket-decodeBody")
		println(err.Error())
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	row := db.QueryRow(selectTicketByUUID, arg.Uuid)
	var ticket Ticket
	err := row.Scan(&ticket.ID, &ticket.UserId, &ticket.Uuid, &ticket.Disabled, &ticket.DateLimit)
	if err != nil {
		println("The internal server error is occurred: useTicket-Scan")
		println(err.Error())
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	println("The ticket was used by user.")
	print("UUID: ")
	println(ticket.Uuid)

	if ticket.Disabled {
		println("But the ticket was already used.")
		respondJSON(w, http.StatusContinue, nil)
		return
	}

	_, err = db.Exec(updateTicketDisabled, ticket.Uuid)
	if err != nil {
		println("The internal server error is occurred: useTicket-Exec")
		println(err.Error())
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, ticket)
}
