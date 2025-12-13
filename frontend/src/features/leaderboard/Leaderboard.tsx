import { useEffect, useState } from 'react';
import { GetLeaderboard } from '@wails/App';

interface LeaderboardEntry {
  id: number;
  floor: number;
  pokemon1: string;
  pokemon2: string;
  pokemon3: string;
  endTime: string;
  createdAt: string;
}

interface LeaderboardProps {
  onRestart: () => void;
}

const Leaderboard = ({ onRestart }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await GetLeaderboard(10);
        setEntries(data);
      } catch (e) {
        console.error('리더보드 로드 실패:', e);
      }
    };
    loadLeaderboard();
  }, []);

  return (
    <div className="w-screen h-screen p-5 flex flex-col gap-16" style={{ boxSizing: 'border-box' }}>
      <div className="text-center">
        <div className="text-32 font-bold mb-4">게임 오버</div>
        <div className="text-20 mb-8">리더보드</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-14">순위</th>
              <th className="border p-2 text-14">층 수</th>
              <th className="border p-2 text-14">포켓몬</th>
              <th className="border p-2 text-14">종료 시간</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border p-2 text-center text-14">{index + 1}</td>
                <td className="border p-2 text-center text-14 font-bold">{entry.floor}층</td>
                <td className="border p-2 text-14">
                  {entry.pokemon1}, {entry.pokemon2}, {entry.pokemon3}
                </td>
                <td className="border p-2 text-center text-12">{new Date(entry.endTime).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button onClick={onRestart} className="px-8 py-4 bg-blue-500 text-white rounded">
          처음으로
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
