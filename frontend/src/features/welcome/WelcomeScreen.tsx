import { WelcomeScreenProps } from './type';

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div>
      <div>환영합니다</div>
      <div onClick={() => onStart()}>시작</div>
    </div>
  );
};

export default WelcomeScreen;
