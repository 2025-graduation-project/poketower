export type Type = {
  id: number;
  name: string;
};

export type Move = {
  id: number;
  koName: string;
  enName: string;
  category: number;
  typeId: number;
  power?: number;
  accuracy?: number;
  pp: number;
  type: Type;
};

export type Pokemon = {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  isStarting: boolean;
  isLegend: boolean;
  types: Type[];
  moves: Move[];
};
