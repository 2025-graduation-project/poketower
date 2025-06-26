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

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
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
