package battle

import (
	"poketower-client/service/database"
	"poketower-client/service/leaderboard"
	"poketower-client/service/model"
	"testing"

	"gorm.io/gorm"
)

// TestGameFlow 전체 게임 플로우 테스트
func TestGameFlow(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// 리더보드 초기화
	err = leaderboard.InitLeaderboard()
	if err != nil {
		t.Fatalf("Failed to init leaderboard: %v", err)
	}

	t.Log("\n=== 1. 게임 시작 ===")

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

	t.Logf("Starting Pokemons: %s, %s, %s",
		PlayerPokemons[0].Name, PlayerPokemons[1].Name, PlayerPokemons[2].Name)

	t.Log("\n=== 2. 게임 초기화 ===")

	// 게임 초기화
	err = InitGame()
	if err != nil {
		t.Fatalf("Failed to init game: %v", err)
	}

	stageState := GetStageState()
	t.Logf("Stage %d, Floor %d, Type: %s",
		stageState.StageNumber, stageState.CurrentFloor, stageState.StageType.Name)

	t.Log("\n=== 3. 1층 ~ 5층 진행 ===")

	// 5층까지 진행
	for floor := 1; floor <= 5; floor++ {
		t.Logf("\n--- Floor %d ---", floor)

		// 층 시작
		err = StartFloor()
		if err != nil {
			t.Fatalf("Failed to start floor: %v", err)
		}

		t.Logf("Enemies: %s, %s, %s",
			EnemyPokemons[0].Name, EnemyPokemons[1].Name, EnemyPokemons[2].Name)

		// 배틀 초기화
		err = InitBattle()
		if err != nil {
			t.Fatalf("Failed to init battle: %v", err)
		}

		// 배틀 승리로 설정 (테스트용)
		CurrentBattle.BattleResult = "win"
		CurrentBattle.IsActive = false

		// 층 완료
		err = CompleteFloor()
		if err != nil {
			t.Fatalf("Failed to complete floor: %v", err)
		}

		t.Logf("Floor %d completed", floor)
	}

	t.Log("\n=== 4. 15마리 중 5마리 선택하여 PC에 저장 ===")

	encountered := GetEncounteredPokemon()
	t.Logf("Total encountered: %d", len(encountered))

	// 5마리 선택
	err = SelectPokemonsFromEncountered([]int{0, 1, 2, 3, 4})
	if err != nil {
		t.Fatalf("Failed to select pokemons: %v", err)
	}

	t.Logf("PC Count: %d", GetPCCount())

	t.Log("\n=== 5. 스테이지 완료 및 다음 스테이지 준비 ===")

	// 스테이지 완료
	err = CompleteStage()
	if err != nil {
		t.Fatalf("Failed to complete stage: %v", err)
	}

	t.Logf("Stage %d, Floor %d, Type: %s",
		stageState.StageNumber, stageState.CurrentFloor, stageState.StageType.Name)

	t.Log("\n=== 6. PC에서 3마리 선택하여 6~10층 시작 ===")

	// PC에서 3마리 선택
	pcPokemons := GetPCPokemons()
	if len(pcPokemons) >= 3 {
		pokemonIDs := []int{pcPokemons[0].ID, pcPokemons[1].ID, pcPokemons[2].ID}
		err = SelectPokemonsForNextStage(pokemonIDs)
		if err != nil {
			t.Fatalf("Failed to select pokemons for next stage: %v", err)
		}

		t.Logf("Selected: %s, %s, %s",
			PlayerPokemons[0].Name, PlayerPokemons[1].Name, PlayerPokemons[2].Name)
	}

	// 6층 시작
	err = StartFloor()
	if err != nil {
		t.Fatalf("Failed to start floor 6: %v", err)
	}

	t.Logf("Floor 6 started with enemies: %s, %s, %s",
		EnemyPokemons[0].Name, EnemyPokemons[1].Name, EnemyPokemons[2].Name)

	t.Log("\n=== 7. 전투 불능 시 게임 종료 테스트 ===")

	// 배틀 초기화
	err = InitBattle()
	if err != nil {
		t.Fatalf("Failed to init battle: %v", err)
	}

	// 모든 포켓몬 전투 불능 상태로 만들기
	for i := range PlayerPokemons {
		PlayerPokemons[i].HP = 0
	}

	// 배틀 종료 확인
	CheckBattleEnd()

	if CurrentBattle.BattleResult != "lose" {
		t.Errorf("Expected battle result 'lose', got '%s'", CurrentBattle.BattleResult)
	}

	t.Log("Battle lost - all pokemons fainted")

	// 스테이지 실패 처리 (리더보드 저장)
	err = FailStage()
	if err != nil {
		t.Fatalf("Failed to fail stage: %v", err)
	}

	t.Log("Stage failed and saved to leaderboard")

	// 리더보드 확인
	currentFloor := GetCurrentFloorNumber()
	t.Logf("Failed at floor: %d", currentFloor)

	// 리더보드 조회
	entries, err := leaderboard.GetTopLeaderboard(5)
	if err != nil {
		t.Fatalf("Failed to get leaderboard: %v", err)
	}

	t.Log("\n=== Leaderboard ===")
	for i, entry := range entries {
		t.Logf("[%d] Floor %d | %s, %s, %s | %s",
			i+1, entry.Floor, entry.Pokemon1, entry.Pokemon2, entry.Pokemon3,
			entry.EndTime.Format("2006-01-02 15:04:05"))
	}

	t.Log("\n=== Game Flow Test Completed ===")
}
