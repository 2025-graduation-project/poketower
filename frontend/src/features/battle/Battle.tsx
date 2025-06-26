import { BattleProps } from './type';

const Battle = ({ onRestart }: BattleProps) => {
  return (
    <div>
      <div>배틀 시작</div>
      <div onClick={() => onRestart()}>처음으로</div>
    </div>
  );
};

export default Battle;
