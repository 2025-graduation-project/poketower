import { useEffect, useRef, useState } from 'react';
import { StarterSelectProps } from './type';
import { Pokemon } from '@/entities/pokemon/type';
import { ChooseStarting, DrawStarting, GetStartingPokemons } from '@wails/App';

const StarterSelect = ({ onConfirm }: StarterSelectProps) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reelIndexes, setReelIndexes] = useState<number[]>([-1, -1, -1]);
  const intervalsRef = useRef<number[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const canConfirm = selected.length === 3 && !isSpinning;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    try {
      await ChooseStarting(selected);
      onConfirm();
    } catch (e) {
      console.error('포켓몬 선택 실패: ', e);
    }
  };

  useEffect(() => {
    GetStartingPokemons().then((data) => {
      setPokemons(data);
    });

    const currentIntervals = intervalsRef.current;

    return () => {
      currentIntervals.forEach((id) => {
        if (id) clearInterval(id);
      });
    };
  }, []);

  const startReelRandomize = (reelIdx: number, speed = 60) => {
    const prev = intervalsRef.current[reelIdx];
    if (prev) clearInterval(prev);

    const id = window.setInterval(() => {
      setReelIndexes((prevIdx) => {
        const next = [...prevIdx];
        if (pokemons.length > 0) {
          next[reelIdx] = Math.floor(Math.random() * pokemons.length);
        }
        return next;
      });
    }, speed);

    intervalsRef.current[reelIdx] = id;
  };

  const stopReel = (reelIdx: number, finalIndex: number) => {
    const id = intervalsRef.current[reelIdx];
    if (id) {
      clearInterval(id);
      intervalsRef.current[reelIdx] = 0;
    }
    setReelIndexes((prev) => {
      const next = [...prev];
      next[reelIdx] = finalIndex;
      return next;
    });
  };

  const onSpin = async () => {
    if (isSpinning) return;
    if (pokemons.length === 0) return;

    setIsSpinning(true);
    setSelected([]);
    startReelRandomize(0, 50);
    startReelRandomize(1, 60);
    startReelRandomize(2, 70);

    let results: Pokemon[] = [];
    try {
      results = await DrawStarting();
    } catch (e) {
      console.error(e);
      results = Array.from({ length: 3 }, () => pokemons[Math.floor(Math.random() * pokemons.length)]);
    }

    const stopDelays = [900, 1400, 1800];
    results.forEach((p, i) => {
      const finalIdx = pokemons.findIndex((x) => x.id === p.id);
      const idx = finalIdx >= 0 ? finalIdx : 0;
      setTimeout(() => {
        stopReel(i, idx);
      }, stopDelays[i]);
    });

    setTimeout(
      () => {
        setSelected(results.map((r) => r.id));
        setIsSpinning(false);
      },
      Math.max(...stopDelays) + 200,
    );
  };

  const renderPokemonImage = (poke: Pokemon | undefined) => {
    if (!poke?.id) return <div className="w-full h-full bg-gray-100 animate-pulse" aria-hidden="true" />;
    const imgSrc = new URL(`../../assets/img/pokemon/${poke.id}.png`, import.meta.url).href;
    return (
      <>
        <img className="w-full h-40 object-contain drop-shadow-md" src={imgSrc} alt={poke.name} />
        <div className="text-lg font-bold text-gray-700 mt-4">{poke.name}</div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 drop-shadow-sm">함께할 포켓몬 세 마리를 뽑아주세요!</h1>

      <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-blue-100 flex flex-col items-center mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-50 z-0 pointer-events-none"></div>

        <div className="flex gap-8 relative z-10">
          {[0, 1, 2].map((i) => {
            const idx = reelIndexes[i];
            const poke = idx >= 0 && idx < pokemons.length ? pokemons[idx] : undefined;

            return (
              <div
                key={i}
                className="w-52 h-72 bg-white rounded-2xl border-4 border-gray-200 shadow-inner flex flex-col items-center justify-center relative overflow-hidden transition-all transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent opacity-30 pointer-events-none"></div>
                {renderPokemonImage(poke)}
              </div>
            );
          })}
        </div>

        <div className="flex gap-6 mt-8 relative z-10">
          <button
            onClick={onSpin}
            disabled={isSpinning}
            className={`px-10 py-4 rounded-full text-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2
              ${
                isSpinning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-1'
              }`}
          >
            {isSpinning ? (
              <>
                <span className="animate-spin">🎲</span> 추첨 중...
              </>
            ) : (
              '추첨하기!'
            )}
          </button>
          <button
            onClick={() => handleConfirm()}
            disabled={!canConfirm}
            className={`px-10 py-4 rounded-full text-xl font-bold text-white transition-all shadow-md active:scale-95
              ${
                !canConfirm
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-400 hover:bg-green-600 hover:shadow-lg hover:-translate-y-1'
              }`}
          >
            선택 완료
          </button>
        </div>
      </div>

      <div className="w-full px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center flex items-center justify-center before:flex-1 before:border-t before:border-gray-300 before:mr-4 before:content-[''] after:flex-1 after:border-t after:border-gray-300 after:ml-4 after:content-['']">
          등장하는 스타팅 포켓몬 목록
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {pokemons.map((data: Pokemon) => {
            const imgSrc = new URL(`../../assets/img/pokemon/${data.id}.png`, import.meta.url).href;
            return (
              <div
                key={data.id}
                className="w-fit flex flex-col items-center bg-white px-4 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-2 hover:border-blue-200 border border-transparent cursor-default group"
              >
                <img
                  className="w-20 h-20 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
                  src={imgSrc}
                  alt={data.name}
                />
                <div className="text-sm font-medium text-gray-600 mt-2 group-hover:text-gray-800 transition-colors">
                  {data.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StarterSelect;
