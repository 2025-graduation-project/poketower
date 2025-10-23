package battle

import (
	"math/rand"
	"poketower-client/service/database"
	"poketower-client/service/model"
)

func DrawStageType() (model.Type, error) {
	var stageType model.Type

	err := database.DB.Where("id != ?", CurrentStageType.ID).Order("RANDOM()").First(&stageType).Error
	if err != nil {
		return model.Type{}, err
	}

	return stageType, nil
}

func DrawStageEnemy() {
	pokemons, err := model.FindByTypeID(CurrentStageType.ID)
	if err != nil {
		panic("failed to find stage pokemons: " + err.Error())
	}

	result := make([]model.Pokemon, 0, 3)
	for i := 0; i < 3; i++ {
		selectedPokemon := pokemons[rand.Intn(len(pokemons))]
		selectedPokemon.SetInitialStats()
		result = append(result, selectedPokemon)
	}

	EnemyPokemons = result
}
