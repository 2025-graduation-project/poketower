import { useEffect, useState } from 'react';
import { Pokemon } from '@/entities/pokemon/type';
import { GetPCPokemons, SelectPokemonsForNextStage, StartFloor, GetStageState } from '@wails/App';

interface PCSelectProps {
  onComplete: () => void;
}

const PCSelect = ({ onComplete }: PCSelectProps) => {
  const [pcPokemons, setPcPokemons] = useState<Pokemon[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'type'>('id');
  const [filterType, setFilterType] = useState<string>('all');
  const [nextStageType, setNextStageType] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const pokemon = await GetPCPokemons();
      setPcPokemons(pokemon);

      const stage = await GetStageState();
      if (stage && stage.stageType) {
        setNextStageType(stage.stageType.name);
      }
    };
    loadData();
  }, []);

  const getPokemonImg = (id: number) => {
    return new URL(`../../assets/img/pokemon/${id}.png`, import.meta.url).href;
  };

  const toggleSelection = (pokemonId: number) => {
    if (selectedIds.includes(pokemonId)) {
      setSelectedIds(selectedIds.filter((id) => id !== pokemonId));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, pokemonId]);
    }
  };

  const handleConfirm = async () => {
    if (selectedIds.length !== 3) return;
    try {
      await SelectPokemonsForNextStage(selectedIds);
      await StartFloor();
      onComplete();
    } catch (e) {
      console.error('포켓몬 선택 실패:', e);
    }
  };

  const sortedPokemons = [...pcPokemons].sort((a, b) => {
    if (sortBy === 'id') return a.id - b.id;
    return a.types[0]?.name.localeCompare(b.types[0]?.name ?? '') ?? 0;
  });

  const filteredPokemons =
    filterType === 'all' ? sortedPokemons : sortedPokemons.filter((p) => p.types.some((t) => t.name === filterType));

  const allTypes = Array.from(new Set(pcPokemons.flatMap((p) => p.types.map((t) => t.name))));

  return (
    <div className="w-screen h-screen p-5 flex flex-col gap-6 bg-gray-50">
      <div className="text-center shrink-0 flex flex-col items-center">
        <div className="text-3xl font-bold mb-3 text-gray-800">다음 스테이지 준비</div>

        {nextStageType && (
          <div className="mb-4 flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-indigo-100">
            <span className="text-sm text-gray-500 font-bold">다음 스테이지 속성</span>
            <div className="w-px h-3 bg-gray-300"></div>
            <span className="text-xl font-extrabold text-indigo-600 tracking-wide">{nextStageType}</span>
          </div>
        )}

        <div className="text-base text-gray-600">PC에서 3마리를 선택하세요</div>
        <div className="text-sm mt-3 font-bold text-blue-600 bg-blue-50 inline-block px-4 py-1.5 rounded-full border border-blue-100">
          선택됨: {selectedIds.length} / 3
        </div>
      </div>

      <div className="flex gap-4 justify-center shrink-0 z-10">
        <div className="relative group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'id' | 'type')}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer hover:border-blue-300 transition-all font-medium text-sm w-32"
          >
            <option value="id">도감번호순</option>
            <option value="type">타입별</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-blue-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        <div className="relative group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer hover:border-blue-300 transition-all font-medium text-sm w-32"
          >
            <option value="all">모든 타입</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-blue-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1">
        <div className="grid grid-cols-5 gap-4">
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              onClick={() => toggleSelection(pokemon.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col ${
                selectedIds.includes(pokemon.id)
                  ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200 transform scale-[1.02]'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:-translate-y-1 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center mb-3">
                <img
                  src={getPokemonImg(pokemon.id)}
                  alt={pokemon.name}
                  className="w-20 h-20 object-contain drop-shadow-sm mb-2"
                />
                <div className="text-sm font-bold text-gray-800">
                  #{pokemon.id} {pokemon.name}
                </div>
                <div className="flex gap-1 mt-1">
                  {pokemon.types.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mb-2">
                <div className="flex justify-between">
                  <span>HP</span>
                  <span className="font-bold">{pokemon.maxHp}</span>
                </div>
                <div className="flex justify-between">
                  <span>공격</span>
                  <span className="font-bold">{pokemon.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span>방어</span>
                  <span className="font-bold">{pokemon.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span>특공</span>
                  <span className="font-bold">{pokemon.spAttack}</span>
                </div>
                <div className="flex justify-between">
                  <span>특방</span>
                  <span className="font-bold">{pokemon.spDefense}</span>
                </div>
                <div className="flex justify-between">
                  <span>스피드</span>
                  <span className="font-bold">{pokemon.speed}</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="text-[10px] text-gray-400 font-bold mb-1">보유 기술</div>
                <div className="text-[10px] text-gray-700 leading-tight">
                  {pokemon.moves.map((m) => m.koName).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center shrink-0">
        <button
          onClick={handleConfirm}
          disabled={selectedIds.length !== 3}
          className={`px-12 py-4 rounded-2xl text-lg font-bold text-white transition-all shadow-md ${
            selectedIds.length === 3
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {selectedIds.length === 3 ? '선택 완료' : `${3 - selectedIds.length}마리 더 선택하세요`}
        </button>
      </div>
    </div>
  );
};

export default PCSelect;
