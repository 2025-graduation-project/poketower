# 포켓타워 프론트엔드 API 가이드

## 목차
1. [개요](#개요)
2. [게임 플로우](#게임-플로우)
3. [API 레퍼런스](#api-레퍼런스)
4. [데이터 모델](#데이터-모델)
5. [사용 예시](#사용-예시)

---

## 개요

이 문서는 Wails 프레임워크를 사용한 포켓타워 게임의 백엔드 API를 설명합니다.
모든 API는 TypeScript에서 직접 호출할 수 있으며, `window.go` 네임스페이스를 통해 접근합니다.

### 기술 스택
- **백엔드**: Go + Wails
- **프론트엔드**: React + TypeScript
- **데이터베이스**: SQLite (임베디드)

---

## 게임 플로우

### 전체 게임 진행 순서

```
1. 게임 시작
   ↓
2. 스타팅 포켓몬 3마리 추첨
   ↓
3. 게임 초기화 (1스테이지 시작)
   ↓
4. 층 시작 (1층)
   ↓
5. 배틀 초기화
   ↓
6. 배틀 진행 (플레이어 턴 → 적 턴 반복)
   ↓
7. 배틀 종료
   ├─ 승리 → 층 완료 → 다음 층
   └─ 패배 → 게임 종료 → 리더보드 저장
   ↓
8. 5층 완료 시
   ↓
9. 출현한 15마리 중 5마리 선택하여 PC 저장
   ↓
10. 스테이지 완료
   ↓
11. PC에서 3마리 선택하여 다음 스테이지 시작
   ↓
12. 4~11 반복
```

---

## API 레퍼런스

### 1. 게임 초기화 API

#### `InitGame(): Promise<void>`
게임을 초기화하고 첫 스테이지를 시작합니다.

```typescript
await InitGame();
```

**동작:**
- 1스테이지, 1층으로 초기화
- 랜덤 타입 추첨 (현재 스테이지 타입)
- 다음 스테이지 타입 미리 추첨

---

### 2. 포켓몬 선택 API

#### `DrawStarting(): Promise<Pokemon[]>`
스타팅 포켓몬 3마리를 자동으로 추첨합니다.

```typescript
const startingPokemons = await DrawStarting();
// 5초 대기 후 반환됨
```

**반환값:**
```typescript
[
  { id: 1, name: "이상해씨", hp: 120, maxHP: 120, ... },
  { id: 4, name: "파이리", hp: 114, maxHP: 114, ... },
  { id: 7, name: "꼬부기", hp: 119, maxHP: 119, ... }
]
```

#### `GetCurrentPokemon(): Promise<Pokemon[]>`
현재 플레이어가 사용 중인 포켓몬 3마리를 반환합니다.

```typescript
const myPokemons = await GetCurrentPokemon();
```

---

### 3. 스테이지 관리 API

#### `GetStageState(): Promise<StageState>`
현재 스테이지 상태를 조회합니다.

```typescript
const stageState = await GetStageState();
console.log(stageState.stageNumber);  // 1
console.log(stageState.currentFloor); // 1~5
console.log(stageState.stageType.name); // "불꽃", "물" 등
console.log(stageState.nextStageType.name); // 다음 스테이지 타입
```

**StageState 구조:**
```typescript
interface StageState {
  stageNumber: number;        // 현재 스테이지 번호
  currentFloor: number;       // 현재 층 (1~5)
  stageType: Type;            // 현재 스테이지 타입
  nextStageType: Type;        // 다음 스테이지 타입
  encounteredPokemon: Pokemon[]; // 출현한 포켓몬 (최대 15마리)
  isStageActive: boolean;     // 스테이지 진행 중 여부
}
```

#### `StartFloor(): Promise<void>`
새로운 층을 시작합니다 (적 포켓몬 3마리 생성).

```typescript
await StartFloor();
const enemies = await GetEnemyPokemons();
```

#### `CompleteFloor(): Promise<void>`
현재 층을 완료하고 다음 층으로 진행합니다.

```typescript
await CompleteFloor(); // 플레이어 포켓몬 체력 자동 회복
```

#### `CompleteStage(): Promise<void>`
스테이지를 완료하고 다음 스테이지를 준비합니다.

```typescript
await CompleteStage();
// 스테이지 번호 +1, 층 1로 초기화, 다음 타입으로 변경
```

#### `FailStage(): Promise<void>`
스테이지 실패 처리 (리더보드에 자동 저장).

```typescript
await FailStage();
// 게임 종료, 리더보드 저장
```

#### `GetCurrentFloorNumber(): Promise<number>`
현재 총 층 수를 반환합니다.

```typescript
const floor = await GetCurrentFloorNumber();
// 1스테이지 3층 = 3
// 2스테이지 2층 = 7
// 3스테이지 5층 = 15
```

---

### 4. 배틀 API

#### `InitBattle(): Promise<void>`
배틀을 초기화합니다.

```typescript
await InitBattle();
```

**동작:**
- 속도 비교로 선공 결정
- 적이 빠르면 자동으로 적 턴 실행

#### `GetBattleState(): Promise<BattleState>`
현재 배틀 상태를 조회합니다.

```typescript
const battle = await GetBattleState();
console.log(battle.isActive);      // 배틀 진행 중 여부
console.log(battle.isPlayerTurn);  // 플레이어 턴 여부
console.log(battle.battleResult);  // "ongoing", "win", "lose"
console.log(battle.waitingForSwitch); // 포켓몬 교체 대기 중
```

**BattleState 구조:**
```typescript
interface BattleState {
  isActive: boolean;           // 배틀 진행 중
  turn: number;                // 현재 턴 수
  playerCurrentIndex: number;  // 현재 플레이어 포켓몬 인덱스 (0~2)
  enemyCurrentIndex: number;   // 현재 적 포켓몬 인덱스 (0~2)
  battleLogs: BattleLog[];     // 배틀 로그
  isPlayerTurn: boolean;       // 플레이어 턴 여부
  battleResult: string;        // "ongoing", "win", "lose"
  waitingForSwitch: boolean;   // 포켓몬 교체 대기 중
}

interface BattleLog {
  message: string;             // 로그 메시지
  damage?: number;             // 데미지 (있는 경우)
  effectiveness?: number;      // 타입 상성 배율 (0.0, 0.5, 1.0, 2.0)
  isCritical?: boolean;        // 급소 여부
}
```

#### `PlayerUseMove(moveIndex: number): Promise<void>`
플레이어가 기술을 사용합니다.

```typescript
// 첫 번째 기술 사용 (인덱스 0~3)
await PlayerUseMove(0);

// 배틀 상태 확인
const battle = await GetBattleState();
if (battle.waitingForSwitch) {
  // 포켓몬이 기절했으므로 교체 필요
  await SwitchPlayerPokemon(1);
}
```

**주의사항:**
- `isPlayerTurn`이 `true`일 때만 호출
- `waitingForSwitch`가 `true`면 교체 필요
- 기술 사용 후 자동으로 적 턴 실행

#### `SwitchPlayerPokemon(pokemonIndex: number): Promise<void>`
플레이어 포켓몬을 교체합니다.

```typescript
// 두 번째 포켓몬으로 교체 (인덱스 0~2)
await SwitchPlayerPokemon(1);
```

**주의사항:**
- 살아있는 포켓몬으로만 교체 가능
- 기절로 인한 강제 교체는 적 턴 없이 진행

#### `GetPlayerPokemons(): Promise<Pokemon[]>`
플레이어 포켓몬 3마리를 반환합니다.

```typescript
const myPokemons = await GetPlayerPokemons();
myPokemons.forEach((p, i) => {
  console.log(`[${i}] ${p.name} HP: ${p.hp}/${p.maxHP}`);
});
```

#### `GetEnemyPokemons(): Promise<Pokemon[]>`
적 포켓몬 3마리를 반환합니다.

```typescript
const enemies = await GetEnemyPokemons();
```

---

### 5. PC 관리 API

#### `GetPCPokemons(): Promise<Pokemon[]>`
PC에 저장된 모든 포켓몬을 반환합니다.

```typescript
const pcPokemons = await GetPCPokemons();
```

#### `GetPCPokemonsSortedByID(): Promise<Pokemon[]>`
PC 포켓몬을 도감번호순으로 정렬하여 반환합니다.

```typescript
const sorted = await GetPCPokemonsSortedByID();
```

#### `GetPCPokemonsByType(typeID: number): Promise<Pokemon[]>`
특정 타입의 포켓몬만 조회합니다.

```typescript
// 불꽃 타입 (ID: 2)
const firePokemons = await GetPCPokemonsByType(2);
```

**타입 ID:**
```
1: 노말, 2: 불꽃, 3: 물, 4: 전기, 5: 풀, 6: 얼음
7: 격투, 8: 독, 9: 땅, 10: 비행, 11: 에스퍼, 12: 벌레
13: 바위, 14: 고스트, 15: 드래곤, 16: 악, 17: 강철, 18: 페어리
```

#### `GetPCPokemonsByTypeGrouped(): Promise<{[typeName: string]: Pokemon[]}>`
타입별로 그룹화된 포켓몬을 반환합니다.

```typescript
const grouped = await GetPCPokemonsByTypeGrouped();
// { "불꽃": [...], "물": [...], ... }
```

#### `SelectPokemonsFromEncountered(indices: number[]): Promise<void>`
출현한 포켓몬 중 선택하여 PC에 저장합니다 (최대 5마리).

```typescript
// 15마리 중 0, 1, 2, 3, 4번 인덱스 선택
await SelectPokemonsFromEncountered([0, 1, 2, 3, 4]);
```

#### `GetEncounteredPokemon(): Promise<Pokemon[]>`
현재 스테이지에서 출현한 포켓몬 목록을 반환합니다.

```typescript
const encountered = await GetEncounteredPokemon();
// 최대 15마리 (5층 × 3마리)
```

#### `SelectPokemonsForNextStage(pokemonIDs: number[]): Promise<void>`
다음 스테이지에서 사용할 포켓몬 3마리를 선택합니다.

```typescript
// PC에서 포켓몬 ID로 선택
await SelectPokemonsForNextStage([1, 4, 7]);
```

#### `GetPCCount(): Promise<number>`
PC에 저장된 포켓몬 수를 반환합니다.

```typescript
const count = await GetPCCount();
```

---

### 6. 리더보드 API

#### `GetLeaderboard(limit: number): Promise<Leaderboard[]>`
리더보드를 조회합니다 (층 수 내림차순).

```typescript
// 상위 10개
const leaderboard = await GetLeaderboard(10);
```

#### `GetTopLeaderboard(top: number): Promise<Leaderboard[]>`
상위 N개 리더보드를 조회합니다.

```typescript
const top5 = await GetTopLeaderboard(5);
```

#### `GetAllLeaderboard(): Promise<Leaderboard[]>`
전체 리더보드를 조회합니다.

```typescript
const all = await GetAllLeaderboard();
```

#### `GetLeaderboardCount(): Promise<number>`
리더보드 엔트리 개수를 반환합니다.

```typescript
const count = await GetLeaderboardCount();
```

---

## 데이터 모델

### Pokemon
```typescript
interface Pokemon {
  id: number;           // 포켓몬 ID
  name: string;         // 이름
  hp: number;           // 현재 체력
  maxHP: number;        // 최대 체력
  attack: number;       // 공격
  defense: number;      // 방어
  spAttack: number;     // 특수공격
  spDefense: number;    // 특수방어
  speed: number;        // 스피드
  isStarting: boolean;  // 스타팅 포켓몬 여부
  isLegend: boolean;    // 전설 포켓몬 여부
  types: Type[];        // 타입 (1~2개)
  moves: Move[];        // 기술 (4개)
}
```

### Type
```typescript
interface Type {
  id: number;    // 타입 ID (1~18)
  name: string;  // 타입 이름 ("불꽃", "물" 등)
}
```

### Move
```typescript
interface Move {
  id: number;         // 기술 ID
  koName: string;     // 한글 이름
  enName: string;     // 영문 이름
  category: number;   // 1: 물리, 2: 특수, 3: 변화
  typeID: number;     // 타입 ID
  power: number | null; // 위력 (변화 기술은 null)
  accuracy: number;   // 명중률
  pp: number;         // PP
  type: Type;         // 타입 정보
}
```

### Leaderboard
```typescript
interface Leaderboard {
  id: number;         // 엔트리 ID
  floor: number;      // 도달한 층 수
  pokemon1: string;   // 첫 번째 포켓몬 이름
  pokemon2: string;   // 두 번째 포켓몬 이름
  pokemon3: string;   // 세 번째 포켓몬 이름
  endTime: string;    // 게임 종료 시간 (ISO 8601)
  createdAt: string;  // 생성 시간
}
```

---

## 사용 예시

### 1. 게임 시작 플로우

```typescript
// 1. 스타팅 포켓몬 추첨
const startingPokemons = await DrawStarting();
console.log("선택된 포켓몬:", startingPokemons.map(p => p.name));

// 2. 게임 초기화
await InitGame();
const stageState = await GetStageState();
console.log(`${stageState.stageNumber}스테이지 ${stageState.currentFloor}층`);
console.log(`타입: ${stageState.stageType.name}`);
console.log(`다음 타입: ${stageState.nextStageType.name}`);
```

### 2. 층 시작 및 배틀

```typescript
// 1. 층 시작
await StartFloor();

// 2. 적 포켓몬 확인
const enemies = await GetEnemyPokemons();
console.log("적:", enemies.map(e => e.name));

// 3. 배틀 초기화
await InitBattle();

// 4. 배틀 상태 확인
let battle = await GetBattleState();

// 5. 배틀 루프
while (battle.isActive) {
  if (battle.waitingForSwitch) {
    // 포켓몬 교체 필요
    const myPokemons = await GetPlayerPokemons();
    const aliveIndex = myPokemons.findIndex(p => p.hp > 0);
    await SwitchPlayerPokemon(aliveIndex);
  } else if (battle.isPlayerTurn) {
    // 플레이어 턴 - 기술 선택
    const myPokemon = (await GetPlayerPokemons())[battle.playerCurrentIndex];
    
    // UI에서 기술 선택 받기
    const selectedMoveIndex = 0; // 예시
    await PlayerUseMove(selectedMoveIndex);
  }
  
  // 배틀 상태 갱신
  battle = await GetBattleState();
  
  // 로그 출력
  battle.battleLogs.forEach(log => {
    console.log(log.message);
    if (log.damage) {
      console.log(`데미지: ${log.damage}`);
    }
  });
}

// 6. 배틀 결과 처리
if (battle.battleResult === "win") {
  await CompleteFloor();
  console.log("층 클리어!");
} else if (battle.battleResult === "lose") {
  await FailStage();
  console.log("게임 오버");
}
```

### 3. 스테이지 완료 및 PC 관리

```typescript
// 1. 5층 클리어 후 출현 포켓몬 확인
const encountered = await GetEncounteredPokemon();
console.log(`출현한 포켓몬: ${encountered.length}마리`);

// 2. 5마리 선택하여 PC에 저장
// UI에서 선택 받기
const selectedIndices = [0, 1, 2, 3, 4]; // 예시
await SelectPokemonsFromEncountered(selectedIndices);

// 3. 스테이지 완료
await CompleteStage();

// 4. PC에서 3마리 선택
const pcPokemons = await GetPCPokemons();
const selectedIDs = [pcPokemons[0].id, pcPokemons[1].id, pcPokemons[2].id];
await SelectPokemonsForNextStage(selectedIDs);

// 5. 다음 스테이지 시작
await StartFloor();
```

### 4. 리더보드 조회

```typescript
// 상위 10개 조회
const leaderboard = await GetLeaderboard(10);

leaderboard.forEach((entry, index) => {
  console.log(`[${index + 1}] ${entry.floor}층`);
  console.log(`  포켓몬: ${entry.pokemon1}, ${entry.pokemon2}, ${entry.pokemon3}`);
  console.log(`  시간: ${new Date(entry.endTime).toLocaleString()}`);
});
```

### 5. 실시간 배틀 UI 업데이트

```typescript
// React 예시
const [battleState, setBattleState] = useState<BattleState | null>(null);
const [myPokemons, setMyPokemons] = useState<Pokemon[]>([]);
const [enemies, setEnemies] = useState<Pokemon[]>([]);

// 배틀 상태 폴링 (또는 이벤트 기반)
useEffect(() => {
  const interval = setInterval(async () => {
    const battle = await GetBattleState();
    setBattleState(battle);
    
    if (battle.isActive) {
      const my = await GetPlayerPokemons();
      const enemy = await GetEnemyPokemons();
      setMyPokemons(my);
      setEnemies(enemy);
    }
  }, 100); // 100ms마다 갱신
  
  return () => clearInterval(interval);
}, []);

// 기술 사용 핸들러
const handleUseMove = async (moveIndex: number) => {
  if (battleState?.isPlayerTurn && !battleState.waitingForSwitch) {
    await PlayerUseMove(moveIndex);
  }
};

// 포켓몬 교체 핸들러
const handleSwitch = async (pokemonIndex: number) => {
  if (battleState?.waitingForSwitch) {
    await SwitchPlayerPokemon(pokemonIndex);
  }
};
```

---

## 주의사항

### 1. 비동기 처리
모든 API는 비동기이므로 `async/await` 또는 Promise를 사용해야 합니다.

### 2. 에러 처리
```typescript
try {
  await PlayerUseMove(0);
} catch (error) {
  console.error("기술 사용 실패:", error);
}
```

### 3. 턴 순서
- 플레이어 기술 사용 → 자동으로 적 턴 실행
- 적 턴은 백엔드에서 자동 처리됨
- `isPlayerTurn`이 `true`일 때만 플레이어 행동 가능

### 4. 포켓몬 교체
- `waitingForSwitch`가 `true`일 때는 반드시 교체 필요
- 교체 후 자동으로 적 턴 실행 (기절로 인한 강제 교체 제외)

### 5. 게임 종료
- 모든 포켓몬이 기절하면 자동으로 `battleResult = "lose"`
- `FailStage()` 호출 시 자동으로 리더보드에 저장

---

## 타입 정의 파일 생성

Wails CLI를 사용하여 TypeScript 타입을 자동 생성할 수 있습니다:

```bash
wails dev
# 또는
wails build
```

생성된 타입은 `frontend/wailsjs/go/main/App.d.ts`에서 확인할 수 있습니다.

---

## 문의

백엔드 관련 문의사항이 있으면 백엔드 개발자에게 연락하세요.
