import { useState } from 'react';
import { GameStage } from './type';
import WelcomeScreen from '@/features/welcome/WelcomeScreen';
import StarterSelect from '@/features/starter/StarterSelect';
import Battle from '@/features/battle/Battle';

const Game = () => {
  const [stage, setStage] = useState<GameStage>('WELCOME');

  return (
    <div>
      {stage === 'WELCOME' && <WelcomeScreen onStart={() => setStage('SELECT_STARTERS')} />}
      {stage === 'SELECT_STARTERS' && <StarterSelect onConfirm={() => setStage('BATTLE')} />}
      {stage === 'BATTLE' && <Battle onRestart={() => setStage('WELCOME')} />}
    </div>
  );
};

export default Game;
