/**
 * Quiz bank, transcribed verbatim from docs/GAME_SPEC.md §7.2, plus the
 * fixed assembly table from §7.3. Do not paraphrase, round, or "improve" any
 * figure/date/email/name here, see CLAUDE.md rule 2.
 *
 * MC option order is listed in the same fixed reference order as the spec
 * (correct answer marked via `correctIndex`); shuffle a COPY at render time
 * if desired (§7.1), never mutate this source order.
 */
import type { McQuestion, TfQuestion, MatchQuestion, QuizQuestion, Role, Gender } from '../types';
import { visibleTo } from '../logic/filter';

// ---------------------------------------------------------------------------
// MC, generic (all FTE, both roles, and Intern)
// ---------------------------------------------------------------------------

const mc1: McQuestion = {
  id: 'mc-1',
  type: 'mc',
  module: 'Attendance',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  question: 'What app do you use to clock in and out every day?',
  options: ['Slack', 'Keka', 'Zoom', 'Notion'],
  correctIndex: 1,
};

const mc2: McQuestion = {
  id: 'mc-2',
  type: 'mc',
  module: 'Attendance',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  question: "If you forget to mark attendance and don't regularize it by month-end, what happens?",
  options: [
    'Nothing',
    "It's auto-marked as Earned Leave or Leave Without Pay",
    'You get a bonus day',
    'HR calls your manager',
  ],
  correctIndex: 1,
};

const mc3: McQuestion = {
  id: 'mc-3',
  type: 'mc',
  module: 'Holidays',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  question: 'How many fixed holidays does ConveGenius observe each calendar year?',
  options: ['8', '10', '12', '15'],
  correctIndex: 1,
};

const mc4: McQuestion = {
  id: 'mc-4',
  type: 'mc',
  module: 'POSH',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  question: 'Which email should you write to for a POSH concern?',
  options: [
    'hrconnect@convegenius.ai',
    'reachout@convegenius.ai',
    'posh@convegenius.ai',
    'admin@convegenius.ai',
  ],
  correctIndex: 1,
};

const mc5: McQuestion = {
  id: 'mc-5',
  type: 'mc',
  module: 'Helpdesk',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  question: 'Which teams can you raise a query ticket with?',
  options: ['HR, Admin, and Finance', 'Only HR', 'Only IT', 'Only your manager'],
  correctIndex: 0,
};

// ---------------------------------------------------------------------------
// MC, FTE only
// ---------------------------------------------------------------------------

const mc6: McQuestion = {
  id: 'mc-6',
  type: 'mc',
  module: 'Insurance',
  appliesTo: { roles: ['central', 'state'] },
  question: "What's the insured amount for employees in Band 7 and above?",
  options: ['₹2 lakh', '₹5 lakh', '₹10 lakh', '₹15 lakh'],
  correctIndex: 2,
};

const mc7: McQuestion = {
  id: 'mc-7',
  type: 'mc',
  module: 'Appraisal',
  appliesTo: { roles: ['central', 'state'] },
  question: 'You must have joined before which date to be eligible for the current Financial Year appraisal cycle?',
  options: ['31st March', '30th June', '30th September', '31st December'],
  correctIndex: 2,
};

// ---------------------------------------------------------------------------
// MC, role-specific leave totals (ONE of these two is used, per role)
// ---------------------------------------------------------------------------

const mc8a: McQuestion = {
  id: 'mc-8a',
  type: 'mc',
  module: 'Leaves',
  appliesTo: { roles: ['central'] },
  question: 'How many total annual leaves does a Central FTE get?',
  options: ['27', '30', '32', '35'],
  correctIndex: 2,
};

const mc8b: McQuestion = {
  id: 'mc-8b',
  type: 'mc',
  module: 'Leaves',
  appliesTo: { roles: ['state'] },
  question: 'How many total annual leaves does a State FTE get?',
  options: ['24', '27', '30', '32'],
  correctIndex: 1,
};

// ---------------------------------------------------------------------------
// MC, Intern only
// ---------------------------------------------------------------------------

const mc9: McQuestion = {
  id: 'mc-9',
  type: 'mc',
  module: 'Leaves',
  appliesTo: { roles: ['intern'] },
  question: 'How many leaves does an Intern get per month?',
  options: ['0.5', '1', '2', '3'],
  correctIndex: 1,
};

// ---------------------------------------------------------------------------
// TF, generic
// ---------------------------------------------------------------------------

const tf1: TfQuestion = {
  id: 'tf-1',
  type: 'tf',
  module: 'Child Protection',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  statement: 'ConveGenius has a zero-tolerance approach to child abuse and exploitation.',
  correctAnswer: true,
};

const tf2: TfQuestion = {
  id: 'tf-2',
  type: 'tf',
  module: 'Holidays',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  statement: 'ConveGenius follows a January–December calendar year.',
  correctAnswer: true,
};

// ---------------------------------------------------------------------------
// TF, FTE only
// ---------------------------------------------------------------------------

const tf3: TfQuestion = {
  id: 'tf-3',
  type: 'tf',
  module: 'Leaves',
  appliesTo: { roles: ['central', 'state'] },
  statement: 'Casual Leave and Sick Leave can be carried forward to the next year.',
  correctAnswer: false, // they lapse
};

const tf4: TfQuestion = {
  id: 'tf-4',
  type: 'tf',
  module: 'Adoption',
  appliesTo: { roles: ['central', 'state'] },
  statement: 'Adoption leave (12 weeks) is available only to women employees.',
  correctAnswer: false, // either parent
};

// ---------------------------------------------------------------------------
// TF, gender-specific (ONE of these two is used, per gender)
// ---------------------------------------------------------------------------

const tf5a: TfQuestion = {
  id: 'tf-5a',
  type: 'tf',
  module: 'Parental',
  appliesTo: { roles: ['central', 'state'], genders: ['woman'] },
  statement: "Female employees should give at least 10 weeks' notice before their expected delivery date.",
  correctAnswer: true,
};

const tf5b: TfQuestion = {
  id: 'tf-5b',
  type: 'tf',
  module: 'Parental',
  appliesTo: { roles: ['central', 'state'], genders: ['man'] },
  statement: 'Paternity leave can be carried forward to the next year if unused.',
  correctAnswer: false, // must be used within 2 months, no carry forward
};

// ---------------------------------------------------------------------------
// TF, Intern only
// ---------------------------------------------------------------------------

const tf6: TfQuestion = {
  id: 'tf-6',
  type: 'tf',
  module: 'Helpdesk',
  appliesTo: { roles: ['intern'] },
  statement: 'You can raise queries with HR, Admin, or Finance teams via a ticket.',
  correctAnswer: true,
};

const tf7: TfQuestion = {
  id: 'tf-7',
  type: 'tf',
  module: 'Attendance',
  appliesTo: { roles: ['intern'] },
  statement: 'Interns also need to mark attendance on Keka.',
  correctAnswer: true,
};

// ---------------------------------------------------------------------------
// Match, role-specific (ONE of these three is used, per role)
// ---------------------------------------------------------------------------

const matchCentral: MatchQuestion = {
  id: 'match-central',
  type: 'match',
  module: 'Leaves',
  appliesTo: { roles: ['central'] },
  prompt: 'Match each leave type to its annual count (Central FTE).',
  pairs: [
    { left: 'Earned Leave', right: '15 days' },
    { left: 'Sick Leave', right: '8 days' },
    { left: 'Casual Leave', right: '9 days' },
  ],
};

const matchState: MatchQuestion = {
  id: 'match-state',
  type: 'match',
  module: 'Leaves',
  appliesTo: { roles: ['state'] },
  prompt: 'Match each leave type to its annual count (State FTE).',
  pairs: [
    { left: 'Earned Leave', right: '15 days' },
    { left: 'Sick Leave', right: '6 days' },
    { left: 'Casual Leave', right: '6 days' },
  ],
};

const matchIntern: MatchQuestion = {
  id: 'match-intern',
  type: 'match',
  module: 'Overview',
  appliesTo: { roles: ['intern'] },
  prompt: 'Match each topic to what it covers.',
  pairs: [
    { left: 'Keka', right: 'Marking your daily attendance' },
    { left: 'POSH', right: 'Protection from workplace harassment' },
    { left: 'Child Protection', right: 'Zero-tolerance for child abuse' },
  ],
};

/** Full bank, every question that exists, tagged with appliesTo. Not all of
 * these are used by selectQuizForPath (see §7.3's note on TF-4/TF-7). */
export const quizBank: QuizQuestion[] = [
  mc1, mc2, mc3, mc4, mc5, mc6, mc7, mc8a, mc8b, mc9,
  tf1, tf2, tf3, tf4, tf5a, tf5b, tf6, tf7,
  matchCentral, matchState, matchIntern,
];

// ---------------------------------------------------------------------------
// §7.3, selectQuizForPath()
//
// Implemented as an explicit lookup per the spec's implementation note: the
// role-specific MC/Match substitution (8a vs 8b, central vs state match)
// needs explicit selection, not generic appliesTo inclusion filtering, since
// filtering alone can't know which of two mutually-applicable-by-role
// variants to prefer when both could otherwise pass a looser check.
// ---------------------------------------------------------------------------

type PathKey = `${Role}-${Gender | 'none'}`;

const FTE_LEADING = [mc1, mc2, mc3, mc4, mc6, mc7] as const; // shared by all 4 FTE paths, before the role-specific 8a/8b

const INTERN_QUIZ = [mc1, mc2, mc3, mc4, mc9, tf1, tf6, matchIntern];

const QUIZ_TABLE: Record<PathKey, QuizQuestion[]> = {
  'central-woman': [...FTE_LEADING, mc8a, tf1, tf2, tf3, tf5a, matchCentral],
  'central-man': [...FTE_LEADING, mc8a, tf1, tf2, tf3, tf5b, matchCentral],
  'state-woman': [...FTE_LEADING, mc8b, tf1, tf2, tf3, tf5a, matchState],
  'state-man': [...FTE_LEADING, mc8b, tf1, tf2, tf3, tf5b, matchState],
  // Every PathKey combination must be present for Record<PathKey, ...> to
  // type-check, but role !== 'intern' with gender === null is unreachable in
  // practice: Filter 2 is mandatory (never skippable) for Central/State FTE
  // (§5.2-5.3), so path.gender is always set by the time a quiz is selected.
  // selectQuizForPath() asserts this in dev mode below rather than silently
  // falling back to one of these.
  'central-none': [...FTE_LEADING, mc8a, tf1, tf2, tf3, tf5a, matchCentral],
  'state-none': [...FTE_LEADING, mc8b, tf1, tf2, tf3, tf5a, matchState],
  // Interns never have a gender (path.gender is always null, Filter 2 is
  // skipped entirely per §5.2), 'intern-none' is the only reachable Intern
  // key. The woman/man entries mirror it for the same Record-completeness
  // reason as above.
  'intern-woman': INTERN_QUIZ,
  'intern-man': INTERN_QUIZ,
  'intern-none': INTERN_QUIZ,
};

/**
 * Assembles the fixed 12-question (FTE) or 8-question (Intern) quiz for a
 * path, per the §7.3 table. Question ORDER is fixed and must not be
 * shuffled (§5.5), only MC option order may be shuffled, at render time, on
 * a copy.
 */
export function selectQuizForPath(path: { role: Role; gender: Gender | null }): QuizQuestion[] {
  const key: PathKey = `${path.role}-${path.gender ?? 'none'}`;
  const questions = QUIZ_TABLE[key];

  if (import.meta.env.DEV) {
    if (path.role !== 'intern' && path.gender === null) {
      throw new Error(
        `selectQuizForPath: role '${path.role}' reached quiz assembly with gender still null, Filter 2 must never be skipped for FTE paths (§5.3).`
      );
    }
    const bad = questions.filter((q) => !visibleTo(q, { role: path.role, gender: path.gender }));
    if (bad.length > 0) {
      throw new Error(
        `selectQuizForPath: question(s) ${bad.map((q) => q.id).join(', ')} do not pass visibleTo() for path ${key}, a wrong-path question slipped into the fixed table.`
      );
    }
    const expectedTotal = path.role === 'intern' ? 8 : 12;
    if (questions.length !== expectedTotal) {
      throw new Error(
        `selectQuizForPath: path ${key} produced ${questions.length} questions, expected exactly ${expectedTotal} (§7.3/§11).`
      );
    }
  }

  return questions;
}
