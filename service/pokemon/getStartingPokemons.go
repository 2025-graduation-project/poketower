package pokemon

import (
	"gorm.io/gorm"
	"log"
	"poketower-client/service/database"
	"poketower-client/service/model"
)

func GetStartingPokemons() []model.Pokemon {
	var startingPokemons []model.Pokemon

	if err := database.DB.Preload("Types").Preload("Moves", func(db *gorm.DB) *gorm.DB {
		return db.Where("category <> ?", 3).Where("power IS NOT NULL")
	}).Preload("Moves.Type").Where("is_starting = ?", true).Find(&startingPokemons).Error; err != nil {
		log.Fatal("failed to find starting pokemons:", err)
	}

	return startingPokemons
}
