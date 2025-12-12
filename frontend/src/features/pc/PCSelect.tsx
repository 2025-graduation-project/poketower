import { useEffect, useState } from 'react';
import { Pokemon } from '@/entities/pokemon/type';
import { GetPCPokemons, SelectPokemonsForNextStage, StartFloor } from '@wails/App';

interface PCSelectProps {
  onComplete: () => void;
}

const PCSelect = ({ onComplete }: PCSelectProps) => {
  const [pcPokemons, setPcPokemons] = useState<Pokemon[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'type'>('id');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadPC = async () => {
      const pokemon = await GetPCPokemons();
      setPcPokemons(pokemon);
    };
    loadPC();
  }, []);

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
    <div className="w-screen h-screen p-20 flex flex-col gap-16" style={{ boxSizing: 'border-box' }}>
      <div className="text-center">
        <div className="text-24 font-bold mb-8">다음 스테이지 준비</div>
        <div className="text-16">PC에서 3마리를 선택하세요</div>
        <div className="text-14 mt-8">선택됨: {selectedIds.length}/3</div>
      </div>

      <div className="flex gap-16 justify-center">
        <div>
          <label className="mr-8">정렬:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'id' | 'type')} className="border p-4">
            <option value="id">도감번호순</option>
            <option value="type">타입별</option>
          </select>
        </div>
        <div>
          <label className="mr-8">필터:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border p-4">
            <option value="all">전체</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-16">
          {filteredPokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              onClick={() => toggleSelection(pokemon.id)}
              className={`p-16 border rounded cursor-pointer ${
                selectedIds.includes(pokemon.id) ? 'bg-blue-200 border-blue-500' : 'hover:bg-gray-100'
              }`}
            >
              <div className="text-14 font-bold mb-8">
                #{pokemon.id} {pokemon.name}
              </div>
              <div className="text-12 mb-4">타입: {pokemon.types.map((t) => t.name).join(', ')}</div>
              <div className="text-12 mb-4">HP: {pokemon.maxHp}</div>
              <div className="text-12 mb-4">공격: {pokemon.attack}</div>
              <div className="text-12 mb-4">방어: {pokemon.defense}</div>
              <div className="text-12 mb-4">특공: {pokemon.spAttack}</div>
              <div className="text-12 mb-4">특방: {pokemon.spDefense}</div>
              <div className="text-12">스피드: {pokemon.speed}</div>
              <div className="mt-8 text-10">기술: {pokemon.moves.map((m) => m.koName).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleConfirm}
          disabled={selectedIds.length !== 3}
          className="px-32 py-16 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          선택 완료
        </button>
      </div>
    </div>
  );
};

export default PCSelect;
