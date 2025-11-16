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

  const handleConfirm = async () => {
    if (selected.length !== 3) return;
    try {
      await ChooseStarting(selected);
      onConfirm();
      console.log('포켓몬 선택 완료: ', selected);
    } catch (e) {
      console.error('포켓몬 선택 실패: ', e);
    }
  };

  useEffect(() => {
    GetStartingPokemons().then((data) => {
      setPokemons(data);
    });
    return () => {
      intervalsRef.current.forEach((id) => {
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
    startReelRandomize(0, 50);
    startReelRandomize(1, 60);
    startReelRandomize(2, 70);

    console.log('추첨 시작', new Date());
    let results: Pokemon[] = [];
    try {
      results = await DrawStarting();
      console.log('추첨 완료', new Date(), results);
      setSelected(results.map((r) => r.id));
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
        console.log(
          '추첨 결과:',
          results.map((r) => r.id),
        );
      },
      Math.max(...stopDelays) + 200,
    );
  };

  return (
    <div className="w-screen">
      <div className="text-center">포켓몬 세 마리를 뽑기</div>
      <div className="flex flex-col items-center gap-16 p-20">
        <div className="flex rounded-4">
          {[0, 1, 2].map((i) => {
            const idx = reelIndexes[i];
            const poke = idx >= 0 && idx < pokemons.length ? pokemons[idx] : undefined;
            const imgSrc =
              poke?.id != null ? new URL('../../assets/img/pokemon/' + poke.id + '.png', import.meta.url).href : '';
            return (
              <div key={i} className="w-60 rounded-4 flex flex-col items-center justify-center overflow-hidden">
                {imgSrc ? (
                  <>
                    <img className="w-full h-full object-contain" src={imgSrc} alt={poke?.name ?? ''} />
                    <div>{poke?.name}</div>
                  </>
                ) : (
                  <div className="w-full h-full" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onSpin} disabled={isSpinning}>
          {isSpinning ? '추첨중...' : '추첨하기'}
        </button>
      </div>

      <div onClick={() => handleConfirm()}>선택 완료</div>

      <div>스타팅 포켓몬 목록</div>
      <div className="grid grid-cols-auto-fill gap-16 p-20">
        {pokemons.map((data: Pokemon) => (
          <div key={data.id} className="flex flex-col">
            <img className="w-60" src={new URL('../../assets/img/pokemon/' + data.id + '.png', import.meta.url).href} />
            <div>{data.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StarterSelect;
