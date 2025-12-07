package battle

import (
	"errors"
	"fmt"
	"math/rand"
	"poketower-client/service/model"
)

// BattleLog 배틀 로그 항목
type BattleLog struct {
	Message       string  `json:"message"`
	Damage        uint16  `json:"damage,omitempty"`
	Effectiveness float32 `json:"effectiveness,omitempty"`
	IsCritical    bool    `json:"isCritical,omitempty"`
}

// BattleState 배틀 상태
type BattleState struct {
	IsActive           bool        `json:"isActive"`
	Turn               int         `json:"turn"`
	PlayerCurrentIndex int         `json:"playerCurrentIndex"`
	EnemyCurrentIndex  int         `json:"enemyCurrentIndex"`
	BattleLogs         []BattleLog `json:"battleLogs"`
	IsPlayerTurn       bool        `json:"isPlayerTurn"`
	BattleResult       string      `json:"battleResult"`     // "ongoing", "win", "lose"
	WaitingForSwitch   bool        `json:"waitingForSwitch"` // 포켓몬 교체 대기 중
}

var CurrentBattle *BattleState

// InitBattle 배틀 초기화
func InitBattle() error {
	if len(PlayerPokemons) == 0 || len(EnemyPokemons) == 0 {
		return errors.New("포켓몬이 설정되지 않았습니다")
	}

	CurrentBattle = &BattleState{
		IsActive:           true,
		Turn:               1,
		PlayerCurrentIndex: 0,
		EnemyCurrentIndex:  0,
		BattleLogs:         []BattleLog{},
		IsPlayerTurn:       true,
		BattleResult:       "ongoing",
		WaitingForSwitch:   false,
	}

	// 속도에 따라 선공 결정
	playerSpeed := PlayerPokemons[0].Speed
	enemySpeed := EnemyPokemons[0].Speed

	if enemySpeed > playerSpeed {
		CurrentBattle.IsPlayerTurn = false
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs,
			BattleLog{Message: fmt.Sprintf("상대의 %s가 선공을 잡았다!", EnemyPokemons[0].Name)})
		// 적이 선공이면 적 턴 실행
		EnemyTurn()
	} else {
		CurrentBattle.IsPlayerTurn = true
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs,
			BattleLog{Message: fmt.Sprintf("%s가 선공을 잡았다!", PlayerPokemons[0].Name)})
	}

	return nil
}

// GetCurrentPlayerPokemon 현재 플레이어 포켓몬 반환
func GetCurrentPlayerPokemon() *model.Pokemon {
	if CurrentBattle == nil || CurrentBattle.PlayerCurrentIndex >= len(PlayerPokemons) {
		return nil
	}
	return &PlayerPokemons[CurrentBattle.PlayerCurrentIndex]
}

// GetCurrentEnemyPokemon 현재 적 포켓몬 반환
func GetCurrentEnemyPokemon() *model.Pokemon {
	if CurrentBattle == nil || CurrentBattle.EnemyCurrentIndex >= len(EnemyPokemons) {
		return nil
	}
	return &EnemyPokemons[CurrentBattle.EnemyCurrentIndex]
}

// IsPlayerPokemonAlive 플레이어 포켓몬이 살아있는지 확인
func IsPlayerPokemonAlive(index int) bool {
	if index < 0 || index >= len(PlayerPokemons) {
		return false
	}
	return PlayerPokemons[index].HP > 0
}

// IsEnemyPokemonAlive 적 포켓몬이 살아있는지 확인
func IsEnemyPokemonAlive(index int) bool {
	if index < 0 || index >= len(EnemyPokemons) {
		return false
	}
	return EnemyPokemons[index].HP > 0
}

// HasAlivePokemon 살아있는 포켓몬이 있는지 확인
func HasAlivePokemon(pokemons []model.Pokemon) bool {
	for _, p := range pokemons {
		if p.HP > 0 {
			return true
		}
	}
	return false
}

// GetNextAlivePokemonIndex 다음 살아있는 포켓몬 인덱스 반환
func GetNextAlivePokemonIndex(pokemons []model.Pokemon, currentIndex int) int {
	for i := range pokemons {
		if i != currentIndex && pokemons[i].HP > 0 {
			return i
		}
	}
	return -1
}

// CheckBattleEnd 배틀 종료 확인
func CheckBattleEnd() {
	if !HasAlivePokemon(PlayerPokemons) {
		CurrentBattle.IsActive = false
		CurrentBattle.BattleResult = "lose"
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs,
			BattleLog{Message: "배틀에서 패배했습니다..."})
	} else if !HasAlivePokemon(EnemyPokemons) {
		CurrentBattle.IsActive = false
		CurrentBattle.BattleResult = "win"
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs,
			BattleLog{Message: "배틀에서 승리했습니다!"})
	}
}

// AddLog 배틀 로그 추가
func AddLog(message string) {
	if CurrentBattle != nil {
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs, BattleLog{Message: message})
	}
}

// AddDamageLog 데미지 로그 추가
func AddDamageLog(message string, damage uint16, effectiveness float32, isCritical bool) {
	if CurrentBattle != nil {
		CurrentBattle.BattleLogs = append(CurrentBattle.BattleLogs, BattleLog{
			Message:       message,
			Damage:        damage,
			Effectiveness: effectiveness,
			IsCritical:    isCritical,
		})
	}
}

// SwitchPlayerPokemon 플레이어 포켓몬 교체
func SwitchPlayerPokemon(newIndex int) error {
	if CurrentBattle == nil || !CurrentBattle.IsActive {
		return errors.New("배틀이 진행 중이 아닙니다")
	}

	if newIndex < 0 || newIndex >= len(PlayerPokemons) {
		return errors.New("잘못된 포켓몬 인덱스입니다")
	}

	if newIndex == CurrentBattle.PlayerCurrentIndex {
		return errors.New("이미 현재 포켓몬입니다")
	}

	if !IsPlayerPokemonAlive(newIndex) {
		return errors.New("기절한 포켓몬은 교체할 수 없습니다")
	}

	oldPokemon := PlayerPokemons[CurrentBattle.PlayerCurrentIndex]
	CurrentBattle.PlayerCurrentIndex = newIndex
	newPokemon := PlayerPokemons[newIndex]

	AddLog(fmt.Sprintf("%s, 돌아와! 가라, %s!", oldPokemon.Name, newPokemon.Name))

	// 교체 후에는 적 턴
	if CurrentBattle.WaitingForSwitch {
		CurrentBattle.WaitingForSwitch = false
		// 기절로 인한 교체면 적 턴 없이 다시 플레이어 턴
		CurrentBattle.IsPlayerTurn = true
	} else {
		CurrentBattle.IsPlayerTurn = false
		EnemyTurn()
	}

	return nil
}

// PlayerUseMove 플레이어가 기술 사용
func PlayerUseMove(moveIndex int) error {
	if CurrentBattle == nil || !CurrentBattle.IsActive {
		return errors.New("배틀이 진행 중이 아닙니다")
	}

	if !CurrentBattle.IsPlayerTurn {
		return errors.New("플레이어 턴이 아닙니다")
	}

	if CurrentBattle.WaitingForSwitch {
		return errors.New("포켓몬을 교체해야 합니다")
	}

	attacker := GetCurrentPlayerPokemon()
	if attacker == nil || attacker.HP == 0 {
		return errors.New("사용 가능한 포켓몬이 없습니다")
	}

	if moveIndex < 0 || moveIndex >= len(attacker.Moves) {
		return errors.New("잘못된 기술 인덱스입니다")
	}

	defender := GetCurrentEnemyPokemon()
	if defender == nil {
		return errors.New("상대 포켓몬이 없습니다")
	}

	move := attacker.Moves[moveIndex]

	// 공격 실행
	damage, effectiveness, isCrit := Attack(move, *attacker, defender)

	logMsg := fmt.Sprintf("%s의 %s!", attacker.Name, move.KoName)
	AddDamageLog(logMsg, damage, effectiveness, isCrit)

	if isCrit {
		AddLog("급소에 맞았다!")
	}

	effectMsg := GetEffectivenessMessage(effectiveness)
	if effectMsg != "" {
		AddLog(effectMsg)
	}

	// 적 포켓몬이 기절했는지 확인
	if defender.HP == 0 {
		AddLog(fmt.Sprintf("상대의 %s는 쓰러졌다!", defender.Name))

		// 다음 살아있는 적 포켓몬 찾기
		nextIndex := GetNextAlivePokemonIndex(EnemyPokemons, CurrentBattle.EnemyCurrentIndex)
		if nextIndex != -1 {
			CurrentBattle.EnemyCurrentIndex = nextIndex
			AddLog(fmt.Sprintf("상대는 %s를 꺼냈다!", EnemyPokemons[nextIndex].Name))
		}
	}

	CheckBattleEnd()

	if CurrentBattle.IsActive {
		// 적 턴으로 전환
		CurrentBattle.IsPlayerTurn = false
		EnemyTurn()
	}

	return nil
}

// EnemyTurn 적 턴 실행
func EnemyTurn() {
	if CurrentBattle == nil || !CurrentBattle.IsActive {
		return
	}

	attacker := GetCurrentEnemyPokemon()
	if attacker == nil || attacker.HP == 0 {
		return
	}

	defender := GetCurrentPlayerPokemon()
	if defender == nil {
		return
	}

	// 랜덤하게 기술 선택
	if len(attacker.Moves) == 0 {
		return
	}

	moveIndex := rand.Intn(len(attacker.Moves))
	move := attacker.Moves[moveIndex]

	// 공격 실행
	damage, effectiveness, isCrit := Attack(move, *attacker, defender)

	logMsg := fmt.Sprintf("상대의 %s의 %s!", attacker.Name, move.KoName)
	AddDamageLog(logMsg, damage, effectiveness, isCrit)

	if isCrit {
		AddLog("급소에 맞았다!")
	}

	effectMsg := GetEffectivenessMessage(effectiveness)
	if effectMsg != "" {
		AddLog(effectMsg)
	}

	// 플레이어 포켓몬이 기절했는지 확인
	if defender.HP == 0 {
		AddLog(fmt.Sprintf("%s는 쓰러졌다!", defender.Name))

		// 다음 살아있는 플레이어 포켓몬 찾기
		nextIndex := GetNextAlivePokemonIndex(PlayerPokemons, CurrentBattle.PlayerCurrentIndex)
		if nextIndex != -1 {
			CurrentBattle.WaitingForSwitch = true
			AddLog("다음 포켓몬을 선택하세요!")
		}
	}

	CheckBattleEnd()

	if CurrentBattle.IsActive && !CurrentBattle.WaitingForSwitch {
		// 플레이어 턴으로 전환
		CurrentBattle.IsPlayerTurn = true
		CurrentBattle.Turn++
	}
}

// GetBattleState 현재 배틀 상태 반환
func GetBattleState() *BattleState {
	return CurrentBattle
}
