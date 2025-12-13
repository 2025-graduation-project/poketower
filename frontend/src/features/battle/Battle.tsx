import { useEffect, useState, useRef } from 'react';
import { BattleProps, StageState, BattleState } from './type';
import { Pokemon } from '@/entities/pokemon/type';
import {
  GetStageState,
  StartFloor,
  InitBattle,
  GetBattleState,
  GetPlayerPokemons,
  GetEnemyPokemons,
  PlayerUseMove,
  SwitchPlayerPokemon,
  CompleteFloor,
  FailStage,
  GetCurrentFloorNumber,
} from '@wails/App';

const Battle = ({ onStageComplete, onGameOver }: BattleProps) => {
  const [stageInfo, setStageInfo] = useState<StageState | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [playerPokemons, setPlayerPokemons] = useState<Pokemon[]>([]);
  const [enemyPokemons, setEnemyPokemons] = useState<Pokemon[]>([]);
  const [currentFloor, setCurrentFloor] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const isInitializedRef = useRef(false);
  const battleLogRef = useRef<HTMLDivElement>(null);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const logQueueRef = useRef<any[]>([]);
  const [isProcessingLogs, setIsProcessingLogs] = useState(false);
  const isHandlingBattleEndRef = useRef(false);
  const isStartingFloorRef = useRef(false);
  const lastBattleResultRef = useRef<string>('');

  const loadStageInfo = async () => {
    const data = await GetStageState();
    setStageInfo(data);
  };

  const loadBattleState = async () => {
    const battle = await GetBattleState();
    setBattleState(battle);
  };

  const loadFloorNumber = async () => {
    const floor = await GetCurrentFloorNumber();
    setCurrentFloor(floor);
  };

  const startNewFloor = async () => {
    if (isStartingFloorRef.current) {
      console.log('[startNewFloor] 이미 실행 중, 스킵');
      return;
    }
    isStartingFloorRef.current = true;
    console.log('[startNewFloor] 시작');

    setIsLoading(true);
    // 상태 초기화
    setDisplayedLogs([]);
    logQueueRef.current = [];
    setIsProcessingLogs(false);
    isHandlingBattleEndRef.current = false;
    lastBattleResultRef.current = '';

    try {
      await StartFloor();
      await loadStageInfo();
      const floor = await GetCurrentFloorNumber();
      console.log('[startNewFloor] 층 번호:', floor);
      setCurrentFloor(floor);

      const player = await GetPlayerPokemons();
      const enemy = await GetEnemyPokemons();
      setPlayerPokemons(player);
      setEnemyPokemons(enemy);

      await InitBattle();
      await loadBattleState();
    } catch (e) {
      console.error('층 시작 실패:', e);
    } finally {
      setIsLoading(false);
      isStartingFloorRef.current = false;
      console.log('[startNewFloor] 완료');
    }
  };

  const handleUseMove = async (moveIndex: number) => {
    if (!battleState?.isPlayerTurn || battleState.waitingForSwitch) return;
    try {
      await PlayerUseMove(moveIndex);
      await loadBattleState();
    } catch (e) {
      console.error('기술 사용 실패:', e);
    }
  };

  const handleSwitchPokemon = async (pokemonIndex: number) => {
    try {
      await SwitchPlayerPokemon(pokemonIndex);
      await loadBattleState();
    } catch (e) {
      console.error('포켓몬 교체 실패:', e);
    }
  };

  const handleBattleEnd = async () => {
    if (isHandlingBattleEndRef.current) {
      console.log('[handleBattleEnd] 이미 실행 중, 스킵');
      return;
    }
    isHandlingBattleEndRef.current = true;
    console.log('[handleBattleEnd] 시작');

    try {
      if (battleState?.battleResult === 'win') {
        console.log('[handleBattleEnd] 승리 처리');
        await CompleteFloor();
        const stage = await GetStageState();
        console.log('[handleBattleEnd] 현재 층:', stage.currentFloor);
        if (stage.currentFloor > 5) {
          console.log('[handleBattleEnd] 스테이지 완료');
          onStageComplete();
        } else {
          console.log('[handleBattleEnd] 다음 층 시작');
          await startNewFloor();
        }
      } else if (battleState?.battleResult === 'lose') {
        console.log('[handleBattleEnd] 패배 처리');
        await FailStage();
        onGameOver();
      }
    } finally {
      console.log('[handleBattleEnd] 완료');
      // 플래그는 startNewFloor에서 초기화되므로 여기서는 초기화하지 않음
    }
  };

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const init = async () => {
      await loadStageInfo();
      await loadFloorNumber();
      await startNewFloor();
    };
    init();
  }, []);

  useEffect(() => {
    const allLogsDisplayed = battleState?.battleLogs && displayedLogs.length === battleState.battleLogs.length;

    console.log('[useEffect] 배틀 상태 변경:', {
      isActive: battleState?.isActive,
      battleResult: battleState?.battleResult,
      isProcessingLogs,
      totalLogs: battleState?.battleLogs?.length,
      displayedLogsCount: displayedLogs.length,
      allLogsDisplayed,
      isHandlingBattleEnd: isHandlingBattleEndRef.current,
      isStartingFloor: isStartingFloorRef.current,
      lastResult: lastBattleResultRef.current,
    });

    if (
      battleState &&
      !battleState.isActive &&
      battleState.battleResult !== 'ongoing' &&
      !isProcessingLogs &&
      allLogsDisplayed &&
      !isHandlingBattleEndRef.current &&
      !isStartingFloorRef.current &&
      lastBattleResultRef.current !== battleState.battleResult
    ) {
      console.log('[useEffect] 배틀 종료 감지, handleBattleEnd 호출');
      lastBattleResultRef.current = battleState.battleResult;
      handleBattleEnd();
    }
  }, [battleState?.isActive, battleState?.battleResult, isProcessingLogs, displayedLogs.length]);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  useEffect(() => {
    if (!battleState?.battleLogs) return;

    const newLogs = battleState.battleLogs.slice(displayedLogs.length);
    if (newLogs.length === 0) return;

    logQueueRef.current = [...logQueueRef.current, ...newLogs];

    const processQueue = () => {
      if (logQueueRef.current.length === 0) {
        setIsProcessingLogs(false);
        return;
      }

      setIsProcessingLogs(true);
      const nextLog = logQueueRef.current.shift();
      setDisplayedLogs((prev) => [...prev, nextLog]);

      // 로그에 포켓몬 스냅샷이 있으면 HP 업데이트
      if (nextLog.playerPokemons) {
        setPlayerPokemons(nextLog.playerPokemons);
      }
      if (nextLog.enemyPokemons) {
        setEnemyPokemons(nextLog.enemyPokemons);
      }

      if (logQueueRef.current.length > 0) {
        // "다음 층으로 올라갑니다..." 메시지는 1초 대기
        const delay = nextLog.message === '다음 층으로 올라갑니다...' ? 1000 : 1000;
        setTimeout(processQueue, delay);
      } else {
        setIsProcessingLogs(false);
      }
    };

    if (logQueueRef.current.length === newLogs.length) {
      processQueue();
    }
  }, [battleState?.battleLogs]);

  const currentPlayerPokemon = playerPokemons[battleState?.playerCurrentIndex ?? 0];
  const currentEnemyPokemon = enemyPokemons[battleState?.enemyCurrentIndex ?? 0];

  if (isLoading || !stageInfo || !battleState) {
    return <div className="w-screen h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="w-screen h-screen p-5 flex flex-col gap-16" style={{ boxSizing: 'border-box' }}>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-20 font-bold">
            스테이지 {stageInfo.stageNumber} - {currentFloor}층
          </div>
          <div className="text-14">
            타입: {stageInfo.stageType.name} | 다음: {stageInfo.nextStageType.name}
          </div>
        </div>
        <div className="text-14">턴: {battleState.turn}</div>
      </div>

      <div className="flex-1 flex gap-16">
        <div className="flex-1 border p-4 rounded">
          <div className="text-16 font-bold mb-2">적 포켓몬</div>
          {currentEnemyPokemon && (
            <div className="mb-4">
              <div className="text-14 font-bold">{currentEnemyPokemon.name}</div>
              <div className="text-12">
                HP: {currentEnemyPokemon.hp}/{currentEnemyPokemon.maxHp}
              </div>
              <div className="w-full bg-gray-200 h-8 rounded">
                <div
                  className="bg-green-500 h-8 rounded"
                  style={{ width: `${(currentEnemyPokemon.hp / currentEnemyPokemon.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-8">
            {enemyPokemons.map((p, i) => (
              <div key={i} className={`p-2 border rounded ${i === battleState.enemyCurrentIndex ? 'bg-blue-100' : ''}`}>
                <div className="text-12">{p.name}</div>
                <div className="text-10">
                  HP: {p.hp}/{p.maxHp}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 border p-4 rounded">
          <div className="text-16 font-bold mb-2">내 포켓몬</div>
          {currentPlayerPokemon && (
            <div className="mb-4">
              <div className="text-14 font-bold">{currentPlayerPokemon.name}</div>
              <div className="text-12">
                HP: {currentPlayerPokemon.hp}/{currentPlayerPokemon.maxHp}
              </div>
              <div className="w-full bg-gray-200 h-8 rounded">
                <div
                  className="bg-green-500 h-8 rounded"
                  style={{ width: `${(currentPlayerPokemon.hp / currentPlayerPokemon.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-8">
            {playerPokemons.map((p, i) => (
              <div
                key={i}
                className={`p-2 border rounded ${!isProcessingLogs && battleState.waitingForSwitch && p.hp > 0 && i !== battleState.playerCurrentIndex ? 'cursor-pointer' : ''} ${i === battleState.playerCurrentIndex ? 'bg-blue-100' : ''}`}
                onClick={() => !isProcessingLogs && battleState.waitingForSwitch && p.hp > 0 && handleSwitchPokemon(i)}
              >
                <div className="text-12">{p.name}</div>
                <div className="text-10">
                  HP: {p.hp}/{p.maxHp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={battleLogRef} className="border p-4 rounded h-200 overflow-y-auto">
        <div className="text-14 font-bold mb-2">배틀 로그</div>
        {displayedLogs.map((log, i) => (
          <div key={i} className="text-12 mb-1">
            {log.message}
            {log.damage && <span className="text-red-500"> (데미지: {log.damage})</span>}
            {log.isCritical && <span className="text-yellow-500"> 급소!</span>}
          </div>
        ))}
      </div>

      <div className="border p-4 rounded">
        {battleState.waitingForSwitch ? (
          <div className="text-14 text-center">교체할 포켓몬을 선택하세요</div>
        ) : battleState.isPlayerTurn && currentPlayerPokemon ? (
          <div>
            <div className="text-14 font-bold mb-2">기술 선택</div>
            <div className="grid grid-cols-2 gap-8">
              {currentPlayerPokemon.moves.map((move, i) => (
                <button
                  key={i}
                  onClick={() => handleUseMove(i)}
                  className="p-3 border rounded hover:bg-gray-100"
                  disabled={!battleState.isPlayerTurn || isProcessingLogs}
                >
                  <div className="text-12 font-bold">{move.koName}</div>
                  <div className="text-10">
                    타입: {move.type.name} | 위력: {move.power ?? '-'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-14 text-center">적 턴 진행 중...</div>
        )}
      </div>
    </div>
  );
};

export default Battle;
