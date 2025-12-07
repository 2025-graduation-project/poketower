package battle

import (
	"poketower-client/service/database"
	"poketower-client/service/model"
	"testing"

	"gorm.io/gorm"
)

func TestBattleSystem(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// 스타팅 포켓몬 직접 조회 및 설정
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

	t.Logf("Player Pokemons: %d", len(PlayerPokemons))
	for i, p := range PlayerPokemons {
		t.Logf("[%d] %s (HP: %d, Moves: %d)", i, p.Name, p.HP, len(p.Moves))
	}

	// 스테이지 타입 추첨
	stageType, err := DrawStageType()
	if err != nil {
		t.Fatalf("Failed to draw stage type: %v", err)
	}
	CurrentStageType = stageType
	t.Logf("Stage Type: %s", stageType.Name)

	// 적 포켓몬 생성
	DrawStageEnemy()
	t.Logf("Enemy Pokemons: %d", len(EnemyPokemons))
	for i, p := range EnemyPokemons {
		t.Logf("[%d] %s (HP: %d, Moves: %d)", i, p.Name, p.HP, len(p.Moves))
	}

	// 배틀 초기화
	err = InitBattle()
	if err != nil {
		t.Fatalf("Failed to init battle: %v", err)
	}

	t.Logf("Battle initialized. First turn: %v", CurrentBattle.IsPlayerTurn)

	// 배틀 시뮬레이션 (최대 50턴)
	turnCount := 0
	maxTurns := 50

	for CurrentBattle.IsActive && turnCount < maxTurns {
		turnCount++
		t.Logf("\n=== Turn %d ===", turnCount)

		logsBefore := len(CurrentBattle.BattleLogs)

		if CurrentBattle.WaitingForSwitch {
			// 포켓몬 교체 필요
			nextIndex := GetNextAlivePokemonIndex(PlayerPokemons, CurrentBattle.PlayerCurrentIndex)
			if nextIndex != -1 {
				t.Logf("Switching to pokemon at index %d", nextIndex)
				err := SwitchPlayerPokemon(nextIndex)
				if err != nil {
					t.Logf("Error: %v", err)
				}
			}
		} else if CurrentBattle.IsPlayerTurn {
			// 플레이어 턴
			attacker := GetCurrentPlayerPokemon()
			if attacker != nil && len(attacker.Moves) > 0 {
				t.Logf("Player's %s uses %s", attacker.Name, attacker.Moves[0].KoName)
				err := PlayerUseMove(0)
				if err != nil {
					t.Logf("Error: %v", err)
				}
			}
		} else {
			// 적 턴 (자동 실행되어야 하지만 명시적으로 호출)
			t.Logf("Enemy turn (should be auto-executed)")
		}

		// 새로 추가된 로그 출력
		for i := logsBefore; i < len(CurrentBattle.BattleLogs); i++ {
			log := CurrentBattle.BattleLogs[i]
			t.Logf("Log: %s", log.Message)
			if log.Damage > 0 {
				t.Logf("  Damage: %d, Effectiveness: %.1f, Critical: %v", log.Damage, log.Effectiveness, log.IsCritical)
			}
		}
	}

	t.Logf("\n=== Battle Result: %s ===", CurrentBattle.BattleResult)
	t.Logf("Total turns: %d", turnCount)

	// 최종 상태 출력
	t.Logf("\nPlayer Pokemons:")
	for i, p := range PlayerPokemons {
		t.Logf("[%d] %s (HP: %d/%d)", i, p.Name, p.HP, p.MaxHP)
	}

	t.Logf("\nEnemy Pokemons:")
	for i, p := range EnemyPokemons {
		t.Logf("[%d] %s (HP: %d/%d)", i, p.Name, p.HP, p.MaxHP)
	}
}
