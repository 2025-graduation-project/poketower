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
      className="w-screen h-screen flex flex-col items-center justify-center gap-16 bg-center bg-cover bg-no-repeat relative"
      style={{ backgroundImage: `url(${welcomeBg})` }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center gap-12 animate-fade-in-up">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white text-center drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-wide">
          포켓타워에
          <br />
          오신 걸 환영합니다
        </h1>

        <button
          onClick={() => handleGameStart()}
          className="group relative px-12 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full transition-all duration-300 hover:scale-105 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95"
        >
          <span className="text-3xl font-bold text-white drop-shadow-md group-hover:text-yellow-300 transition-colors">
            게임 시작
          </span>

          <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-2xl animate-pulse">
            ▶
          </span>
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-2xl animate-pulse">
            ◀
          </span>
        </button>
      </div>

      <div className="absolute bottom-8 text-white/50 text-sm z-10 font-medium">Press Start to Play</div>
    </div>
  );
};

export default WelcomeScreen;
