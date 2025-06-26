package main

import (
	"context"
	"fmt"
	"poketower-client/service/battle"
	"poketower-client/service/database"
	"poketower-client/service/model"
	"poketower-client/service/pokemon"
)

// App struct
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetStartingPokemons() []model.Pokemon {
	_, err := database.OpenDb()
	if err != nil {
		fmt.Println("Failed to connect to the database:", err)
		return nil
	}

	result := pokemon.GetStartingPokemons()

	return result
}

func (a *App) ChooseStarting(id []int) {
	pokemon.ChooseStarting(id)
}

func (a *App) GetCurrentPokemon() []model.Pokemon {
	return battle.PlayerPokemons
}
