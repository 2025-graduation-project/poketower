package pokemon

import (
	"poketower-client/service/database"
	"testing"
)

func TestGetPokemonsWithType(t *testing.T) {
	_, err := database.OpenDb()

	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	pokemons := GetPokemonsWithType(1)

	if len(pokemons) == 0 {
		t.Errorf("Expected at least one pokemon, got none")
	} else {
		t.Logf("Found %d pokemons with type ID 1", len(pokemons))
		for _, pokemon := range pokemons {
			t.Logf("Pokemon: %s", pokemon.Name)
			for _, pokemonType := range pokemon.Types {
				t.Logf("Type: %s", pokemonType.Name)
			}
			t.Log("--------------------------------")
		}
	}
}
