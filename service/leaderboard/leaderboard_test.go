package leaderboard

import (
	"poketower-client/service/database"
	"testing"
)

func TestLeaderboard(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// 리더보드 테이블 초기화
	err = InitLeaderboard()
	if err != nil {
		t.Fatalf("Failed to init leaderboard: %v", err)
	}

	// 테스트를 위해 리더보드 초기화
	err = ClearLeaderboard()
	if err != nil {
		t.Fatalf("Failed to clear leaderboard: %v", err)
	}

	// 리더보드 엔트리 추가
	testCases := []struct {
		floor    int
		pokemon1 string
		pokemon2 string
		pokemon3 string
	}{
		{15, "이상해씨", "파이리", "꼬부기"},
		{23, "피카츄", "라이츄", "파이리"},
		{8, "잠만보", "망나뇽", "뮤츠"},
		{30, "루카리오", "가디안", "메타그로스"},
		{12, "이브이", "샤미드", "쥬피썬더"},
	}

	for _, tc := range testCases {
		err := SaveLeaderboard(tc.floor, tc.pokemon1, tc.pokemon2, tc.pokemon3)
		if err != nil {
			t.Errorf("Failed to save leaderboard: %v", err)
		}
	}

	t.Logf("Saved %d leaderboard entries", len(testCases))

	// 리더보드 개수 확인
	count, err := GetLeaderboardCount()
	if err != nil {
		t.Fatalf("Failed to get leaderboard count: %v", err)
	}

	if count != int64(len(testCases)) {
		t.Errorf("Expected %d entries, got %d", len(testCases), count)
	}

	t.Logf("Leaderboard count: %d", count)

	// 전체 리더보드 조회 (층 수 내림차순)
	entries, err := GetAllLeaderboard()
	if err != nil {
		t.Fatalf("Failed to get all leaderboard: %v", err)
	}

	t.Logf("\n=== Full Leaderboard (Sorted by Floor DESC) ===")
	for i, entry := range entries {
		t.Logf("[%d] Floor: %d | %s, %s, %s | Time: %s",
			i+1, entry.Floor, entry.Pokemon1, entry.Pokemon2, entry.Pokemon3,
			entry.EndTime.Format("2006-01-02 15:04:05"))
	}

	// 층 수가 내림차순으로 정렬되었는지 확인
	expectedOrder := []int{30, 23, 15, 12, 8}
	for i, entry := range entries {
		if entry.Floor != expectedOrder[i] {
			t.Errorf("Expected floor %d at position %d, got %d", expectedOrder[i], i, entry.Floor)
		}
	}

	// 상위 3개만 조회
	topEntries, err := GetTopLeaderboard(3)
	if err != nil {
		t.Fatalf("Failed to get top leaderboard: %v", err)
	}

	t.Logf("\n=== Top 3 Leaderboard ===")
	for i, entry := range topEntries {
		t.Logf("[%d] Floor: %d | %s, %s, %s",
			i+1, entry.Floor, entry.Pokemon1, entry.Pokemon2, entry.Pokemon3)
	}

	if len(topEntries) != 3 {
		t.Errorf("Expected 3 entries, got %d", len(topEntries))
	}

	// 잘못된 입력 테스트
	err = SaveLeaderboard(0, "포켓몬1", "포켓몬2", "포켓몬3")
	if err == nil {
		t.Error("Expected error for floor <= 0, got nil")
	}

	err = SaveLeaderboard(10, "", "포켓몬2", "포켓몬3")
	if err == nil {
		t.Error("Expected error for empty pokemon name, got nil")
	}

	t.Log("\n=== Leaderboard Test Completed ===")
}

func TestLeaderboardIntegration(t *testing.T) {
	// 데이터베이스 연결
	_, err := database.OpenDb()
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// 리더보드 테이블 초기화
	err = InitLeaderboard()
	if err != nil {
		t.Fatalf("Failed to init leaderboard: %v", err)
	}

	// 게임 시나리오 시뮬레이션
	t.Log("\n=== Game Scenario Simulation ===")

	// 게임 1: 5층에서 실패
	err = SaveLeaderboard(5, "이상해씨", "파이리", "꼬부기")
	if err != nil {
		t.Fatalf("Failed to save game 1: %v", err)
	}
	t.Log("Game 1: Failed at floor 5")

	// 게임 2: 12층에서 실패
	err = SaveLeaderboard(12, "피카츄", "라이츄", "파이리")
	if err != nil {
		t.Fatalf("Failed to save game 2: %v", err)
	}
	t.Log("Game 2: Failed at floor 12")

	// 게임 3: 8층에서 실패
	err = SaveLeaderboard(8, "잠만보", "망나뇽", "뮤츠")
	if err != nil {
		t.Fatalf("Failed to save game 3: %v", err)
	}
	t.Log("Game 3: Failed at floor 8")

	// 리더보드 조회
	entries, err := GetLeaderboard(10)
	if err != nil {
		t.Fatalf("Failed to get leaderboard: %v", err)
	}

	t.Logf("\n=== Current Leaderboard ===")
	for i, entry := range entries {
		t.Logf("[%d] Floor %d | %s, %s, %s",
			i+1, entry.Floor, entry.Pokemon1, entry.Pokemon2, entry.Pokemon3)
	}
}
