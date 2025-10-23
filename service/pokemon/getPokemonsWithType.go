package pokemon

import (
	"poketower-client/service/model"
)

func GetPokemonsWithType(typeId int) []model.Pokemon {
	pokemons, err := model.FindByTypeID(typeId)
	if err != nil {
		panic("failed to find starting pokemons: " + err.Error())
	}

	return pokemons
}
