/* eslint-disable react-hooks/exhaustive-deps */
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

  const getPokemonImg = (id: number) => {
    return new URL(`../../assets/img/pokemon/${id}.png`, import.meta.url).href;
  };

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
    if (isStartingFloorRef.current) return;
    isStartingFloorRef.current = true;

    setIsLoading(true);
    setDisplayedLogs([]);
    logQueueRef.current = [];
    setIsProcessingLogs(false);
    isHandlingBattleEndRef.current = false;
    lastBattleResultRef.current = '';

    try {
      await StartFloor();
      await loadStageInfo();
      const floor = await GetCurrentFloorNumber();
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
    if (isHandlingBattleEndRef.current) return;
    isHandlingBattleEndRef.current = true;

    try {
      if (battleState?.battleResult === 'win') {
        await CompleteFloor();
        const stage = await GetStageState();
        if (stage.currentFloor > 5) {
          onStageComplete();
        } else {
          await startNewFloor();
        }
      } else if (battleState?.battleResult === 'lose') {
        await FailStage();
        onGameOver();
      }
    } finally {
      // 처리 완료
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

      const isEnemyAction = nextLog.message.includes('상대') || nextLog.message.includes('적');

      if (isEnemyAction) {
        if (nextLog.playerPokemons) setPlayerPokemons(nextLog.playerPokemons);
      } else {
        if (nextLog.enemyPokemons) setEnemyPokemons(nextLog.enemyPokemons);
        if (nextLog.playerPokemons) setPlayerPokemons(nextLog.playerPokemons);
      }

      if (logQueueRef.current.length > 0) {
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
    return <div className="w-screen h-screen flex items-center justify-center text-lg font-bold">로딩 중...</div>;
  }

  return (
    <div className="w-screen min-h-screen p-5 flex flex-col gap-4 bg-gray-50">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0">
        <div>
          <div className="text-xl font-bold text-gray-800">
            스테이지 {stageInfo.stageNumber} - {currentFloor}층
          </div>
          <div className="text-sm text-gray-600 mt-1">
            타입: <span className="font-medium text-blue-600">{stageInfo.stageType.name}</span> | 다음:{' '}
            {stageInfo.nextStageType.name}
          </div>
        </div>
        <div className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-700">
          TURN {battleState.turn}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 border border-red-200 bg-white p-4 rounded-2xl shadow-sm flex flex-col">
          <div className="text-base font-bold text-red-600 mb-2 flex items-center gap-2">
            <span>⚔️ 적 포켓몬</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {currentEnemyPokemon && (
              <div className="mb-3 flex flex-col items-center">
                <img
                  src={getPokemonImg(currentEnemyPokemon.id)}
                  alt={currentEnemyPokemon.name}
                  className="w-32 h-32 object-contain drop-shadow-md"
                />

                <div className="w-full">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-lg font-bold text-gray-800">{currentEnemyPokemon.name}</div>
                    <div className="text-xs text-gray-500">
                      HP: {currentEnemyPokemon.hp}/{currentEnemyPokemon.maxHp}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="bg-red-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${(currentEnemyPokemon.hp / currentEnemyPokemon.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {enemyPokemons.map((p, i) => (
                <div
                  key={i}
                  className={`p-2 border rounded-lg transition-colors flex flex-col items-center justify-center gap-1 ${
                    i === battleState.enemyCurrentIndex
                      ? 'bg-red-50 border-red-300 ring-1 ring-red-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <img src={getPokemonImg(p.id)} alt={p.name} className="w-8 h-8 object-contain" />
                  <div className="text-xs font-medium text-gray-700 truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {p.hp}/{p.maxHp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 border border-blue-200 bg-white p-4 rounded-2xl shadow-sm flex flex-col">
          <div className="text-base font-bold text-blue-600 mb-2 flex items-center gap-2">
            <span>🛡️ 내 포켓몬</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {currentPlayerPokemon && (
              <div className="mb-3 flex flex-col items-center">
                <img
                  src={getPokemonImg(currentPlayerPokemon.id)}
                  alt={currentPlayerPokemon.name}
                  className="w-32 h-32 object-contain drop-shadow-md"
                />

                <div className="w-full">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-lg font-bold text-gray-800">{currentPlayerPokemon.name}</div>
                    <div className="text-xs text-gray-500">
                      HP: {currentPlayerPokemon.hp}/{currentPlayerPokemon.maxHp}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="bg-green-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${(currentPlayerPokemon.hp / currentPlayerPokemon.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {playerPokemons.map((p, i) => {
                const isClickable =
                  !isProcessingLogs && battleState.waitingForSwitch && p.hp > 0 && i !== battleState.playerCurrentIndex;
                return (
                  <div
                    key={i}
                    className={`p-2 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                      i === battleState.playerCurrentIndex
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-white border-gray-200'
                    } ${isClickable ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5' : ''}`}
                    onClick={() => isClickable && handleSwitchPokemon(i)}
                  >
                    <img src={getPokemonImg(p.id)} alt={p.name} className="w-8 h-8 object-contain" />
                    <div className="text-xs font-medium text-gray-700 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {p.hp}/{p.maxHp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={battleLogRef}
        // [수정] h-30 -> h-32 (Tailwind 표준), shrink-0, relative, p-0 추가
        className="border border-gray-300 bg-gray-900 p-0 rounded-xl h-32 overflow-y-auto shadow-inner shrink-0 relative"
      >
        {/* [이전 수정사항 유지] sticky 헤더에 배경색 및 z-index 추가 */}
        <div className="text-xs font-bold text-gray-400 p-3 sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
          📜 배틀 로그
        </div>
        <div className="space-y-1 px-3 pb-3">
          {displayedLogs.map((log, i) => (
            <div key={i} className="text-xs text-gray-300 font-mono">
              <span className="text-white">&gt;</span> {log.message}
              {log.damage && <span className="text-red-400 font-bold ml-1">(-{log.damage})</span>}
              {log.isCritical && <span className="text-yellow-400 font-bold ml-1">💥 급소!</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 bg-white p-4 rounded-xl shadow-lg shrink-0">
        {battleState.waitingForSwitch && !isProcessingLogs ? (
          <div className="text-sm text-center font-bold text-blue-600 animate-pulse py-2">
            🔄 교체할 포켓몬을 선택하세요!
          </div>
        ) : battleState.isPlayerTurn && currentPlayerPokemon && !battleState.waitingForSwitch ? (
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span>⚡ 기술 선택</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currentPlayerPokemon.moves.map((move, i) => (
                <button
                  key={i}
                  onClick={() => handleUseMove(i)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md active:scale-[0.99] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!battleState.isPlayerTurn || isProcessingLogs}
                >
                  <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700">{move.koName}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span className="bg-gray-100 px-1.5 rounded text-gray-600">{move.type.name}</span>
                    <span>위력: {move.power ?? '-'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-center text-gray-500 py-2 flex items-center justify-center gap-2">
            {isProcessingLogs ? '📜 배틀 진행 중...' : '⏳ 적의 행동을 기다리는 중...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Battle;
