import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { EstimationPredictionGame } from '../../types/minigames';
import styles from '../../styles/MiniGame.module.scss';

interface EstimationPredictionProps {
  game: EstimationPredictionGame;
  roomId: string;
  userName: string;
}

export const EstimationPrediction: React.FC<EstimationPredictionProps> = ({
  game,
  roomId,
  userName
}) => {
  const [predictions, setPredictions] = useState<{[key: string]: string}>({});
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const participantsRef = ref(database, `rooms/${roomId}/participants`);
    const participantsListener = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParticipants(Object.keys(data).filter(name => name !== userName));
      }
    });

    const gameRef = ref(database, `rooms/${roomId}/miniGame/predictions/${userName}`);
    const gameListener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPredictions(data);
      }
    });

    return () => {
      off(participantsRef, 'value', participantsListener);
      off(gameRef, 'value', gameListener);
    };
  }, [roomId, userName]);

  const updatePrediction = async (targetUser: string, vote: string) => {
    const newPredictions = { ...predictions, [targetUser]: vote };
    setPredictions(newPredictions);
    await update(ref(database, `rooms/${roomId}/miniGame/predictions/${userName}`), newPredictions);
  };

  const voteOptions = ['1', '2', '3', '5', '8', '13', '20', '40', '100'];

  return (
    <div className={styles.estimationPrediction}>
      <h4>Predict Others&apos; Votes</h4>
      <div className={styles.predictionGrid}>
        {participants.map(participant => (
          <div key={participant} className={styles.participantPrediction}>
            <span className={styles.participantName}>{participant}</span>
            <div className={styles.voteOptions}>
              {voteOptions.map(option => (
                <button
                  key={option}
                  className={`${styles.voteOption} ${
                    predictions[participant] === option ? styles.selected : ''
                  }`}
                  onClick={() => updatePrediction(participant, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {participants.length === 0 && (
        <p className={styles.emptyState}>Waiting for other participants...</p>
      )}
    </div>
  );
};