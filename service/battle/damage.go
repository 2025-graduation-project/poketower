package battle

import (
	"fmt"
	"math/rand"
	"poketower-client/service/model"
)

type weightedValue struct {
	value  uint8
	weight float64
}

// getRandomDamageModifier 랜덤 데미지 보정값 (85~100)
func getRandomDamageModifier() uint8 {
	values := []weightedValue{
		{85, 7.69}, {86, 5.13}, {87, 7.69}, {88, 5.13}, {89, 7.69},
		{90, 7.69}, {91, 5.13}, {92, 7.69}, {93, 5.13}, {94, 7.69},
		{95, 5.13}, {96, 7.69}, {97, 5.13}, {98, 7.69}, {99, 5.13},
		{100, 2.56},
	}

	total := 0.0
	for _, v := range values {
		total += v.weight
	}

	r := rand.Float64() * total
	cumulative := 0.0
	for _, v := range values {
		cumulative += v.weight
		if r < cumulative {
			return v.value
		}
	}

	return 100
}

// isCriticalHit 급소 판정 (1/24 확률)
func isCriticalHit() bool {
	return rand.Intn(24) == 0
}

// calcDamage 데미지 계산
func calcDamage(skill model.Move, attacker, defender model.Pokemon) uint16 {
	// 위력이 없는 기술은 데미지 0
	if skill.Power == nil || *skill.Power == 0 {
		return 0
	}

	var mod1 float32 = 1.0
	var mod2 float32 = 1.0
	var mod3 float32 = 1.0

	attackStat := attacker.Attack
	defenseStat := defender.Defense

	// 특수 기술인 경우
	if skill.Category == 2 {
		attackStat = attacker.SpAttack
		defenseStat = defender.SpDefense
	}

	var stab float32 = 1.0
	var critical float32 = 1.0

	// STAB (Same Type Attack Bonus)
	for _, pokemonType := range attacker.Types {
		if pokemonType.ID == skill.Type.ID {
			stab = 1.5
			break
		}
	}

	// 급소 판정
	if isCriticalHit() {
		critical = 1.5
	}

	randomValue := uint16(getRandomDamageModifier())

	level := float32(50)
	power := float32(*skill.Power)
	atk := float32(attackStat)
	def := float32(defenseStat)
	randomF := float32(randomValue)
	typeEffect := CalculateMultiplier(skill.Type, defender.Types)

	base := ((level * 2.0 / 5.0) + 2.0) * power * atk / 50.0 / def * mod1
	preMod := (base + 2.0) * critical * mod2 * randomF / 100.0
	result := preMod * stab * typeEffect * mod3

	damage := uint16(result)
	if damage < 1 && typeEffect > 0 {
		damage = 1
	}

	return damage
}

// Attack 공격 실행
func Attack(skill model.Move, attacker model.Pokemon, defender *model.Pokemon) (uint16, float32, bool) {
	damage := calcDamage(skill, attacker, *defender)
	typeEffect := CalculateMultiplier(skill.Type, defender.Types)
	isCrit := isCriticalHit()

	fmt.Printf("%s의 %s 공격 (데미지: %d)\n", attacker.Name, skill.KoName, damage)

	defender.DecreaseHealth(damage)

	return damage, typeEffect, isCrit
}

// GetEffectivenessMessage 타입 상성 메시지 반환
func GetEffectivenessMessage(effectiveness float32) string {
	if effectiveness >= 2.0 {
		return "효과가 굉장했다!"
	} else if effectiveness > 1.0 {
		return "효과가 좋았다!"
	} else if effectiveness == 0.0 {
		return "효과가 없는 것 같다..."
	} else if effectiveness < 1.0 {
		return "효과가 별로인 듯하다..."
	}
	return ""
}
