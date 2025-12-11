export interface LeaderboardEntry {
  id: number;
  floor: number;
  pokemon1: string;
  pokemon2: string;
  pokemon3: string;
  endTime: string;
  createdAt: string;
}

export interface LeaderboardProps {
  onRestart: () => void;
}
