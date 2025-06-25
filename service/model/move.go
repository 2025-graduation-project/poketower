package model

type Move struct {
	ID       int    `gorm:"primaryKey;autoIncrement"`
	EnName   string `gorm:"not null"`
	KoName   string `gorm:"not null"`
	Category int    `gorm:"not null"`
	TypeID   int    `gorm:"not null"`
	Type     Type   `gorm:"foreignKey:TypeID"`
	Power    *uint8 // nullable
	Accuracy *uint8 // nullable
	PP       int    `gorm:"not null"`
}

func (Move) TableName() string {
	return "moves"
}
