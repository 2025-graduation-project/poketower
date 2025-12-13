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

  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-2 ring-yellow-100';
      case 1:
        return 'bg-gray-100 text-gray-700 border-gray-200 ring-2 ring-gray-100';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200 ring-2 ring-orange-100';
      default:
        return 'bg-white text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        <div className="p-8 text-center bg-white border-b border-gray-100 shrink-0 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">GAME OVER</h1>
            <p className="text-gray-500 font-medium">명예의 전당 (Leaderboard)</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
          <div className="col-span-1 text-center">순위</div>
          <div className="col-span-2 text-center">도달 층</div>
          <div className="col-span-6">함께한 포켓몬</div>
          <div className="col-span-3 text-right">기록 시간</div>
        </div>

        <div className="overflow-y-auto flex-1 p-0 scrollbar-hide">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p>아직 기록이 없습니다.</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-blue-50 transition-all group duration-200"
              >
                <div className="col-span-1 flex justify-center">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border ${getRankBadgeStyle(
                      index,
                    )}`}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  <span className="text-lg font-bold text-gray-800">{entry.floor}F</span>
                </div>

                <div className="col-span-6 flex flex-wrap gap-2 items-center">
                  {[entry.pokemon1, entry.pokemon2, entry.pokemon3].filter(Boolean).map((poke, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors"
                    >
                      {poke}
                    </span>
                  ))}
                </div>

                <div className="col-span-3 text-right text-xs text-gray-400 group-hover:text-gray-600 font-mono transition-colors">
                  {new Date(entry.endTime).toLocaleString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-center shrink-0">
          <button
            onClick={onRestart}
            className="px-10 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
