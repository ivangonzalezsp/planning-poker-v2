import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { KeywordSpottingGame } from '../../types/minigames';
import styles from '../../styles/MiniGame.module.scss';

interface KeywordSpottingProps {
  game: KeywordSpottingGame;
  roomId: string;
  userName: string;
}

export const KeywordSpotting: React.FC<KeywordSpottingProps> = ({
  game,
  roomId,
  userName
}) => {
  const [currentWord, setCurrentWord] = useState('');
  const [keywords, setKeywords] = useState(game.keywords);

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame/keywords`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setKeywords(data);
      }
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId]);

  const submitKeyword = async () => {
    if (!currentWord.trim()) return;

    const word = currentWord.trim().toLowerCase();
    const currentKeywordData = keywords[word] || { count: 0, submittedBy: [] };
    
    // Only increment if user hasn't already submitted this word
    if (!currentKeywordData.submittedBy.includes(userName)) {
      const updatedKeywordData = {
        count: currentKeywordData.count + 1,
        submittedBy: [...currentKeywordData.submittedBy, userName]
      };

      await update(ref(database, `rooms/${roomId}/miniGame/keywords/${word}`), updatedKeywordData);
      setCurrentWord('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitKeyword();
    }
  };

  const sortedKeywords = Object.entries(keywords)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20); // Show top 20 keywords

  const getWordSize = (count: number, maxCount: number) => {
    const minSize = 0.8;
    const maxSize = 2;
    const ratio = maxCount > 0 ? count / maxCount : 0;
    return minSize + (maxSize - minSize) * ratio;
  };

  const maxCount = Math.max(...Object.values(keywords).map(k => k.count), 1);

  return (
    <div className={styles.keywordSpotting}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Hear a key term? Add it!"
          className={styles.keywordInput}
        />
        <button 
          onClick={submitKeyword}
          disabled={!currentWord.trim()}
          className={styles.submitButton}
        >
          Add
        </button>
      </div>

      <div className={styles.wordCloud}>
        {sortedKeywords.length > 0 ? (
          sortedKeywords.map(([word, data]) => (
            <span
              key={word}
              className={styles.cloudWord}
              style={{
                fontSize: `${getWordSize(data.count, maxCount)}em`,
                opacity: 0.7 + (data.count / maxCount) * 0.3
              }}
              title={`Mentioned ${data.count} times`}
            >
              {word}
            </span>
          ))
        ) : (
          <p className={styles.emptyState}>No keywords spotted yet. Start listening!</p>
        )}
      </div>

      <div className={styles.stats}>
        <small>{Object.keys(keywords).length} unique terms spotted</small>
      </div>
    </div>
  );
};