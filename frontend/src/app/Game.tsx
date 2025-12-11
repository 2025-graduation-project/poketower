import { useState } from 'react';
import { GameStage } from './type';
import WelcomeScreen from '@/features/welcome/WelcomeScreen';
import StarterSelect from '@/features/starter/StarterSelect';
import Battle from '@/features/battle/Battle';
import PokemonSelect from '@/features/pokemon-select/PokemonSelect';
import PCSelect from '@/features/pc/PCSelect';
import Leaderboard from '@/features/leaderboard/Leaderboard';

const Game = () => {
  const [stage, setStage] = useState<GameStage>('WELCOME');

  return (
    <div>
      {stage === 'WELCOME' && <WelcomeScreen onStart={() => setStage('SELECT_STARTERS')} />}
      {stage === 'SELECT_STARTERS' && <StarterSelect onConfirm={() => setStage('BATTLE')} />}
      {stage === 'BATTLE' && (
        <Battle onStageComplete={() => setStage('SELECT_POKEMON')} onGameOver={() => setStage('LEADERBOARD')} />
      )}
      {stage === 'SELECT_POKEMON' && <PokemonSelect onComplete={() => setStage('PC_SELECT')} />}
      {stage === 'PC_SELECT' && <PCSelect onComplete={() => setStage('BATTLE')} />}
      {stage === 'LEADERBOARD' && <Leaderboard onRestart={() => setStage('WELCOME')} />}
    </div>
  );
};

export default Game;
