package battle

import "poketower-client/service/model"

const (
	TypeNormal = iota + 1
	TypeFire
	TypeWater
	TypeElectric
	TypeGrass
	TypeIce
	TypeFighting
	TypePoison
	TypeGround
	TypeFlying
	TypePsychic
	TypeBug
	TypeRock
	TypeGhost
	TypeDragon
	TypeDark
	TypeSteel
	TypeFairy
)

var typeChart [19][19]float32

func init() {
	for i := range typeChart {
		for j := range typeChart[i] {
			typeChart[i][j] = 1.0
		}
	}

	setEffectiveness(2.0, map[int][]int{
		TypeFire:     {TypeGrass, TypeIce, TypeBug, TypeSteel},
		TypeWater:    {TypeFire, TypeGround, TypeRock},
		TypeElectric: {TypeWater, TypeFlying},
		TypeGrass:    {TypeWater, TypeGround, TypeRock},
		TypeIce:      {TypeGrass, TypeGround, TypeFlying, TypeDragon},
		TypeFighting: {TypeNormal, TypeIce, TypeRock, TypeDark, TypeSteel},
		TypePoison:   {TypeGrass, TypeFairy},
		TypeGround:   {TypeFire, TypeElectric, TypePoison, TypeRock, TypeSteel},
		TypeFlying:   {TypeGrass, TypeFighting, TypeBug},
		TypePsychic:  {TypeFighting, TypePoison},
		TypeBug:      {TypeGrass, TypePsychic, TypeDark},
		TypeRock:     {TypeFire, TypeIce, TypeFlying, TypeBug},
		TypeGhost:    {TypePsychic, TypeGhost},
		TypeDragon:   {TypeDragon},
		TypeDark:     {TypePsychic, TypeGhost},
		TypeSteel:    {TypeIce, TypeRock, TypeFairy},
		TypeFairy:    {TypeFighting, TypeDragon, TypeDark},
	})

	setEffectiveness(0.5, map[int][]int{
		TypeNormal:   {TypeRock, TypeSteel},
		TypeFire:     {TypeFire, TypeWater, TypeRock, TypeDragon},
		TypeWater:    {TypeWater, TypeGrass, TypeDragon},
		TypeElectric: {TypeElectric, TypeGrass, TypeDragon},
		TypeGrass:    {TypeFire, TypeGrass, TypePoison, TypeFlying, TypeBug, TypeDragon, TypeSteel},
		TypeIce:      {TypeFire, TypeWater, TypeIce, TypeSteel},
		TypeFighting: {TypePoison, TypeFlying, TypePsychic, TypeBug, TypeFairy},
		TypePoison:   {TypePoison, TypeGround, TypeRock, TypeGhost},
		TypeGround:   {TypeGrass, TypeBug},
		TypeFlying:   {TypeElectric, TypeRock, TypeSteel},
		TypePsychic:  {TypePsychic, TypeSteel},
		TypeBug:      {TypeFire, TypeFighting, TypePoison, TypeFlying, TypeGhost, TypeSteel, TypeFairy},
		TypeRock:     {TypeFighting, TypeGround, TypeSteel},
		TypeGhost:    {TypeDark},
		TypeDragon:   {TypeSteel},
		TypeDark:     {TypeFighting, TypeDark, TypeFairy},
		TypeSteel:    {TypeFire, TypeWater, TypeElectric, TypeSteel},
		TypeFairy:    {TypeFire, TypePoison, TypeSteel},
	})

	setEffectiveness(0.0, map[int][]int{
		TypeNormal:   {TypeGhost},
		TypeElectric: {TypeGround},
		TypeFighting: {TypeGhost},
		TypePoison:   {TypeSteel},
		TypeGround:   {TypeFlying},
		TypePsychic:  {TypeDark},
		TypeGhost:    {TypeNormal},
		TypeDragon:   {TypeFairy},
	})
}

func setEffectiveness(multiplier float32, relationships map[int][]int) {
	for attacker, defenders := range relationships {
		for _, defender := range defenders {
			typeChart[attacker][defender] = multiplier
		}
	}
}

// CalculateMultiplier 타입 상성 배율 계산
func CalculateMultiplier(attackingType model.Type, defendingTypes []model.Type) float32 {
	if len(defendingTypes) == 0 {
		return 1.0
	}

	totalMultiplier := float32(1.0)
	for _, defendingType := range defendingTypes {
		multiplier := typeChart[attackingType.ID][defendingType.ID]
		totalMultiplier *= multiplier
	}

	return totalMultiplier
}
