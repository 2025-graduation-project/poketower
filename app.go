package main

import (
	"context"
	"fmt"
	"poketower-client/service/battle"
	"poketower-client/service/database"
	"poketower-client/service/model"
	"poketower-client/service/pokemon"
	"time"
)

// App struct
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	_, err := database.OpenDb()
	if err != nil {
		fmt.Println("Failed to connect to the database:", err)
		panic(err)
	}
	a.ctx = ctx
}

// TODO: 추첨 변경 후 삭제
func (a *App) GetStartingPokemons() []model.Pokemon {
	result := pokemon.GetStartingPokemons()

	return result
}

// TODO: 추첨 변경 후 삭제
func (a *App) ChooseStarting(id []int) {
	pokemon.ChooseStarting(id)
}

func (a *App) DrawStarting() []model.Pokemon {
	pokemon.DrawStarting()
	time.Sleep(5 * time.Second)

	return battle.PlayerPokemons
}

func (a *App) GetCurrentPokemon() []model.Pokemon {
	return battle.PlayerPokemons
}

// Battle API

// InitBattle 배틀 초기화
func (a *App) InitBattle() error {
	return battle.InitBattle()
}

// GetBattleState 현재 배틀 상태 조회
func (a *App) GetBattleState() *battle.BattleState {
	return battle.GetBattleState()
}

// PlayerUseMove 플레이어가 기술 사용
func (a *App) PlayerUseMove(moveIndex int) error {
	return battle.PlayerUseMove(moveIndex)
}

// SwitchPlayerPokemon 플레이어 포켓몬 교체
func (a *App) SwitchPlayerPokemon(pokemonIndex int) error {
	return battle.SwitchPlayerPokemon(pokemonIndex)
}

// GetPlayerPokemons 플레이어 포켓몬 목록 조회
func (a *App) GetPlayerPokemons() []model.Pokemon {
	return battle.PlayerPokemons
}

// GetEnemyPokemons 적 포켓몬 목록 조회
func (a *App) GetEnemyPokemons() []model.Pokemon {
	return battle.EnemyPokemons
}

// Stage API

// InitGame 게임 초기화
func (a *App) InitGame() error {
	return battle.InitGame()
}

// StartFloor 층 시작
func (a *App) StartFloor() error {
	return battle.StartFloor()
}

// CompleteFloor 층 완료
func (a *App) CompleteFloor() error {
	return battle.CompleteFloor()
}

// CompleteStage 스테이지 완료
func (a *App) CompleteStage() error {
	return battle.CompleteStage()
}

// FailStage 스테이지 실패
func (a *App) FailStage() error {
	return battle.FailStage()
}

// GetStageState 스테이지 상태 조회
func (a *App) GetStageState() *battle.StageState {
	return battle.GetStageState()
}

// GetEncounteredPokemon 출현한 포켓몬 목록 조회
func (a *App) GetEncounteredPokemon() []model.Pokemon {
	return battle.GetEncounteredPokemon()
}

// GetCurrentFloorNumber 현재 총 층 수 조회
func (a *App) GetCurrentFloorNumber() int {
	return battle.GetCurrentFloorNumber()
}

// SelectPokemonsForNextStage 다음 스테이지용 포켓몬 선택
func (a *App) SelectPokemonsForNextStage(pokemonIDs []int) error {
	return battle.SelectPokemonsForNextStage(pokemonIDs)
}

// PC API

// GetPCPokemons PC 포켓몬 목록 조회
func (a *App) GetPCPokemons() []model.Pokemon {
	return battle.GetPCPokemons()
}

// GetPCPokemonsSortedByID PC 포켓몬 도감번호순 조회
func (a *App) GetPCPokemonsSortedByID() []model.Pokemon {
	return battle.GetPCPokemonsSortedByID()
}

// GetPCPokemonsByType PC 포켓몬 타입별 조회
func (a *App) GetPCPokemonsByType(typeID int) []model.Pokemon {
	return battle.GetPCPokemonsByType(typeID)
}

// GetPCPokemonsByTypeGrouped PC 포켓몬 타입별 그룹화 조회
func (a *App) GetPCPokemonsByTypeGrouped() map[string][]model.Pokemon {
	return battle.GetPCPokemonsByTypeGrouped()
}

// SelectPokemonsFromEncountered 출현한 포켓몬 중 선택하여 PC에 추가
func (a *App) SelectPokemonsFromEncountered(indices []int) error {
	return battle.SelectPokemonsFromEncountered(indices)
}

// GetPCCount PC 포켓몬 수 조회
func (a *App) GetPCCount() int {
	return battle.GetPCCount()
}
