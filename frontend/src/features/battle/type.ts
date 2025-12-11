import { Pokemon, Type } from '@/entities/pokemon/type';

export interface BattleProps {
  onStageComplete: () => void;
  onGameOver: () => void;
}

export interface StageState {
  currentFloor: number;
  encounteredPokemon: Pokemon[];
  isStageActive: boolean;
  nextStageType: Type;
  stageNumber: number;
  stageType: Type;
}

export interface BattleLog {
  message: string;
  damage?: number;
  effectiveness?: number;
  isCritical?: boolean;
}

export interface BattleState {
  isActive: boolean;
  turn: number;
  playerCurrentIndex: number;
  enemyCurrentIndex: number;
  battleLogs: BattleLog[];
  isPlayerTurn: boolean;
  battleResult: string;
  waitingForSwitch: boolean;
}
