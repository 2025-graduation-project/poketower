package model

type Type struct {
	ID   int    `gorm:"primaryKey;autoIncrement"`
	Name string `gorm:"not null"`
}

func (Type) TableName() string {
	return "type"
}
