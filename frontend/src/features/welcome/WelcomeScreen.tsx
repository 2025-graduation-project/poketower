import welcomeBg from '@/assets/img/welcomeBg.png';

import { WelcomeScreenProps } from './type';

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div
      className="w-screen h-screen flex flex-col justify-center gap-40 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${welcomeBg})` }}
    >
      <div className="text-48 text-center">포켓타워에 오신 걸 환영합니다</div>
      <div className="cursor-pointer text-24 text-center" onClick={() => onStart()}>
        게임 시작
      </div>
    </div>
  );
};

export default WelcomeScreen;
