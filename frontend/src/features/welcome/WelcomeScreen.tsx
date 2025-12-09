import { WelcomeScreenProps } from './type';
import { InitGame } from '@wails/App';
import welcomeBg from '@/assets/img/welcomeBg.png';

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const handleGameStart = async () => {
    try {
      await InitGame();
      onStart();
    } catch (error) {
      console.error('게임 초기화 실패:', error);
    }
  };

  return (
    <div
      className="w-screen h-screen flex flex-col justify-center gap-40 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${welcomeBg})` }}
    >
      <div className="text-48 text-center">포켓타워에 오신 걸 환영합니다</div>
      <div className="cursor-pointer text-24 text-center" onClick={() => handleGameStart()}>
        게임 시작
      </div>
    </div>
  );
};

export default WelcomeScreen;
