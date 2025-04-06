package main

import (
	"net/http"
	"time"

	"fmt"

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

	selectTicketByUUID = "SELECT * FROM tickets WHERE uuid = ?"
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
		println("The bad request is occurred: issueTicket-decodeBody")
		println(err.Error())
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	now := time.Now().Add(5 * time.Minute)
	uuid, err := uuid.NewRandom()

	result, err := db.Exec(insertTicket, ticket.UserId, uuid.String(), now)
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
	ticket.DateLimit = now.Format("2006-01-02 15:04:05")

	println("========= The new ticket was issued.=========")
	print("ID: ")
	println(fmt.Sprint(ticket.ID))
	print("UserID: ")
	println(fmt.Sprint(ticket.UserId))
	print("UUID: ")
	println(ticket.Uuid)
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

	println("The ticket was used by user.")
	print("UUID: ")
	println(arg.Uuid)

	row := db.QueryRow(selectTicketByUUID, arg.Uuid)
	var ticket Ticket
	err := row.Scan(&ticket.ID, &ticket.UserId, &ticket.Uuid, &ticket.DateLimit)
	if err != nil {
		println("The internal server error is occurred: useTicket-Scan")
		println(err.Error())
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, ticket)
}
