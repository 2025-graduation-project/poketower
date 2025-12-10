import { Pokemon } from '@/entities/pokemon/type';

export interface BattleProps {
  onRestart: () => void;
}

export interface StageTypeInfo {
  id: number;
  name: string;
}

export interface StageState {
  currentFloor: number;
  encounteredPokemon: Pokemon[];
  isStageActive: boolean;
  nextStageType: StageTypeInfo;
  stageNumber: number;
  stageType: StageTypeInfo;
}
