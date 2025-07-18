import { useEffect, useState } from 'react';
import { ChooseStarting, GetStartingPokemons } from '@wails/App';
import { StarterSelectProps } from './type';
import { Pokemon } from '@/entities/pokemon/type';

const StarterSelect = ({ onConfirm }: StarterSelectProps) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const pokemonSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((pid) => pid !== id));
    } else if (selected.length < 3) {
      setSelected((prev) => [...prev, id]);
    }
  };

  const handleConfirm = async () => {
    if (selected.length !== 3) return;

    try {
      await ChooseStarting(selected);
      console.log('포켓몬 선택 완료: ', selected);
      onConfirm();
    } catch (e) {
      console.error('포켓몬 선택 실패: ', e);
    }
  };

  useEffect(() => {
    GetStartingPokemons().then((data) => {
      setPokemons(data);
    });
  }, []);

  return (
    <div className="w-screen">
      <div>포켓몬 세 마리를 고르기</div>
      <div className="grid grid-cols-auto-fill gap-16 p-20">
        {pokemons.map((data: Pokemon) => (
          <div
            key={data.id}
            className="flex flex-col"
            style={{
              border: selected.includes(data.id) ? '3px solid #f8b400' : '2px solid #ccc',
            }}
            onClick={() => pokemonSelect(data.id)}
          >
            <img className="w-60" src={new URL('../../assets/img/pokemon/' + data.id + '.png', import.meta.url).href} />
            <div>{data.name}</div>
          </div>
        ))}
      </div>
      <div onClick={() => handleConfirm()}>선택 완료</div>
    </div>
  );
};

export default StarterSelect;
