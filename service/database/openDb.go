package database

import (
	"embed"
	"errors"
	"io/fs"
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//go:embed master.db
var dbFS embed.FS

var DB *gorm.DB

func OpenDb() (*gorm.DB, error) {
	dbBytes, err := fs.ReadFile(dbFS, "master.db")
	if err != nil {
		log.Fatalf("failed to read embedded db file: %v", err)
	}

	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, errors.New("failed to get user config directory")
	}

	appDir := filepath.Join(configDir, "poketower")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(appDir, "master.db")
	log.Printf("Database path: %s", dbPath)

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		log.Println("Database file not found, creating a new one from embedded master.db")
		err = os.WriteFile(dbPath, dbBytes, 0644)
		if err != nil {
			return nil, err
		}
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	DB = db
	return DB, nil
}
