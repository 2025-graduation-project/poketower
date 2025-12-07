package model

import "time"

// Leaderboard 리더보드 엔트리
type Leaderboard struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Floor     int       `json:"floor"`    // 도달한 층 수
	Pokemon1  string    `json:"pokemon1"` // 첫 번째 포켓몬 이름
	Pokemon2  string    `json:"pokemon2"` // 두 번째 포켓몬 이름
	Pokemon3  string    `json:"pokemon3"` // 세 번째 포켓몬 이름
	EndTime   time.Time `json:"endTime"`  // 게임 종료 시간
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName 테이블 이름 지정
func (Leaderboard) TableName() string {
	return "leaderboard"
}
