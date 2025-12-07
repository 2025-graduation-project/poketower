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
