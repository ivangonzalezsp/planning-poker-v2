import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { SilentQuestionsGame } from '../../types/minigames';
import styles from '../../styles/MiniGame.module.scss';

interface SilentQuestionsProps {
  game: SilentQuestionsGame;
  roomId: string;
  userName: string;
}

export const SilentQuestions: React.FC<SilentQuestionsProps> = ({
  game,
  roomId,
  userName
}) => {
  const [questions, setQuestions] = useState(game.questions);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame/questions`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const questionsArray = Object.entries(data).map(([id, q]: any) => ({
          id,
          ...q
        }));
        setQuestions(questionsArray.sort((a, b) => b.upvotes.length - a.upvotes.length));
      }
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId]);

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const questionData = {
      question: newQuestion.trim(),
      submittedBy: userName,
      upvotes: [],
      timestamp: Date.now()
    };

    await push(ref(database, `rooms/${roomId}/miniGame/questions`), questionData);
    setNewQuestion('');
  };

  const toggleUpvote = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const hasUpvoted = question.upvotes.includes(userName);
    const newUpvotes = hasUpvoted 
      ? question.upvotes.filter(user => user !== userName)
      : [...question.upvotes, userName];

    await update(ref(database, `rooms/${roomId}/miniGame/questions/${questionId}/upvotes`), newUpvotes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitQuestion();
    }
  };

  return (
    <div className={styles.silentQuestions}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Got a question? Ask it silently..."
          className={styles.questionInput}
        />
        <button 
          onClick={submitQuestion}
          disabled={!newQuestion.trim()}
          className={styles.submitButton}
        >
          Ask
        </button>
      </div>

      <div className={styles.questionsList}>
        {questions.length > 0 ? (
          questions.map(question => (
            <div key={question.id} className={styles.questionItem}>
              <div className={styles.questionText}>{question.question}</div>
              <div className={styles.questionMeta}>
                <button
                  className={`${styles.upvoteButton} ${
                    question.upvotes.includes(userName) ? styles.upvoted : ''
                  }`}
                  onClick={() => toggleUpvote(question.id)}
                >
                  👍 {question.upvotes.length}
                </button>
                <small className={styles.submitter}>by {question.submittedBy}</small>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyState}>No questions yet. Be the first to ask!</p>
        )}
      </div>
    </div>
  );
};