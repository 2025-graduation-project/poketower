package battle

import (
	"errors"
	"fmt"
	"poketower-client/service/model"
	"sort"
)

// AddPokemonToPC PC에 포켓몬 추가
func AddPokemonToPC(pokemons []model.Pokemon) error {
	if len(pokemons) == 0 {
		return errors.New("추가할 포켓몬이 없습니다")
	}

	// 체력을 최대로 회복하여 추가
	for _, pokemon := range pokemons {
		pokemonCopy := pokemon
		pokemonCopy.HP = pokemonCopy.MaxHP
		PlayerPC = append(PlayerPC, pokemonCopy)
	}

	return nil
}

// GetPCPokemons PC 포켓몬 목록 반환
func GetPCPokemons() []model.Pokemon {
	return PlayerPC
}

// GetPCPokemonsSortedByID PC 포켓몬 도감번호순 정렬
func GetPCPokemonsSortedByID() []model.Pokemon {
	pokemons := make([]model.Pokemon, len(PlayerPC))
	copy(pokemons, PlayerPC)

	sort.Slice(pokemons, func(i, j int) bool {
		return pokemons[i].ID < pokemons[j].ID
	})

	return pokemons
}

// GetPCPokemonsByType PC 포켓몬 타입별 조회
func GetPCPokemonsByType(typeID int) []model.Pokemon {
	result := []model.Pokemon{}

	for _, pokemon := range PlayerPC {
		for _, pokemonType := range pokemon.Types {
			if pokemonType.ID == typeID {
				result = append(result, pokemon)
				break
			}
		}
	}

	return result
}

// GetPCPokemonsByTypeGrouped PC 포켓몬 타입별 그룹화
func GetPCPokemonsByTypeGrouped() map[string][]model.Pokemon {
	grouped := make(map[string][]model.Pokemon)

	for _, pokemon := range PlayerPC {
		for _, pokemonType := range pokemon.Types {
			typeName := pokemonType.Name
			if _, exists := grouped[typeName]; !exists {
				grouped[typeName] = []model.Pokemon{}
			}
			grouped[typeName] = append(grouped[typeName], pokemon)
		}
	}

	return grouped
}

// RemovePokemonFromPC PC에서 포켓몬 제거 (인덱스 기반)
func RemovePokemonFromPC(index int) error {
	if index < 0 || index >= len(PlayerPC) {
		return errors.New("잘못된 인덱스입니다")
	}

	PlayerPC = append(PlayerPC[:index], PlayerPC[index+1:]...)

	return nil
}

// SelectPokemonsFromEncountered 출현한 포켓몬 중 선택하여 PC에 추가
func SelectPokemonsFromEncountered(indices []int) error {
	if CurrentStageState == nil {
		return errors.New("스테이지가 초기화되지 않았습니다")
	}

	if len(indices) > 5 {
		return errors.New("최대 5마리까지 선택할 수 있습니다")
	}

	encountered := CurrentStageState.EncounteredPokemon
	selectedPokemons := make([]model.Pokemon, 0, len(indices))

	for _, idx := range indices {
		if idx < 0 || idx >= len(encountered) {
			return fmt.Errorf("잘못된 인덱스입니다: %d", idx)
		}
		selectedPokemons = append(selectedPokemons, encountered[idx])
	}

	return AddPokemonToPC(selectedPokemons)
}

// GetPCCount PC에 저장된 포켓몬 수 반환
func GetPCCount() int {
	return len(PlayerPC)
}

// ClearPC PC 초기화 (게임 재시작 시)
func ClearPC() {
	PlayerPC = []model.Pokemon{}
}
