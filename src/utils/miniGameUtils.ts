import { MiniGame } from '../types/minigames';

export const MINI_GAME_TYPES = [
  'keyword-spotting',
  'complexity-bingo', 
  'estimation-prediction',
  'quick-polls',
  'attention-meter',
  'silent-questions',
  'story-checklist'
] as const;

export const MINI_GAME_CONFIGS = {
  'keyword-spotting': {
    name: 'Keyword Spotting',
    description: 'Identify key terms during story explanation'
  },
  'complexity-bingo': {
    name: 'Complexity Bingo',
    description: 'Mark technical terms as they are mentioned'
  },
  'estimation-prediction': {
    name: 'Estimation Prediction',
    description: 'Predict what others will vote'
  },
  'quick-polls': {
    name: 'Quick Polls',
    description: 'Answer instant micro-polls during explanation'
  },
  'attention-meter': {
    name: 'Attention Meter',
    description: 'Keep the engagement meter high with reactions'
  },
  'silent-questions': {
    name: 'Silent Questions',
    description: 'Submit questions without interrupting'
  },
  'story-checklist': {
    name: 'Story Checklist',
    description: 'Collaborative story completeness checklist'
  }
};

export const BINGO_TERMS = [
  'API Call', 'Database', 'Frontend', 'Backend', 'Testing', 'DevOps',
  'User Story', 'Edge Case', 'Third Party', 'Security', 'Performance',
  'Validation', 'Error Handling', 'Mobile', 'Cache', 'Migration',
  'Authentication', 'Authorization', 'Logging', 'Monitoring', 'Deployment',
  'Integration', 'Unit Test', 'Bug Fix', 'Feature Flag', 'Rollback'
];

export function getRandomMiniGameType(): typeof MINI_GAME_TYPES[number] {
  const randomIndex = Math.floor(Math.random() * MINI_GAME_TYPES.length);
  return MINI_GAME_TYPES[randomIndex];
}

export function createMiniGame(roomId: string, gameType: typeof MINI_GAME_TYPES[number]): MiniGame {
  const baseGame = {
    id: `${roomId}-${gameType}-${Date.now()}`,
    name: MINI_GAME_CONFIGS[gameType].name,
    description: MINI_GAME_CONFIGS[gameType].description,
    isActive: false,
    roomId
  };

  switch (gameType) {
    case 'keyword-spotting':
      return {
        ...baseGame,
        type: 'keyword-spotting',
        keywords: {}
      };

    case 'complexity-bingo':
      return {
        ...baseGame,
        type: 'complexity-bingo',
        bingoCards: {},
        bingoTerms: generateBingoCard()
      };

    case 'estimation-prediction':
      return {
        ...baseGame,
        type: 'estimation-prediction',
        predictions: {},
        revealed: false
      };

    case 'quick-polls':
      return {
        ...baseGame,
        type: 'quick-polls',
        pollHistory: []
      };

    case 'attention-meter':
      return {
        ...baseGame,
        type: 'attention-meter',
        meterLevel: 50,
        recentReactions: []
      };

    case 'silent-questions':
      return {
        ...baseGame,
        type: 'silent-questions',
        questions: []
      };

    case 'story-checklist':
      return {
        ...baseGame,
        type: 'story-checklist',
        checklist: {
          acceptanceCriteria: false,
          dependencies: false,
          uiRequirements: false,
          testingApproach: false,
          risksDiscussed: false
        },
        completedBy: {}
      };

    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
}

export function generateBingoCard(): string[] {
  // Shuffle and take 25 terms for a 5x5 bingo card
  const shuffled = [...BINGO_TERMS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 25);
}

export function generateRandomBingoCard(): { card: string[], markedSquares: boolean[] } {
  const card = generateBingoCard();
  return {
    card,
    markedSquares: new Array(25).fill(false)
  };
}

export function checkBingoWin(markedSquares: boolean[]): boolean {
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (markedSquares.slice(row * 5, (row + 1) * 5).every(marked => marked)) {
      return true;
    }
  }

  // Check columns  
  for (let col = 0; col < 5; col++) {
    if ([0, 1, 2, 3, 4].every(row => markedSquares[row * 5 + col])) {
      return true;
    }
  }

  // Check diagonals
  if ([0, 6, 12, 18, 24].every(idx => markedSquares[idx])) {
    return true;
  }
  if ([4, 8, 12, 16, 20].every(idx => markedSquares[idx])) {
    return true;
  }

  return false;
}

export function getAttentionMeterColor(level: number): string {
  if (level >= 80) return '#4CAF50'; // Green
  if (level >= 60) return '#FFC107'; // Yellow
  if (level >= 40) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

export function updateAttentionMeter(currentLevel: number, action: 'reaction' | 'decay'): number {
  if (action === 'reaction') {
    return Math.min(100, currentLevel + 15);
  } else {
    return Math.max(0, currentLevel - 1);
  }
}