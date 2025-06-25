package model

type Move struct {
	ID       int    `gorm:"primaryKey;autoIncrement" json:"id"`
	EnName   string `gorm:"not null" json:"enName"`
	KoName   string `gorm:"not null" json:"koName"`
	Category int    `gorm:"not null" json:"category"`
	TypeID   int    `gorm:"not null" json:"typeId"`
	Type     Type   `gorm:"foreignKey:TypeID" json:"type"`
	Power    *uint8 `json:"power"`    // nullable
	Accuracy *uint8 `json:"accuracy"` // nullable
	PP       int    `gorm:"not null" json:"pp"`
}

func (Move) TableName() string {
	return "moves"
}
