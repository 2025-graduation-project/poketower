package model

type PokemonType struct {
	PokemonID int     `gorm:"primaryKey"`
	TypeID    int     `gorm:"primaryKey"`
	Pokemon   Pokemon `gorm:"foreignKey:PokemonID"`
	Type      Type    `gorm:"foreignKey:TypeID"`
}

func (PokemonType) TableName() string {
	return "pokemon_types"
}
