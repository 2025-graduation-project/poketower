package model

import (
	"fmt"
	"math/rand"
	"poketower-client/service/stat"
)

type Pokemon struct {
	ID         int    `gorm:"primaryKey"`
	Name       string `gorm:"not null"`
	HP         uint16 `gorm:"not null"`
	Attack     uint16 `gorm:"not null"`
	Defense    uint16 `gorm:"not null"`
	SpAttack   uint16 `gorm:"column:sp_attack;not null"`
	SpDefense  uint16 `gorm:"column:sp_defense;not null"`
	Speed      uint16 `gorm:"not null"`
	IsStarting bool   `gorm:"column:is_starting;default:false"`
	IsLegend   bool   `gorm:"column:is_legend;default:false"`

	Types []Type `gorm:"many2many:pokemon_types"`
	Moves []Move `gorm:"many2many:pokemon_moves"`

	MaxHP uint16 `gorm:"-"`
}

func (p *Pokemon) SetInitialStats() {
	p.HP = stat.CalcHpStat(p.HP, 50)
	p.MaxHP = p.HP
	p.Attack = stat.CalcStat(p.Attack, 50)
	p.Defense = stat.CalcStat(p.Defense, 50)
	p.SpAttack = stat.CalcStat(p.SpAttack, 50)
	p.SpDefense = stat.CalcStat(p.SpDefense, 50)
	p.Speed = stat.CalcStat(p.Speed, 50)

	numAvailableMoves := len(p.Moves)

	if numAvailableMoves <= 4 {
		return
	}

	movesCopy := make([]Move, numAvailableMoves)
	copy(movesCopy, p.Moves)

	rand.Shuffle(numAvailableMoves, func(i, j int) {
		movesCopy[i], movesCopy[j] = movesCopy[j], movesCopy[i]
	})

	numToSet := min(numAvailableMoves, 4)

	p.Moves = movesCopy[:numToSet]
}

func (p *Pokemon) Heal() {
	p.HP = p.MaxHP
	fmt.Printf("%s의 체력이 회복되었습니다. 현재 체력: %d\n", p.Name, p.HP)
}

func (p Pokemon) GetStats() {
	fmt.Println("이름:", p.Name)
	fmt.Println("레벨:", 50)
	fmt.Println("체력:", p.HP)
	fmt.Println("공격:", p.Attack)
	fmt.Println("방어력:", p.Defense)
	fmt.Println("특수공격:", p.SpAttack)
	fmt.Println("특수방어:", p.SpDefense)
	fmt.Println("속도:", p.Speed)
}

func (p *Pokemon) DecreaseHealth(damage uint16) {
	currentHealth := p.HP

	if damage >= currentHealth {
		p.HP = 0
		return
	}

	p.HP -= damage

	fmt.Printf("%s 체력 감소: %d >> %d\n\n", p.Name, currentHealth, p.HP)
}

func (Pokemon) TableName() string {
	return "pokemons"
}
