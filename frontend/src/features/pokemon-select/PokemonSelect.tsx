import { useEffect, useState } from 'react';
import { Pokemon } from '@/entities/pokemon/type';
import { GetEncounteredPokemon, SelectPokemonsFromEncountered, CompleteStage } from '@wails/App';

interface PokemonSelectProps {
  onComplete: () => void;
}

const PokemonSelect = ({ onComplete }: PokemonSelectProps) => {
  const [encounteredPokemon, setEncounteredPokemon] = useState<Pokemon[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    const loadPokemon = async () => {
      const pokemon = await GetEncounteredPokemon();
      setEncounteredPokemon(pokemon);
    };
    loadPokemon();
  }, []);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else if (selectedIndices.length < 5) {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleConfirm = async () => {
    if (selectedIndices.length !== 5) return;
    try {
      await SelectPokemonsFromEncountered(selectedIndices);
      await CompleteStage();
      onComplete();
    } catch (e) {
      console.error('포켓몬 선택 실패:', e);
    }
  };

  return (
    <div className="w-screen h-screen p-20 flex flex-col gap-16" style={{ boxSizing: 'border-box' }}>
      <div className="text-center">
        <div className="text-24 font-bold mb-8">스테이지 클리어!</div>
        <div className="text-16">출현한 포켓몬 중 5마리를 선택하여 PC에 저장하세요</div>
        <div className="text-14 mt-8">선택됨: {selectedIndices.length}/5</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-16">
          {encounteredPokemon.map((pokemon, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`p-16 border rounded cursor-pointer ${
                selectedIndices.includes(index) ? 'bg-blue-200 border-blue-500' : 'hover:bg-gray-100'
              }`}
            >
              <div className="text-14 font-bold mb-8">{pokemon.name}</div>
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
          disabled={selectedIndices.length !== 5}
          className="px-32 py-16 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          선택 완료
        </button>
      </div>
    </div>
  );
};

export default PokemonSelect;
