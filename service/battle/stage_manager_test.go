package battle

import (
	"poketower-client/service/database"
	"poketower-client/service/model"
	"testing"

	"gorm.io/gorm"
)

func TestStageSystem(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// 스타팅 포켓몬 설정
	var startingPokemons []model.Pokemon
	if err := database.DB.Preload("Types").Preload("Moves", func(db *gorm.DB) *gorm.DB {
		return db.Where("category <> ?", 3).Where("power IS NOT NULL")
	}).Preload("Moves.Type").Where("is_starting = ?", true).Limit(3).Find(&startingPokemons).Error; err != nil {
		t.Fatalf("Failed to find starting pokemons: %v", err)
	}

	for i := range startingPokemons {
		startingPokemons[i].SetInitialStats()
	}

	PlayerPokemons = startingPokemons
	PlayerPC = startingPokemons

	t.Logf("Starting Pokemons: %d", len(PlayerPokemons))

	// 게임 초기화
	err = InitGame()
	if err != nil {
		t.Fatalf("Failed to init game: %v", err)
	}

	stageState := GetStageState()
	t.Logf("Game initialized - Stage: %d, Floor: %d, Type: %s",
		stageState.StageNumber, stageState.CurrentFloor, stageState.StageType.Name)
	t.Logf("Next Stage Type: %s", stageState.NextStageType.Name)

	// 5층 시뮬레이션
	for floor := 1; floor <= 5; floor++ {
		t.Logf("\n=== Stage %d - Floor %d ===", stageState.StageNumber, floor)

		// 층 시작
		err = StartFloor()
		if err != nil {
			t.Fatalf("Failed to start floor: %v", err)
		}

		t.Logf("Enemy Pokemons: %d", len(EnemyPokemons))
		for i, p := range EnemyPokemons {
			t.Logf("  [%d] %s (HP: %d)", i, p.Name, p.HP)
		}

		t.Logf("Encountered so far: %d", len(GetEncounteredPokemon()))

		// 배틀 초기화
		err = InitBattle()
		if err != nil {
			t.Fatalf("Failed to init battle: %v", err)
		}

		// 배틀 시뮬레이션 (간단히 승리로 설정)
		// 실제로는 배틀을 진행해야 하지만, 테스트를 위해 강제 승리
		CurrentBattle.BattleResult = "win"
		CurrentBattle.IsActive = false

		// 층 완료
		err = CompleteFloor()
		if err != nil {
			t.Fatalf("Failed to complete floor: %v", err)
		}

		t.Logf("Floor %d completed", floor)
		t.Logf("Current Floor after completion: %d", stageState.CurrentFloor)
	}

	// 스테이지 완료 확인
	if stageState.CurrentFloor > FloorsPerStage {
		t.Logf("\n=== Stage %d Completed ===", stageState.StageNumber)
		t.Logf("Total Encountered Pokemons: %d", len(GetEncounteredPokemon()))

		// 출현한 포켓몬 출력
		encountered := GetEncounteredPokemon()
		for i, p := range encountered {
			t.Logf("  [%d] %s (Moves: %d)", i, p.Name, len(p.Moves))
		}

		// 5마리 선택하여 PC에 추가
		if len(encountered) >= 5 {
			indices := []int{0, 1, 2, 3, 4}
			err = SelectPokemonsFromEncountered(indices)
			if err != nil {
				t.Fatalf("Failed to select pokemons: %v", err)
			}

			t.Logf("\nPC Count after selection: %d", GetPCCount())
		}

		// 스테이지 완료 처리
		err = CompleteStage()
		if err != nil {
			t.Fatalf("Failed to complete stage: %v", err)
		}

		t.Logf("\n=== Next Stage ===")
		t.Logf("Stage Number: %d", stageState.StageNumber)
		t.Logf("Current Floor: %d", stageState.CurrentFloor)
		t.Logf("Stage Type: %s", stageState.StageType.Name)
		t.Logf("Next Stage Type: %s", stageState.NextStageType.Name)
		t.Logf("Encountered Pokemons (reset): %d", len(GetEncounteredPokemon()))
	}

	// PC 조회 테스트
	t.Logf("\n=== PC Management ===")
	pcPokemons := GetPCPokemons()
	t.Logf("Total PC Pokemons: %d", len(pcPokemons))

	sortedPokemons := GetPCPokemonsSortedByID()
	t.Logf("Sorted by ID:")
	for i, p := range sortedPokemons {
		t.Logf("  [%d] #%d %s", i, p.ID, p.Name)
	}

	// 타입별 그룹화
	grouped := GetPCPokemonsByTypeGrouped()
	t.Logf("\nGrouped by Type:")
	for typeName, pokemons := range grouped {
		t.Logf("  %s: %d pokemons", typeName, len(pokemons))
	}
}

func TestPCSelection(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// PC 초기화
	ClearPC()

	// 스타팅 포켓몬 설정
	var startingPokemons []model.Pokemon
	if err := database.DB.Preload("Types").Preload("Moves", func(db *gorm.DB) *gorm.DB {
		return db.Where("category <> ?", 3).Where("power IS NOT NULL")
	}).Preload("Moves.Type").Where("is_starting = ?", true).Limit(6).Find(&startingPokemons).Error; err != nil {
		t.Fatalf("Failed to find starting pokemons: %v", err)
	}

	for i := range startingPokemons {
		startingPokemons[i].SetInitialStats()
	}

	// PC에 추가
	err = AddPokemonToPC(startingPokemons)
	if err != nil {
		t.Fatalf("Failed to add pokemons to PC: %v", err)
	}

	t.Logf("PC Count: %d", GetPCCount())

	// 다음 스테이지용 포켓몬 선택
	pokemonIDs := []int{startingPokemons[0].ID, startingPokemons[1].ID, startingPokemons[2].ID}
	err = SelectPokemonsForNextStage(pokemonIDs)
	if err != nil {
		t.Fatalf("Failed to select pokemons for next stage: %v", err)
	}

	t.Logf("Selected Pokemons for next stage: %d", len(PlayerPokemons))
	for i, p := range PlayerPokemons {
		t.Logf("  [%d] %s (HP: %d/%d)", i, p.Name, p.HP, p.MaxHP)
	}
}
