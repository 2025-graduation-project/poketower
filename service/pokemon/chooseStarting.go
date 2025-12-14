package pokemon

import (
	"poketower-client/service/battle"
	"poketower-client/service/database"
	"poketower-client/service/model"

	"gorm.io/gorm"
)

func ChooseStarting(id []int) {
	var pokemons []model.Pokemon
	if err := database.DB.Preload("Types").Preload("Moves", func(db *gorm.DB) *gorm.DB {
		return db.Where("category <> ?", 3).Where("power IS NOT NULL")
	}).Preload("Moves.Type").Where("id IN ?", id).Find(&pokemons).Error; err != nil {
		panic("failed to find starting pokemons: " + err.Error())
	}

	for i := range pokemons {
		pokemons[i].SetInitialStats(65)
	}

	battle.PlayerPokemons = pokemons
	battle.PlayerPC = pokemons
}
