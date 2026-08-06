/**
 * Quiz bank, every fact verified against docs/GAME_SPEC.md §7.2/§6 and the
 * source policy PDFs. Do not paraphrase, round, or "improve" any
 * figure/date/email/name here, see CLAUDE.md rule 2.
 *
 * selectQuizForPath() below draws a randomized 12/8 question set per call
 * (see the note above that function) rather than a fixed §7.3 list, so
 * repeat attempts don't show the identical quiz every time.
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
// MC, FTE only, additional pool (widens randomized selection beyond mc6/mc7,
// each mined from a fact already taught on an existing FTE-only journey card)
// ---------------------------------------------------------------------------

const mc10: McQuestion = {
  id: 'mc-10',
  type: 'mc',
  module: 'Finances',
  appliesTo: { roles: ['central', 'state'] },
  question: 'What happens if you pick the New Tax Regime on Keka?',
  options: ['No declarations needed', 'You must still declare by Jan 31', 'You lose EPF benefits', 'A higher tax rate always applies'],
  correctIndex: 0,
};

const mc11: McQuestion = {
  id: 'mc-11',
  type: 'mc',
  module: 'Insurance',
  appliesTo: { roles: ['central', 'state'] },
  question: "What's the insured amount for employees in Band 1 to 6?",
  options: ['₹2 lakh', '₹5 lakh', '₹10 lakh', '₹15 lakh'],
  correctIndex: 1,
};

const mc12: McQuestion = {
  id: 'mc-12',
  type: 'mc',
  module: 'On the Move',
  appliesTo: { roles: ['central', 'state'] },
  question: "What's the accommodation priority order for company travel?",
  options: ['Hotel, then Service Apartment, then Guest House', 'Guest House, then Service Apartment, then Hotel', 'Service Apartment only', "Employee's choice, any option"],
  correctIndex: 1,
};

const mc13: McQuestion = {
  id: 'mc-13',
  type: 'mc',
  module: 'On the Move',
  appliesTo: { roles: ['central', 'state'] },
  question: 'How much can you claim per km for local travel by two-wheeler?',
  options: ['₹3', '₹5', '₹8', '₹10'],
  correctIndex: 1,
};

const mc14: McQuestion = {
  id: 'mc-14',
  type: 'mc',
  module: 'Referral',
  appliesTo: { roles: ['central', 'state'] },
  question: "What's the top mega prize in the 'CG Hire Champs' referral campaign?",
  options: ['Digital Watch', 'iPhone', 'Harley Davidson Bike', 'Gift Voucher'],
  correctIndex: 2,
};

// Central-only: the encashment fact is taught only on the Central Leaves
// card (leaves-central-3); the State Leaves module's third card covers a
// different fact (manager approval), so this is not eligible for State per
// §7.1's "answerable from what they saw" rule.
const mc15: McQuestion = {
  id: 'mc-15',
  type: 'mc',
  module: 'Leaves',
  appliesTo: { roles: ['central'] },
  question: 'If you leave the company, how can you encash unused Earned Leave?',
  options: ['At your last drawn basic pay', 'At double your basic pay', "You can't encash it", 'Only after 5 years of service'],
  correctIndex: 0,
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

const tf8: TfQuestion = {
  id: 'tf-8',
  type: 'tf',
  module: 'Holidays',
  appliesTo: { roles: ['central', 'state', 'intern'] },
  statement: 'Your HR calendar on Keka has the full list of fixed holidays.',
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

const tf9: TfQuestion = {
  id: 'tf-9',
  type: 'tf',
  module: 'Probation',
  appliesTo: { roles: ['central', 'state'] },
  statement: 'If your probation needs extending, your manager will tell you on the same day it ends.',
  correctAnswer: false, // at least a week ahead
};

const tf10: TfQuestion = {
  id: 'tf-10',
  type: 'tf',
  module: 'On the Move',
  appliesTo: { roles: ['central', 'state'] },
  statement: "ConveGenius's travel food allowance covers alcohol and tobacco.",
  correctAnswer: false, // explicitly excluded
};

const tf11: TfQuestion = {
  id: 'tf-11',
  type: 'tf',
  module: 'Referral',
  appliesTo: { roles: ['central', 'state'] },
  statement: 'You can earn a referral award once your referred candidate completes 90 days at ConveGenius.',
  correctAnswer: true,
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

// Widened from roles:['intern'] to all roles: the Helpdesk journey card
// (§6, "all paths, 1 card") teaches this to every path, not just Interns,
// so it belongs in the general TF pool for FTE paths too.
const tf6: TfQuestion = {
  id: 'tf-6',
  type: 'tf',
  module: 'Helpdesk',
  appliesTo: { roles: ['central', 'state', 'intern'] },
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

/** Full bank, every question that exists, tagged with appliesTo. */
export const quizBank: QuizQuestion[] = [
  mc1, mc2, mc3, mc4, mc5, mc6, mc7, mc8a, mc8b, mc9, mc10, mc11, mc12, mc13, mc14, mc15,
  tf1, tf2, tf3, tf4, tf5a, tf5b, tf6, tf7, tf8, tf9, tf10, tf11,
  matchCentral, matchState, matchIntern,
];

// ---------------------------------------------------------------------------
// §7.3, selectQuizForPath(), randomized draw
//
// Product decision (superseding the original fixed-list §7.3 table, per
// explicit user request): repeat playthroughs were showing the exact same
// 12/8 questions every time. Counts, category composition, and every gating
// guarantee stay exactly as specced (12 for FTE / 8 for Intern, at most one
// wrong to pass per §5.5); only WHICH eligible questions fill each category
// is now randomized per call, so each quiz attempt draws a fresh combination.
//
// Two slots are still a mandatory, deterministic single pick per path (there
// is exactly one valid question, not a pool to choose from):
//   - the role-specific leave-total MC (mc8a/mc8b/mc9)
//   - the gender-specific parental TF (tf5a/tf5b), FTE only
//   - the role-specific Match question (always exactly one per role)
// Every other MC/TF slot is filled by sampling without replacement from all
// quizBank questions that pass visibleTo() for this path, excluding whatever
// is already mandatory. This still relies on explicit per-role selection for
// the mandatory slots, not generic appliesTo filtering alone, for the same
// reason as before: filtering alone can't know which of two
// mutually-applicable-by-role variants (8a vs 8b, central vs state match) to
// prefer.
// ---------------------------------------------------------------------------

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Random sample of `count` distinct items from `pool`, order randomized. */
function sample<T>(pool: readonly T[], count: number): T[] {
  return shuffle(pool).slice(0, count);
}

const MANDATORY_TOTAL_MC: Record<Role, McQuestion> = {
  central: mc8a,
  state: mc8b,
  intern: mc9,
};

const MANDATORY_MATCH: Record<Role, MatchQuestion> = {
  central: matchCentral,
  state: matchState,
  intern: matchIntern,
};

const MANDATORY_GENDER_TF: Record<Gender, TfQuestion> = {
  woman: tf5a,
  man: tf5b,
};

// Every MC/TF question is eligible for the random pool; visibleTo() below is
// what actually restricts each path's draw, this is just "everything that
// exists" so a newly-added question needs no separate pool wiring.
const ALL_MC = quizBank.filter((q): q is McQuestion => q.type === 'mc');
const ALL_TF = quizBank.filter((q): q is TfQuestion => q.type === 'tf');

const FTE_MC_TOTAL = 7; // 1 mandatory (8a/8b) + 6 sampled
const FTE_TF_TOTAL = 4; // 1 mandatory (5a/5b) + 3 sampled
const INTERN_MC_TOTAL = 5; // 1 mandatory (mc9) + 4 sampled
const INTERN_TF_TOTAL = 2; // 0 mandatory + 2 sampled

/**
 * Assembles a randomized 12-question (FTE) or 8-question (Intern) quiz for a
 * path, drawing from the full quizBank each call (see the note above).
 * Question order is randomized once per call and then fixed for that quiz
 * instance (§5.5, a re-render must not reshuffle mid-attempt); MC option
 * order is shuffled separately, at render time, in McQuestionView.
 */
export function selectQuizForPath(path: { role: Role; gender: Gender | null }): QuizQuestion[] {
  if (import.meta.env.DEV && path.role !== 'intern' && path.gender === null) {
    throw new Error(
      `selectQuizForPath: role '${path.role}' reached quiz assembly with gender still null, Filter 2 must never be skipped for FTE paths (§5.3).`
    );
  }

  const isIntern = path.role === 'intern';
  const mandatoryMc = MANDATORY_TOTAL_MC[path.role];
  const mandatoryMatch = MANDATORY_MATCH[path.role];
  const mandatoryTf = path.gender ? MANDATORY_GENDER_TF[path.gender] : null;

  const mcCount = isIntern ? INTERN_MC_TOTAL : FTE_MC_TOTAL;
  const tfCount = isIntern ? INTERN_TF_TOTAL : FTE_TF_TOTAL;

  const eligibleMc = ALL_MC.filter((q) => q.id !== mandatoryMc.id && visibleTo(q, path));
  const eligibleTf = ALL_TF.filter((q) => q.id !== mandatoryTf?.id && visibleTo(q, path));

  if (import.meta.env.DEV) {
    if (eligibleMc.length < mcCount - 1) {
      throw new Error(
        `selectQuizForPath: MC pool for ${path.role}-${path.gender ?? 'none'} has only ${eligibleMc.length} eligible question(s), need ${mcCount - 1} beyond the mandatory pick.`
      );
    }
    if (eligibleTf.length < tfCount - (mandatoryTf ? 1 : 0)) {
      throw new Error(
        `selectQuizForPath: TF pool for ${path.role}-${path.gender ?? 'none'} has only ${eligibleTf.length} eligible question(s), need ${tfCount - (mandatoryTf ? 1 : 0)} beyond the mandatory pick.`
      );
    }
  }

  const mcQuestions = shuffle([mandatoryMc, ...sample(eligibleMc, mcCount - 1)]);
  const tfQuestions = mandatoryTf
    ? shuffle([mandatoryTf, ...sample(eligibleTf, tfCount - 1)])
    : sample(eligibleTf, tfCount);

  const questions = [...mcQuestions, ...tfQuestions, mandatoryMatch];

  if (import.meta.env.DEV) {
    const bad = questions.filter((q) => !visibleTo(q, { role: path.role, gender: path.gender }));
    if (bad.length > 0) {
      throw new Error(
        `selectQuizForPath: question(s) ${bad.map((q) => q.id).join(', ')} do not pass visibleTo() for path ${path.role}-${path.gender ?? 'none'}, a wrong-path question slipped into the draw.`
      );
    }
    const expectedTotal = isIntern ? 8 : 12;
    if (questions.length !== expectedTotal) {
      throw new Error(
        `selectQuizForPath: path ${path.role}-${path.gender ?? 'none'} produced ${questions.length} questions, expected exactly ${expectedTotal} (§7.3/§11).`
      );
    }
    const uniqueIds = new Set(questions.map((q) => q.id));
    if (uniqueIds.size !== questions.length) {
      throw new Error(
        `selectQuizForPath: duplicate question id drawn for path ${path.role}-${path.gender ?? 'none'} (${questions.map((q) => q.id).join(', ')}).`
      );
    }
  }

  return questions;
}
