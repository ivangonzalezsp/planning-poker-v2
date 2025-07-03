import React, { useState, useEffect } from 'react';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { StoryChecklistGame } from '../../types/minigames';
import styles from '../../styles/MiniGame.module.scss';

interface StoryChecklistProps {
  game: StoryChecklistGame;
  roomId: string;
  userName: string;
}

export const StoryChecklist: React.FC<StoryChecklistProps> = ({
  game,
  roomId,
  userName
}) => {
  const [checklist, setChecklist] = useState(game.checklist);
  const [completedBy, setCompletedBy] = useState(game.completedBy);

  useEffect(() => {
    const gameRef = ref(database, `rooms/${roomId}/miniGame`);
    const listener = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChecklist(data.checklist || {});
        setCompletedBy(data.completedBy || {});
      }
    });

    return () => off(gameRef, 'value', listener);
  }, [roomId]);

  const toggleChecklistItem = async (item: string) => {
    const isCurrentlyChecked = (checklist as any)[item];
    const currentCompletedBy = completedBy[item] || [];
    
    let newCompletedBy;
    if (isCurrentlyChecked) {
      // If unchecking, remove this user from completedBy
      newCompletedBy = currentCompletedBy.filter(user => user !== userName);
    } else {
      // If checking, add this user to completedBy
      newCompletedBy = [...currentCompletedBy, userName];
    }

    const newChecklist = {
      ...checklist,
      [item]: newCompletedBy.length > 0
    } as any;

    const newCompletedByState = {
      ...completedBy,
      [item]: newCompletedBy
    };

    setChecklist(newChecklist);
    setCompletedBy(newCompletedByState);

    await update(ref(database, `rooms/${roomId}/miniGame`), {
      checklist: newChecklist,
      completedBy: newCompletedByState
    });
  };

  const checklistItems = [
    { key: 'acceptanceCriteria', label: 'Clear acceptance criteria' },
    { key: 'dependencies', label: 'Dependencies identified' },
    { key: 'uiRequirements', label: 'UI/UX requirements clear' },
    { key: 'testingApproach', label: 'Testing approach defined' },
    { key: 'risksDiscussed', label: 'Risks discussed' }
  ];

  const completionPercentage = (Object.values(checklist).filter(Boolean).length / checklistItems.length) * 100;

  return (
    <div className={styles.storyChecklist}>
      <div className={styles.progressBar}>
        <div className={styles.progressLabel}>Story Completeness</div>
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressFill}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className={styles.progressValue}>{Math.round(completionPercentage)}%</div>
      </div>

      <div className={styles.checklistItems}>
        {checklistItems.map(({ key, label }) => (
          <div key={key} className={styles.checklistItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={(checklist as any)[key] || false}
                onChange={() => toggleChecklistItem(key)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxCustom}>
                {(checklist as any)[key] ? '✓' : ''}
              </span>
              <span className={styles.itemLabel}>{label}</span>
            </label>
            {completedBy[key] && completedBy[key].length > 0 && (
              <div className={styles.completedBy}>
                <small>✓ by {completedBy[key].join(', ')}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.instructions}>
        <small>Collaborate to ensure story readiness before voting!</small>
      </div>
    </div>
  );
};