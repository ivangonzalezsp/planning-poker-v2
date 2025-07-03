import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { QuickPollsGame } from '../../types/minigames';
import styles from '../../styles/MiniGame.module.scss';

interface QuickPollsProps {
  game: QuickPollsGame;
  roomId: string;
  userName: string;
  isAdmin: boolean;
}

export const QuickPolls: React.FC<QuickPollsProps> = ({
  game,
  roomId,
  userName,
  isAdmin
}) => {
  const [currentPoll, setCurrentPoll] = useState(game.currentPoll);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame/currentPoll`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      setCurrentPoll(data);
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId]);

  const createPoll = async () => {
    if (!newQuestion.trim() || newOptions.filter(opt => opt.trim()).length < 2) return;

    const poll = {
      question: newQuestion.trim(),
      options: newOptions.filter(opt => opt.trim()),
      responses: {}
    };

    await update(ref(database, `rooms/${roomId}/miniGame/currentPoll`), poll);
    setNewQuestion('');
    setNewOptions(['', '']);
  };

  const submitResponse = async (option: string) => {
    if (!currentPoll) return;

    const updatedPoll = {
      ...currentPoll,
      responses: {
        ...currentPoll.responses,
        [userName]: option
      }
    };

    await update(ref(database, `rooms/${roomId}/miniGame/currentPoll`), updatedPoll);
  };

  const endPoll = async () => {
    if (!currentPoll) return;

    // Move to history
    const historyRef = ref(database, `rooms/${roomId}/miniGame/pollHistory`);
    const currentHistory = game.pollHistory || [];
    await update(historyRef, [...currentHistory, currentPoll]);

    // Clear current poll
    await remove(ref(database, `rooms/${roomId}/miniGame/currentPoll`));
  };

  const addOption = () => {
    setNewOptions([...newOptions, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  return (
    <div className={styles.quickPolls}>
      {currentPoll ? (
        <div className={styles.activePoll}>
          <h4>{currentPoll.question}</h4>
          <div className={styles.pollOptions}>
            {currentPoll.options.map(option => (
              <button
                key={option}
                className={`${styles.pollOption} ${
                  currentPoll.responses[userName] === option ? styles.selected : ''
                }`}
                onClick={() => submitResponse(option)}
              >
                {option}
                <span className={styles.responseCount}>
                  ({Object.values(currentPoll.responses).filter(r => r === option).length})
                </span>
              </button>
            ))}
          </div>
          {isAdmin && (
            <button className={styles.endPollButton} onClick={endPoll}>
              End Poll
            </button>
          )}
        </div>
      ) : isAdmin ? (
        <div className={styles.createPoll}>
          <h4>Create Quick Poll</h4>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Poll question..."
            className={styles.questionInput}
          />
          {newOptions.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}...`}
              className={styles.optionInput}
            />
          ))}
          <button className={styles.addOptionButton} onClick={addOption}>
            + Add Option
          </button>
          <button className={styles.createPollButton} onClick={createPoll}>
            Create Poll
          </button>
        </div>
      ) : (
        <p className={styles.waitingMessage}>Waiting for admin to create a poll...</p>
      )}
    </div>
  );
};