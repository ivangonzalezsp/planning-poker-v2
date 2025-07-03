import React, { useState, useEffect } from 'react';
import { MiniGame } from '../../types/minigames';
import { KeywordSpotting } from './KeywordSpotting';
import { ComplexityBingo } from './ComplexityBingo';
import { EstimationPrediction } from './EstimationPrediction';
import { QuickPolls } from './QuickPolls';
import { AttentionMeter } from './AttentionMeter';
import { SilentQuestions } from './SilentQuestions';
import { StoryChecklist } from './StoryChecklist';
import styles from '../../styles/MiniGame.module.scss';

interface MiniGameWidgetProps {
  game: MiniGame | null;
  roomId: string;
  userName: string;
  isAdmin: boolean;
  isExplanationPhase: boolean;
}

export const MiniGameWidget: React.FC<MiniGameWidgetProps> = ({
  game,
  roomId,
  userName,
  isAdmin,
  isExplanationPhase
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (game && isExplanationPhase && !showWelcome) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [game, isExplanationPhase]);

  if (!game || !isExplanationPhase) {
    return null;
  }

  const renderGameComponent = () => {
    switch (game.type) {
      case 'keyword-spotting':
        return <KeywordSpotting game={game} roomId={roomId} userName={userName} />;
      case 'complexity-bingo':
        return <ComplexityBingo game={game} roomId={roomId} userName={userName} />;
      case 'estimation-prediction':
        return <EstimationPrediction game={game} roomId={roomId} userName={userName} />;
      case 'quick-polls':
        return <QuickPolls game={game} roomId={roomId} userName={userName} isAdmin={isAdmin} />;
      case 'attention-meter':
        return <AttentionMeter game={game} roomId={roomId} userName={userName} />;
      case 'silent-questions':
        return <SilentQuestions game={game} roomId={roomId} userName={userName} />;
      case 'story-checklist':
        return <StoryChecklist game={game} roomId={roomId} userName={userName} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  return (
    <div className={`${styles.miniGameWidget} ${isMinimized ? styles.minimized : ''}`}>
      {showWelcome && (
        <div className={styles.welcomeMessage}>
          <h4>🎮 {game.name}</h4>
          <p>{game.description}</p>
        </div>
      )}
      
      <div className={styles.widgetHeader}>
        <div className={styles.gameTitle}>
          <span className={styles.gameIcon}>🎮</span>
          <span>{game.name}</span>
        </div>
        <button 
          className={styles.minimizeButton}
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? 'Expand game' : 'Minimize game'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <div className={styles.gameContent}>
          {renderGameComponent()}
        </div>
      )}
    </div>
  );
};