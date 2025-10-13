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
