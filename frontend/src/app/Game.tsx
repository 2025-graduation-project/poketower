import { useState } from 'react';

import { GameStage } from './type';

import WelcomeScreen from '@/features/welcome/WelcomeScreen';
import StarterSelect from '@/features/starter/StarterSelect';
import Battle from '@/features/battle/Battle';
import { DrawStarting } from '@wails/App';

const Game = () => {
  const [stage, setStage] = useState<GameStage>('WELCOME');

  return (
    <div>
      {stage === 'WELCOME' && <WelcomeScreen onStart={() => setStage('SELECT_STARTERS')} />}
      {stage === 'SELECT_STARTERS' && <StarterSelect onConfirm={() => setStage('BATTLE')} />}
      {stage === 'BATTLE' && <Battle onRestart={() => setStage('WELCOME')} />}
      {/* TODO: 스타팅 포켓몬 추첨 작업 후 삭제 */}
      <div
        onClick={async () => {
          console.log('추첨 시작', new Date());
          const pokemons = await DrawStarting();
          console.log('추첨 완료', new Date());
          console.log('추첨 결과', pokemons);
        }}
      >
        추첨하기
      </div>
    </div>
  );
};

export default Game;
