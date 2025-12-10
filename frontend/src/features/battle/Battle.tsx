import { useEffect, useState } from 'react';
import { BattleProps, StageState } from './type';
import { GetStageState } from '@wails/App';

const Battle = ({ onRestart }: BattleProps) => {
  const [stageInfo, setStageInfo] = useState<StageState | null>(null);

  useEffect(() => {
    const fetchStageData = async () => {
      try {
        const data = await GetStageState();
        console.log('로드된 스테이지 정보:', data);
        setStageInfo(data);
      } catch (e) {
        console.error('스테이지 정보를 가져오는데 실패했습니다:', e);
      }
    };

    fetchStageData();
  }, []);

  return (
    <div>
      <div>
        <div>
          <div>
            {stageInfo ? (
              <span>현재 스테이지: {stageInfo.currentFloor}층</span>
            ) : (
              <span>스테이지 정보 불러오는 중...</span>
            )}
          </div>
          <button onClick={onRestart}>처음으로</button>
        </div>
        <div>
          <div>배틀 진행 화면</div>
        </div>
      </div>
    </div>
  );
};

export default Battle;
