package pokemon

import (
	"poketower-client/service/battle"
	"poketower-client/service/database"
	"poketower-client/service/model"
)

func ChooseStarting(id []int) {
	var pokemons []model.Pokemon
	if err := database.DB.Where("id IN ?", id).Find(&pokemons).Error; err != nil {
		panic("failed to find starting pokemons: " + err.Error())
	}

	for i := range pokemons {
		pokemons[i].SetInitialStats()
	}

	battle.PlayerPokemons = pokemons
	battle.PlayerPC = pokemons
}
