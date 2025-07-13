package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
)

const (
	createTicketTable = `
		CREATE TABLE IF NOT EXISTS tickets (
			id			INT PRIMARY KEY AUTO_INCREMENT,
			user_id 	INT NOT NULL,
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
	StopId    int    `json:"stop_id"`
	Disabled  bool   `json:"disabled"`
	DateLimit string `json:"date_limit"`
}

func issueTicket(w http.ResponseWriter, r *http.Request) {
	var ticket Ticket
	if err := decodeBody(r, &ticket); err != nil {
		logger.Error("The bad request is occurred: issueTicket-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	limit := time.Now().Add(5 * time.Minute)
	random, _ := uuid.NewRandom()

	result, err := db.Exec(insertTicket, ticket.UserId, random.String(), false, limit)
	if err != nil {
		logger.Error("The internal server error is occurred: issueTicket-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("The internal server error is occurred: issueTicket-LastInsertId")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	ticket.ID = int(id)
	ticket.Uuid = random.String()
	ticket.DateLimit = limit.Format("2006-01-02 15:04:05")

	logger.Info("========= The new ticket was issued.=========")
	logger.Info(fmt.Sprintf("ID: %d", ticket.ID))
	logger.Info(fmt.Sprintf("UserID: %d", ticket.UserId))
	logger.Info(fmt.Sprintf("UUID: %s", ticket.Uuid))
	logger.Info(fmt.Sprintf("Disabled: %t", ticket.Disabled))
	logger.Info(fmt.Sprintf("Limit: %s", ticket.DateLimit))
	logger.Info("=============================================")

	respondJSON(w, http.StatusCreated, ticket)
}

func useTicket(w http.ResponseWriter, r *http.Request) {
	var arg Ticket
	if err := decodeBody(r, &arg); err != nil {
		logger.Error("The bad request is occurred: useTicket-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	row := db.QueryRow(selectTicketByUUID, arg.Uuid)
	var ticket Ticket
	err := row.Scan(&ticket.ID, &ticket.UserId, &ticket.Uuid, &ticket.Disabled, &ticket.DateLimit)
	if err != nil {
		logger.Error("The internal server error is occurred: useTicket-Scan selectTicketByUUID")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	logger.Info("The ticket was used by user.")
	logger.Info(fmt.Sprintf("UUID: %s", ticket.Uuid))

	if ticket.Disabled {
		logger.Warn("But the ticket was already used.")
		respondJSON(w, http.StatusContinue, nil)
		return
	}

	_, err = db.Exec(updateTicketDisabled, ticket.Uuid)
	if err != nil {
		logger.Error("The internal server error is occurred: useTicket-Exec updateTicketDisabled")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, ticket)
}
