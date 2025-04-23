package main

import (
	"fmt"
	"math/rand"
	"net/http"
)

const (
	createAdminTable = `
		CREATE TABLE IF NOT EXISTS admin (
			id				INT PRIMARY KEY AUTO_INCREMENT,
			id6				INT NOT NULL,
			adult_num 		INT NULL DEFAULT 1,
			children_num 	INT NULL DEFAULT 0,
			is_cancel		BOOLEAN NULL DEFAULT FALSE,
			start_id		INT NULL,
			end_id			INT NULL,
			fare_direct		INT NULL
		)
	`

	insertAdmin = "INSERT INTO admin (id6, adult_num, children_num, is_cancel, start_id, end_id, fare_direct) VALUES (?, ?, ?, ?, ?, ?, ?)"

	selectAdmin = "SELECT * FROM admin WHERE id6 = ?"

	updateAdmin = "UPDATE admin SET adult_num = ?, children_num = ?, is_cancel = ?, start_id = ?, end_id = ?, fare_direct = ? WHERE id6 = ?"

	deleteAdmin = "DELETE FROM admin WHERE id6 = ?"
)

type Admin struct {
	ID          int   `json:"id"`
	ID6         int   `json:"id6"`
	AdultNum    *int  `json:"adult_num"`
	ChildrenNum *int  `json:"children_num"`
	IsCancel    *bool `json:"is_cancel"`
	StartId     *int  `json:"start_id"`
	EndId       *int  `json:"end_id"`
	FareDirect  *int  `json:"fare_direct"`
}

func getAdmin(w http.ResponseWriter, r *http.Request) {
	var args Admin
	if err := decodeBody(r, &args); err != nil {
		logger.Error("The bad request is occurred: getAdmin-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	row := db.QueryRow(selectAdmin, args.ID6)
	var admin Admin
	err := row.Scan(&admin.ID, &admin.ID6, &admin.AdultNum, &admin.ChildrenNum, &admin.IsCancel, &admin.StartId, &admin.EndId, &admin.FareDirect)
	if err != nil {
		logger.Error("The internal server error is occurred: getAdmin-Scan")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, admin)
}

func createAdmin(w http.ResponseWriter, r *http.Request) {
	var id6 = 10000 + rand.Intn(89999)
	result, err := db.Exec(insertAdmin, id6, 1, 0, false, 0, 0, 0)
	if err != nil {
		logger.Error("The internal server error is occurred: createAdmin-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("The internal server error is occurred: createAdmin-LastInsertId")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	var admin Admin
	admin.ID = int(id)
	admin.ID6 = id6

	logger.Info("========= The new admin was created.=========")
	logger.Info(fmt.Sprintf("ID: %d", admin.ID))
	logger.Info(fmt.Sprintf("ID6: %d", admin.ID6))
	logger.Info(fmt.Sprintf("AdultNum: %d", admin.AdultNum))
	logger.Info(fmt.Sprintf("ChildrenNum: %d", admin.ChildrenNum))
	logger.Info(fmt.Sprintf("IsCancel: %d", admin.IsCancel))
	logger.Info(fmt.Sprintf("StartId: %d", admin.StartId))
	logger.Info(fmt.Sprintf("EndId: %d", admin.EndId))
	logger.Info(fmt.Sprintf("FareDirect: %d", admin.FareDirect))
	logger.Info("==============================================")

	respondJSON(w, http.StatusCreated, admin)
}

func updateAdminF(w http.ResponseWriter, r *http.Request) {
	var arg Admin
	if err := decodeBody(r, &arg); err != nil {
		logger.Error("The internal server error is occurred: updateAdminF-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	_, err := db.Exec(updateAdmin, arg.AdultNum, arg.ChildrenNum, arg.IsCancel, arg.StartId, arg.EndId, arg.FareDirect, arg.ID6)
	if err != nil {
		logger.Error("The internal server error is occurred: updateAdminF-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	logger.Info("========= The admin was updated.=========")
	logger.Info(fmt.Sprintf("ID6: %d", arg.ID6))
	logger.Info(fmt.Sprintf("AdultNum: %d", arg.AdultNum))
	logger.Info(fmt.Sprintf("ChildrenNum: %d", arg.ChildrenNum))
	logger.Info(fmt.Sprintf("IsCancel: %d", arg.IsCancel))
	logger.Info(fmt.Sprintf("StartId: %d", arg.StartId))
	logger.Info(fmt.Sprintf("EndId: %d", arg.EndId))
	logger.Info(fmt.Sprintf("FareDirect: %d", arg.FareDirect))
	logger.Info("==========================================")

	respondJSON(w, http.StatusOK, nil)
}

func deleteAdminF(w http.ResponseWriter, r *http.Request) {
	var arg Admin
	if err := decodeBody(r, &arg); err != nil {
		logger.Error("The internal server error is occurred: deleteAdmin-decodeBody")
		logger.ErrorE(err)
		respondJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	_, err := db.Exec(deleteAdmin, arg.ID6)
	if err != nil {
		logger.Error("The internal server error is occurred: deleteAdmin-Exec")
		logger.ErrorE(err)
		respondJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	logger.Info("========= The admin was deleted.=========")
	logger.Info(fmt.Sprintf("ID6: %d", arg.ID6))
	logger.Info("==========================================")

	respondJSON(w, http.StatusOK, nil)
}
