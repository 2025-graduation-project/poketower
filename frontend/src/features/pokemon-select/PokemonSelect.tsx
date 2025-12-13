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

  const getPokemonImg = (id: number) => {
    return new URL(`../../assets/img/pokemon/${id}.png`, import.meta.url).href;
  };

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
    <div className="w-screen h-screen p-5 flex flex-col gap-8 bg-gray-50">
      <div className="text-center shrink-0">
        <div className="text-3xl font-bold mb-2 text-gray-800">스테이지 클리어!</div>
        <div className="text-base text-gray-600">출현한 포켓몬 중 5마리를 선택하여 PC에 저장하세요</div>
        <div className="text-sm mt-3 font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
          선택됨: {selectedIndices.length}/5
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1">
        <div className="grid grid-cols-5 gap-4">
          {encounteredPokemon.map((pokemon, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col ${
                selectedIndices.includes(index)
                  ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:-translate-y-1 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center mb-3">
                <img
                  src={getPokemonImg(pokemon.id)}
                  alt={pokemon.name}
                  className="w-20 h-20 object-contain drop-shadow-sm mb-2"
                />
                <div className="text-sm font-bold text-gray-800">{pokemon.name}</div>
                <div className="flex gap-1 mt-1">
                  {pokemon.types.map((t, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
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
          disabled={selectedIndices.length !== 5}
          className={`px-10 py-4 rounded-xl text-lg font-bold text-white transition-all shadow-md ${
            selectedIndices.length === 5
              ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
};

export default PokemonSelect;
