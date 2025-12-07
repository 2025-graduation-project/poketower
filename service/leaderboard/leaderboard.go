package leaderboard

import (
	"errors"
	"log"
	"poketower-client/service/database"
	"poketower-client/service/model"
	"time"
)

// InitLeaderboard 리더보드 테이블 초기화
func InitLeaderboard() error {
	err := database.DB.AutoMigrate(&model.Leaderboard{})
	if err != nil {
		log.Printf("Failed to migrate leaderboard table: %v", err)
		return err
	}
	return nil
}

// SaveLeaderboard 리더보드에 기록 저장
func SaveLeaderboard(floor int, pokemon1, pokemon2, pokemon3 string) error {
	if floor <= 0 {
		return errors.New("층 수는 1 이상이어야 합니다")
	}

	if pokemon1 == "" || pokemon2 == "" || pokemon3 == "" {
		return errors.New("포켓몬 이름이 비어있습니다")
	}

	entry := model.Leaderboard{
		Floor:    floor,
		Pokemon1: pokemon1,
		Pokemon2: pokemon2,
		Pokemon3: pokemon3,
		EndTime:  time.Now(),
	}

	result := database.DB.Create(&entry)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

// GetLeaderboard 리더보드 조회 (층 수 내림차순)
func GetLeaderboard(limit int) ([]model.Leaderboard, error) {
	if limit <= 0 {
		limit = 100 // 기본값
	}

	var entries []model.Leaderboard
	result := database.DB.Order("floor DESC, end_time ASC").Limit(limit).Find(&entries)
	if result.Error != nil {
		return nil, result.Error
	}

	return entries, nil
}

// GetTopLeaderboard 상위 N개 리더보드 조회
func GetTopLeaderboard(top int) ([]model.Leaderboard, error) {
	return GetLeaderboard(top)
}

// GetAllLeaderboard 전체 리더보드 조회
func GetAllLeaderboard() ([]model.Leaderboard, error) {
	var entries []model.Leaderboard
	result := database.DB.Order("floor DESC, end_time ASC").Find(&entries)
	if result.Error != nil {
		return nil, result.Error
	}

	return entries, nil
}

// ClearLeaderboard 리더보드 전체 삭제 (테스트용)
func ClearLeaderboard() error {
	result := database.DB.Exec("DELETE FROM leaderboard")
	return result.Error
}

// GetLeaderboardCount 리더보드 엔트리 개수
func GetLeaderboardCount() (int64, error) {
	var count int64
	result := database.DB.Model(&model.Leaderboard{}).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}

	return count, nil
}
