package model

type PokemonMove struct {
	PokemonID int     `gorm:"primaryKey"`
	MoveID    int     `gorm:"primaryKey"`
	Pokemon   Pokemon `gorm:"foreignKey:PokemonID"`
	Move      Move    `gorm:"foreignKey:MoveID"`
}

func (PokemonMove) TableName() string {
	return "pokemon_moves"
}
