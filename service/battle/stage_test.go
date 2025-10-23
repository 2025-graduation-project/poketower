package battle

import (
	"testing"

	"poketower-client/service/database"
	"poketower-client/service/model"
)

func TestDrawStageType(t *testing.T) {
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	CurrentStageType = model.Type{ID: 4}

	result, err := DrawStageType()
	if err != nil {
		t.Fatalf("DrawStageType failed: %v", err)
	}

	t.Logf("Drew stage type: ID=%d, Name=%s", result.ID, result.Name)

	if result.ID == CurrentStageType.ID {
		t.Errorf("Expected different type from current, got same type ID: %d", result.ID)
	}

	if result.ID == 0 || result.Name == "" {
		t.Errorf("Invalid type returned: ID=%d, Name=%s", result.ID, result.Name)
	}
}

func TestDrawStageEnemy(t *testing.T) {
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	CurrentStageType = model.Type{ID: 4}

	DrawStageEnemy()

	result := EnemyPokemons

	if len(result) != 3 {
		t.Errorf("Expected 3 pokemons, got %d", len(result))
	} else {
		for _, pokemon := range result {
			pokemon.GetStats()
			for _, move := range pokemon.Moves {
				t.Logf("Move: %s", move.KoName)
			}
			t.Log("--------------------------------")
		}
	}
}
