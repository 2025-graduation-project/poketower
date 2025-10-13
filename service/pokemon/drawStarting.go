package pokemon

import (
	"math/rand/v2"
)

func DrawStarting() {
	startingList := GetStartingPokemons()

	rand.Shuffle(len(startingList), func(i, j int) {
		startingList[i], startingList[j] = startingList[j], startingList[i]
	})

	result := make([]int, min(3, len(startingList)))
	for i := range result {
		result[i] = startingList[i].ID
	}

	ChooseStarting(result)
}
