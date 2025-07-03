import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { ComplexityBingoGame } from '../../types/minigames';
import { generateRandomBingoCard, checkBingoWin } from '../../utils/miniGameUtils';
import styles from '../../styles/MiniGame.module.scss';

interface ComplexityBingoProps {
  game: ComplexityBingoGame;
  roomId: string;
  userName: string;
}

export const ComplexityBingo: React.FC<ComplexityBingoProps> = ({
  game,
  roomId,
  userName
}) => {
  const [userCard, setUserCard] = useState(game.bingoCards[userName] || { ...generateRandomBingoCard(), hasWon: false });
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    // Initialize user's bingo card if it doesn't exist
    if (!game.bingoCards[userName]) {
      const newCard = generateRandomBingoCard();
      const newCardWithWinStatus = { ...newCard, hasWon: false };
      setUserCard(newCardWithWinStatus);
      update(ref(database, `rooms/${roomId}/miniGame/bingoCards/${userName}`), newCardWithWinStatus);
    }
  }, [game.bingoCards, roomId, userName]);

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame/bingoCards/${userName}`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserCard(data);
        setHasWon(data.hasWon || false);
      }
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId, userName]);

  const markSquare = async (index: number) => {
    if (hasWon) return;

    const newMarkedSquares = [...userCard.markedSquares];
    newMarkedSquares[index] = !newMarkedSquares[index];
    
    const updatedCard = {
      ...userCard,
      markedSquares: newMarkedSquares
    };

    const won = checkBingoWin(newMarkedSquares);
    if (won) {
      updatedCard.hasWon = true;
      setHasWon(true);
    }

    setUserCard(updatedCard);
    await update(ref(database, `rooms/${roomId}/miniGame/bingoCards/${userName}`), updatedCard);
  };

  return (
    <div className={styles.complexityBingo}>
      {hasWon && (
        <div className={styles.winMessage}>
          🎉 BINGO! You won!
        </div>
      )}
      
      <div className={styles.bingoGrid}>
        {userCard.card.map((term, index) => (
          <button
            key={index}
            className={`${styles.bingoSquare} ${
              userCard.markedSquares[index] ? styles.marked : ''
            }`}
            onClick={() => markSquare(index)}
            disabled={hasWon}
          >
            {term}
          </button>
        ))}
      </div>
      
      <div className={styles.instructions}>
        <small>Click terms as you hear them mentioned!</small>
      </div>
    </div>
  );
};