import { StarterSelectProps } from './type';

const StarterSelect = ({ onConfirm }: StarterSelectProps) => {
  return (
    <div>
      <div>포켓몬 세 마리를 고르기</div>
      <div onClick={() => onConfirm()}>선택 완료</div>
    </div>
  );
};

export default StarterSelect;
