import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { AttentionMeterGame } from '../../types/minigames';
import { getAttentionMeterColor, updateAttentionMeter } from '../../utils/miniGameUtils';
import styles from '../../styles/MiniGame.module.scss';

interface AttentionMeterProps {
  game: AttentionMeterGame;
  roomId: string;
  userName: string;
}

export const AttentionMeter: React.FC<AttentionMeterProps> = ({
  game,
  roomId,
  userName
}) => {
  const [meterLevel, setMeterLevel] = useState(game.meterLevel);
  const [recentReactions, setRecentReactions] = useState(game.recentReactions);

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMeterLevel(data.meterLevel || 50);
        setRecentReactions(data.recentReactions || []);
      }
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId]);

  useEffect(() => {
    // Decay meter over time
    const interval = setInterval(async () => {
      const newLevel = updateAttentionMeter(meterLevel, 'decay');
      if (newLevel !== meterLevel) {
        setMeterLevel(newLevel);
        await update(ref(database, `rooms/${roomId}/miniGame/meterLevel`), newLevel);
      }
    }, 5000); // Decay every 5 seconds

    return () => clearInterval(interval);
  }, [meterLevel, roomId]);

  const addReaction = async (type: 'like' | 'question' | 'confused' | 'idea') => {
    const reaction = {
      userId: userName,
      timestamp: Date.now(),
      type
    };

    const newReactions = [...recentReactions.slice(-9), reaction]; // Keep last 10
    const newLevel = updateAttentionMeter(meterLevel, 'reaction');

    setRecentReactions(newReactions);
    setMeterLevel(newLevel);

    await update(ref(database, `rooms/${roomId}/miniGame`), {
      meterLevel: newLevel,
      recentReactions: newReactions
    });
  };

  const reactionButtons = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'question', emoji: '❓', label: 'Question' },
    { type: 'confused', emoji: '😕', label: 'Confused' },
    { type: 'idea', emoji: '💡', label: 'Idea' }
  ] as const;

  return (
    <div className={styles.attentionMeter}>
      <div className={styles.meterContainer}>
        <div className={styles.meterLabel}>Team Attention</div>
        <div className={styles.meterBar}>
          <div 
            className={styles.meterFill}
            style={{
              width: `${meterLevel}%`,
              backgroundColor: getAttentionMeterColor(meterLevel)
            }}
          />
        </div>
        <div className={styles.meterValue}>{meterLevel}%</div>
      </div>

      <div className={styles.reactionButtons}>
        {reactionButtons.map(({ type, emoji, label }) => (
          <button
            key={type}
            className={styles.reactionButton}
            onClick={() => addReaction(type)}
            title={label}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className={styles.recentActivity}>
        {recentReactions.slice(-5).map((reaction, index) => (
          <span key={index} className={styles.reactionBubble}>
            {reactionButtons.find(b => b.type === reaction.type)?.emoji}
          </span>
        ))}
      </div>
    </div>
  );
};