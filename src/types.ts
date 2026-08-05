/**
 * Core data model — transcribed exactly from docs/GAME_SPEC.md §3.
 * Do not add fields or loosen these types "for convenience"; every consumer
 * (content.ts, quiz.ts, filter.ts, and later the screens) relies on this
 * shape matching the spec precisely, since visibleTo() is written against it.
 */

export type Role = 'central' | 'state' | 'intern';
export type Gender = 'woman' | 'man'; // only meaningful when role !== 'intern'

export interface UserPath {
  role: Role;
  gender: Gender | null; // null for interns, and null until Filter 2 is answered
}

export interface AppliesTo {
  roles: Role[]; // which roles see this item
  genders?: Gender[]; // omit = applies to all genders within those roles
}

// --- Story card (§3.2) ---

export type SwiftyPose = 'welcome' | 'default' | 'thinking' | 'curious';

export interface StoryCard {
  id: string; // unique, e.g. "leaves-central-1"
  module: string; // groups cards, e.g. "Leaves", "POSH"
  order: number; // display order within the full journey
  pose: SwiftyPose;
  title: string;
  body: string; // 1-3 short sentences, Swifty's narrating voice
  appliesTo: AppliesTo;
}

// --- Quiz question (§3.3) ---

export type QuestionType = 'mc' | 'tf' | 'match';

export interface McQuestion {
  id: string;
  type: 'mc';
  module: string;
  appliesTo: AppliesTo;
  question: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
}

export interface TfQuestion {
  id: string;
  type: 'tf';
  module: string;
  appliesTo: AppliesTo;
  statement: string;
  correctAnswer: boolean;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion {
  id: string;
  type: 'match';
  module: string;
  appliesTo: AppliesTo;
  prompt: string;
  pairs: MatchPair[]; // scored all-or-nothing as ONE question
}

export type QuizQuestion = McQuestion | TfQuestion | MatchQuestion;

// --- Screen state machine (§4) ---

export type Screen =
  | 'splash'
  | 'filter1'
  | 'filter2'
  | 'journey'
  | 'quiz'
  | 'results'
  | 'certificate';

// --- Quiz answers ---
// Not part of §3's spec-defined types — added here because scoring.ts (§7.4)
// and the Quiz screen (Phase 4) both need a shared shape for "what the user
// picked" per question type. Keyed by question id in App state.

export interface McAnswer {
  type: 'mc';
  selectedIndex: number;
}

export interface TfAnswer {
  type: 'tf';
  selectedAnswer: boolean;
}

export interface MatchAnswer {
  type: 'match';
  // left -> the right-hand label the user paired it with
  selected: Record<string, string>;
}

export type QuizAnswer = McAnswer | TfAnswer | MatchAnswer;

export type QuizAnswers = Record<string, QuizAnswer>; // question id -> answer
