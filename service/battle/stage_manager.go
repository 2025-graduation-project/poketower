package battle

import (
	"errors"
	"fmt"
	"poketower-client/service/model"
)

const (
	FloorsPerStage = 5 // 스테이지당 층 수
)

// StageState 스테이지 상태
type StageState struct {
	StageNumber        int             `json:"stageNumber"`        // 현재 스테이지 번호
	CurrentFloor       int             `json:"currentFloor"`       // 현재 층 (1~5)
	StageType          model.Type      `json:"stageType"`          // 현재 스테이지 타입
	NextStageType      model.Type      `json:"nextStageType"`      // 다음 스테이지 타입
	EncounteredPokemon []model.Pokemon `json:"encounteredPokemon"` // 이번 스테이지에서 출현한 포켓몬 (최대 15마리)
	IsStageActive      bool            `json:"isStageActive"`      // 스테이지 진행 중 여부
}

var CurrentStageState *StageState

// InitGame 게임 초기화
func InitGame() error {
	// 첫 스테이지 타입 추첨
	stageType, err := DrawStageType()
	if err != nil {
		return fmt.Errorf("failed to draw stage type: %w", err)
	}

	CurrentStageState = &StageState{
		StageNumber:        1,
		CurrentFloor:       1,
		StageType:          stageType,
		EncounteredPokemon: []model.Pokemon{},
		IsStageActive:      true,
	}

	CurrentStageType = stageType
	CurrentStage = 1

	// 다음 스테이지 타입 미리 추첨
	nextType, err := DrawStageType()
	if err != nil {
		return fmt.Errorf("failed to draw next stage type: %w", err)
	}
	CurrentStageState.NextStageType = nextType

	return nil
}

// StartFloor 층 시작 (적 포켓몬 생성 및 배틀 준비)
func StartFloor() error {
	if CurrentStageState == nil {
		return errors.New("스테이지가 초기화되지 않았습니다")
	}

	if !CurrentStageState.IsStageActive {
		return errors.New("스테이지가 활성화되지 않았습니다")
	}

	// 적 포켓몬 생성
	DrawStageEnemy()

	// 출현한 포켓몬을 기록 (스킬셋이 고정된 상태로 저장)
	for _, enemy := range EnemyPokemons {
		// 깊은 복사를 위해 새로운 포켓몬 생성
		pokemonCopy := model.Pokemon{
			ID:         enemy.ID,
			Name:       enemy.Name,
			HP:         enemy.MaxHP, // 원래 체력으로 저장
			MaxHP:      enemy.MaxHP,
			Attack:     enemy.Attack,
			Defense:    enemy.Defense,
			SpAttack:   enemy.SpAttack,
			SpDefense:  enemy.SpDefense,
			Speed:      enemy.Speed,
			IsStarting: enemy.IsStarting,
			IsLegend:   enemy.IsLegend,
			Types:      enemy.Types,
			Moves:      make([]model.Move, len(enemy.Moves)),
		}
		copy(pokemonCopy.Moves, enemy.Moves)

		CurrentStageState.EncounteredPokemon = append(CurrentStageState.EncounteredPokemon, pokemonCopy)
	}

	return nil
}

// CompleteFloor 층 완료 처리
func CompleteFloor() error {
	if CurrentStageState == nil {
		return errors.New("스테이지가 초기화되지 않았습니다")
	}

	if CurrentBattle == nil || CurrentBattle.BattleResult != "win" {
		return errors.New("배틀에서 승리하지 못했습니다")
	}

	// 플레이어 포켓몬 체력 회복
	for i := range PlayerPokemons {
		PlayerPokemons[i].Heal()
	}

	CurrentStageState.CurrentFloor++

	// 스테이지 완료 확인 (5층 클리어)
	if CurrentStageState.CurrentFloor > FloorsPerStage {
		return nil // 스테이지 완료, CompleteStage 호출 필요
	}

	return nil
}

// CompleteStage 스테이지 완료 처리
func CompleteStage() error {
	if CurrentStageState == nil {
		return errors.New("스테이지가 초기화되지 않았습니다")
	}

	if CurrentStageState.CurrentFloor <= FloorsPerStage {
		return errors.New("스테이지가 아직 완료되지 않았습니다")
	}

	// 다음 스테이지 준비
	CurrentStageState.StageNumber++
	CurrentStageState.CurrentFloor = 1
	CurrentStageState.StageType = CurrentStageState.NextStageType
	CurrentStageType = CurrentStageState.NextStageType

	// 출현 포켓몬 초기화 (PC 저장은 별도 처리)
	CurrentStageState.EncounteredPokemon = []model.Pokemon{}

	// 다음 스테이지 타입 미리 추첨
	nextType, err := DrawStageType()
	if err != nil {
		return fmt.Errorf("failed to draw next stage type: %w", err)
	}
	CurrentStageState.NextStageType = nextType

	CurrentStage = CurrentStageState.StageNumber

	return nil
}

// FailStage 스테이지 실패 처리
func FailStage() error {
	if CurrentStageState == nil {
		return errors.New("스테이지가 초기화되지 않았습니다")
	}

	if CurrentBattle == nil || CurrentBattle.BattleResult != "lose" {
		return errors.New("배틀에서 패배하지 않았습니다")
	}

	CurrentStageState.IsStageActive = false

	return nil
}

// GetStageState 현재 스테이지 상태 반환
func GetStageState() *StageState {
	return CurrentStageState
}

// GetEncounteredPokemon 출현한 포켓몬 목록 반환
func GetEncounteredPokemon() []model.Pokemon {
	if CurrentStageState == nil {
		return []model.Pokemon{}
	}
	return CurrentStageState.EncounteredPokemon
}

// GetCurrentFloorNumber 현재 총 층 수 반환 (스테이지 번호 * 5 + 현재 층 - 5)
func GetCurrentFloorNumber() int {
	if CurrentStageState == nil {
		return 0
	}
	return (CurrentStageState.StageNumber-1)*FloorsPerStage + CurrentStageState.CurrentFloor
}

// SelectPokemonsForNextStage 다음 스테이지용 포켓몬 선택
func SelectPokemonsForNextStage(pokemonIDs []int) error {
	if len(pokemonIDs) != 3 {
		return errors.New("정확히 3마리의 포켓몬을 선택해야 합니다")
	}

	selectedPokemons := make([]model.Pokemon, 0, 3)

	for _, id := range pokemonIDs {
		found := false
		for _, pokemon := range PlayerPC {
			if pokemon.ID == id {
				// 체력 회복된 상태로 복사
				pokemonCopy := pokemon
				pokemonCopy.HP = pokemonCopy.MaxHP
				selectedPokemons = append(selectedPokemons, pokemonCopy)
				found = true
				break
			}
		}
		if !found {
			return fmt.Errorf("PC에서 포켓몬 ID %d를 찾을 수 없습니다", id)
		}
	}

	PlayerPokemons = selectedPokemons

	return nil
}
