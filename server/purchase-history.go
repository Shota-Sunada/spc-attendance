package main

import (
	"fmt"
	"net/http"
	"time"
)

const (
	createPurchaseHistoriesTable = `
		CREATE TABLE IF NOT EXISTS purchases (
			id					INT PRIMARY KEY AUTO_INCREMENT,
			user_id 			INT NOT NULL,
			date				DATETIME DEFAULT CURRENT_TIMESTAMP,
			type_id				INT NOT NULL,
			class_id			INT NOT NULL,
			place_id			INT NOT NULL,
			product_id			INT NOT NULL,
			teiki_start_date	DATETIME,
			teiki_end_date		DATETIME,
			teiki_start_id		INT NOT NULL,
			teiki_end_id		INT NOT NULL,
			teiki_id			INT NOT NULL,
			teiki_company_id	INT NOT NULL,
			price				INT NOT NULL,
			purchase_price		INT NOT NULL
		)
	`

	insertPurchaseHistory = "INSERT INTO purchases (user_id, date, type_id, class_id, place_id, product_id, teiki_start_date, teiki_end_date, teiki_start_id, teiki_end_id, teiki_id, teiki_company_id, price, purchase_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

	selectPurchaseHistories = "SELECT * FROM purchases WHERE user_id = ? ORDER BY date DESC"
)

type PurchaseHistory struct {
	ID             int    `json:"id"`
	UserId         int    `json:"user_id"`
	Date           string `json:"date"`
	TypeId         int    `json:"type_id"`
	ClassId        int    `json:"class_id"`
	PlaceId        int    `json:"place_id"`
	ProductId      int    `json:"product_id"`
	TeikiStartDate string `json:"teiki_start_date"`
	TeikiEndDate   string `json:"teiki_end_date"`
	TeikiStartId   int    `json:"teiki_start_id"`
	TeikiEndId     int    `json:"teiki_end_id"`
	TeikiId        int    `json:"teiki_id"`
	TeikiCompanyId int    `json:"teiki_company_id"`
	Price          int    `json:"price"`
	PurchasePrice  int    `json:"purchase_price"`
}

func createPurchaseHistory(w http.ResponseWriter, r *http.Request) {
	var ph PurchaseHistory
	if err := decodeBody(r, &ph); err != nil {
		logger.Error("The bad request is occurred: createPurchaseHistory-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	date := time.Now()
	start_date, _ := time.Parse("2006-01-02 15:04:05", ph.TeikiStartDate)
	end_date, _ := time.Parse("2006-01-02 15:04:05", ph.TeikiEndDate)

	result, err := db.Exec(insertPurchaseHistory, ph.UserId, date, ph.TypeId, ph.ClassId, ph.PlaceId, ph.ProductId, start_date, end_date, ph.TeikiStartId, ph.TeikiEndId, ph.TeikiId, ph.TeikiCompanyId, ph.Price, ph.PurchasePrice)
	if err != nil {
		logger.Error("The internal server error is occurred: createPurchaseHistory-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("The internal server error is occurred: createPurchaseHistory-LastInsertId")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	ph.ID = int(id)
	ph.Date = date.Format("2006-01-02 15:04:05")

	logger.Info("========= The new purchase history was created.=========")
	logger.Info(fmt.Sprintf("ID: %d", ph.ID))
	logger.Info(fmt.Sprintf("UserId: %d", ph.UserId))
	logger.Info(fmt.Sprintf("Date: %s", ph.Date))
	logger.Info(fmt.Sprintf("TypeId: %d", ph.TypeId))
	logger.Info(fmt.Sprintf("ClassId: %d", ph.ClassId))
	logger.Info(fmt.Sprintf("PlaceId: %d", ph.PlaceId))
	logger.Info(fmt.Sprintf("ProductId: %d", ph.ProductId))
	logger.Info(fmt.Sprintf("TeikiStartDate: %s", ph.TeikiStartDate))
	logger.Info(fmt.Sprintf("TeikiEndDate: %s", ph.TeikiEndDate))
	logger.Info(fmt.Sprintf("TeikiStartId: %d", ph.TeikiStartId))
	logger.Info(fmt.Sprintf("TeikiEndId: %d", ph.TeikiEndId))
	logger.Info(fmt.Sprintf("TeikiId: %d", ph.TeikiId))
	logger.Info(fmt.Sprintf("TeikiCompanyId: %d", ph.TeikiCompanyId))
	logger.Info(fmt.Sprintf("Price: %d", ph.Price))
	logger.Info(fmt.Sprintf("PurchasePrice: %d", ph.PurchasePrice))
	logger.Info("========================================================")

	respondJSON(w, http.StatusCreated, ph)
}

func getPurchaseHistories(w http.ResponseWriter, r *http.Request) {
	var ph PurchaseHistory
	if err := decodeBody(r, &ph); err != nil {
		logger.Error("The bad request is occurred: getPurchaseHistories-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	rows, err := db.Query(selectPurchaseHistories, ph.UserId)
	if err != nil {
		logger.Error("The bad request is occurred: getPurchaseHistories-Query")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	defer rows.Close()

	var phs = []PurchaseHistory{}

	for rows.Next() {
		var ph PurchaseHistory
		err := rows.Scan(&ph.ID, &ph.UserId, &ph.Date, &ph.TypeId, &ph.ClassId, &ph.PlaceId, &ph.ProductId, &ph.TeikiStartDate, &ph.TeikiEndDate, &ph.TeikiStartId, &ph.TeikiEndId, &ph.TeikiId, &ph.TeikiCompanyId, &ph.Price, &ph.PurchasePrice)
		if err != nil {
			logger.Error("The internal server error is occurred: getPurchaseHistories-Scan")
			logger.ErrorE(err)
			respondJSON(w, http.StatusInternalServerError, err.Error())
			return
		}
		phs = append(phs, ph)
	}

	respondJSON(w, http.StatusOK, phs)
}
