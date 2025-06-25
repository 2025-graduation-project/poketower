package model

type Type struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"not null" json:"name"`
}

func (Type) TableName() string {
	return "type"
}
