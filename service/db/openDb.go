package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func OpenDb() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("./master.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
