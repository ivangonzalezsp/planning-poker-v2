export interface MiniGameBase {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  roomId: string;
}

export interface KeywordSpottingGame extends MiniGameBase {
  type: 'keyword-spotting';
  keywords: {
    [word: string]: {
      count: number;
      submittedBy: string[];
    };
  };
}

export interface ComplexityBingoGame extends MiniGameBase {
  type: 'complexity-bingo';
  bingoCards: {
    [userId: string]: {
      card: string[];
      markedSquares: boolean[];
      hasWon: boolean;
    };
  };
  bingoTerms: string[];
}

export interface EstimationPredictionGame extends MiniGameBase {
  type: 'estimation-prediction';
  predictions: {
    [userId: string]: {
      [targetUserId: string]: string | number;
    };
  };
  revealed: boolean;
}

export interface QuickPollsGame extends MiniGameBase {
  type: 'quick-polls';
  currentPoll?: {
    question: string;
    options: string[];
    responses: {
      [userId: string]: string;
    };
  };
  pollHistory: Array<{
    question: string;
    options: string[];
    responses: {
      [userId: string]: string;
    };
  }>;
}

export interface AttentionMeterGame extends MiniGameBase {
  type: 'attention-meter';
  meterLevel: number; // 0-100
  recentReactions: Array<{
    userId: string;
    timestamp: number;
    type: 'like' | 'question' | 'confused' | 'idea';
  }>;
}

export interface SilentQuestionsGame extends MiniGameBase {
  type: 'silent-questions';
  questions: Array<{
    id: string;
    question: string;
    submittedBy: string;
    upvotes: string[];
    timestamp: number;
  }>;
}

export interface StoryChecklistGame extends MiniGameBase {
  type: 'story-checklist';
  checklist: {
    acceptanceCriteria: boolean;
    dependencies: boolean;
    uiRequirements: boolean;
    testingApproach: boolean;
    risksDiscussed: boolean;
  };
  completedBy: {
    [checklistItem: string]: string[];
  };
}

export type MiniGame = 
  | KeywordSpottingGame 
  | ComplexityBingoGame 
  | EstimationPredictionGame 
  | QuickPollsGame 
  | AttentionMeterGame 
  | SilentQuestionsGame 
  | StoryChecklistGame;

export interface MiniGameState {
  currentGame: MiniGame | null;
  gameHistory: MiniGame[];
}