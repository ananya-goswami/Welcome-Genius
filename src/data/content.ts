/**
 * Story card content — transcribed verbatim from docs/GAME_SPEC.md §6.
 * Every `body` string is copied exactly (wording, numbers, punctuation,
 * emoji) from the spec. Do not paraphrase, round, or "improve" any of it —
 * see CLAUDE.md rule 2. `title` fields are my own short UI labels (not a
 * spec fact) added only because StoryCard requires one.
 *
 * `order` values follow the spec's second (".../N") numbering for each
 * module — see the note below — so that filtering by visibleTo() and
 * sorting by `order` reproduces the exact per-path sequence described in
 * §6's pacing note (24 cards for FTE, 11 for Intern).
 *
 * Note on dual numbering in §6: modules from Parental onward are labeled
 * "7/9", "8/10", etc. Both numbers differ by a constant +2 for every single
 * module all the way through Wrap-up (22/24), which only happens if it's a
 * leftover artifact from an earlier draft where the FTE Leaves module had
 * one card instead of three — not a substantive branch, since Parental/
 * Finances/etc. never apply to Interns (the path the "smaller" number would
 * imply). The larger number is used here as it's the one consistent with
 * the *actual* 3-card Central/State Leaves modules in this version of the
 * spec. Flagging this rather than guessing silently — worth a confirm with
 * HR if the source deck disagrees.
 * TODO: confirm with HR that the larger (.../N) card-order numbering in §6
 * (Parental through Wrap-up) is correct, given the dual-numbering artifact.
 */
import type { StoryCard } from '../types';

export const storyCards: StoryCard[] = [
  // --- Module: Welcome (all paths — 2 cards) ---
  {
    id: 'welcome-1',
    module: 'Welcome',
    order: 1,
    pose: 'welcome',
    title: 'Welcome to ConveGenius',
    body: "Hi, I'm Swifty! 👋 Welcome to ConveGenius — the team behind SwiftChat, reaching 150M+ learners across India. Our mission: reach the unreached, and make quality learning a right, not a privilege.",
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },
  {
    id: 'welcome-2',
    module: 'Welcome',
    order: 2,
    pose: 'default',
    title: 'Your Journey Starts Here',
    body: "I'll walk you through everything that matters for your role. Tap through, then a short quiz, then your completion certificate. Ready?",
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: Attendance (all paths — 2 cards) ---
  {
    id: 'attendance-1',
    module: 'Attendance',
    order: 3,
    pose: 'default',
    title: 'Clock In With Keka',
    body: 'First things first: download the Keka app. Clock in when you start work and clock out when you\'re done — every single day.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },
  {
    id: 'attendance-2',
    module: 'Attendance',
    order: 4,
    pose: 'thinking',
    title: 'Missed a Day?',
    body: "Miss a day? You can regularize it on Keka. But heads up — if a day's left blank by month-end, it gets auto-marked as Earned Leave or Leave Without Pay.",
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: Holidays (all paths — 1 card) ---
  {
    id: 'holidays-1',
    module: 'Holidays',
    order: 5,
    pose: 'default',
    title: 'Public Holidays',
    body: 'ConveGenius follows a January–December calendar year with 10 fixed holidays. Your HR calendar on Keka has the full list.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: Leaves — Central FTE only (3 cards) ---
  {
    id: 'leaves-central-1',
    module: 'Leaves',
    order: 6,
    pose: 'default',
    title: 'Your Annual Leave',
    body: 'As a Central FTE, you get 32 leaves a year: 15 Earned, 8 Sick, 9 Casual.',
    appliesTo: { roles: ['central'] },
  },
  {
    id: 'leaves-central-2',
    module: 'Leaves',
    order: 7,
    pose: 'thinking',
    title: 'Carry Forward Rules',
    body: 'Sick and Casual leave lapse at year-end — no carry forward. But Earned Leave is different: you can carry forward up to 10 days a year, capped at 45 days (under 5 years) or 60 days (5+ years).',
    appliesTo: { roles: ['central'] },
  },
  {
    id: 'leaves-central-3',
    module: 'Leaves',
    order: 8,
    pose: 'default',
    title: 'Leave Encashment',
    body: 'One more perk: if you leave the company, you can encash your unused Earned Leave at your last drawn basic pay.',
    appliesTo: { roles: ['central'] },
  },

  // --- Module: Leaves — State FTE only (3 cards) ---
  {
    id: 'leaves-state-1',
    module: 'Leaves',
    order: 6,
    pose: 'default',
    title: 'Your Annual Leave',
    body: 'As a State FTE, you get 27 leaves a year: 15 Earned, 6 Sick, 6 Casual.',
    appliesTo: { roles: ['state'] },
  },
  {
    id: 'leaves-state-2',
    module: 'Leaves',
    order: 7,
    pose: 'thinking',
    title: 'Carry Forward Rules',
    body: 'Sick and Casual leave lapse at year-end — no carry forward. Earned Leave carries forward up to 10 days a year, capped at 45 days (under 5 years) or 60 days (5+ years).',
    appliesTo: { roles: ['state'] },
  },
  {
    id: 'leaves-state-3',
    module: 'Leaves',
    order: 8,
    pose: 'default',
    title: 'Taking Leave',
    body: 'All leave — any type — can be taken in half-day or full-day chunks, and always needs your manager\'s approval, or it counts as unauthorized absence.',
    appliesTo: { roles: ['state'] },
  },

  // --- Module: Leaves — Intern only (1 card) ---
  {
    id: 'leaves-intern-1',
    module: 'Leaves',
    order: 6,
    pose: 'default',
    title: 'Your Leave Allowance',
    body: 'As an Intern, you get 1 leave per month, pro-rata, in half-day or full-day increments. Simple as that!',
    appliesTo: { roles: ['intern'] },
  },

  // --- Module: Parental — FTE only, gender-branched (2 cards) ---
  {
    id: 'parental-maternity',
    module: 'Parental',
    order: 9,
    pose: 'default',
    title: 'Maternity Leave',
    body: "Expecting? You're entitled to 26 weeks of paid maternity leave. Just give at least 10 weeks' notice before your due date so we can plan ahead.",
    appliesTo: { roles: ['central', 'state'], genders: ['woman'] },
  },
  {
    id: 'parental-paternity',
    module: 'Parental',
    order: 9,
    pose: 'default',
    title: 'Paternity Leave',
    body: "New dad? You get 14 working days of paternity leave, to be used within 2 months of your child's birth. It can't be carried forward, so plan the timing.",
    appliesTo: { roles: ['central', 'state'], genders: ['man'] },
  },
  {
    id: 'parental-adoption',
    module: 'Parental',
    order: 10,
    pose: 'default',
    title: 'Adoption Leave',
    body: "Adopting? Either parent can take 12 working weeks to bond with their new family member.",
    appliesTo: { roles: ['central', 'state'] }, // ALL FTE regardless of gender — no genders filter
  },

  // --- Module: Finances — FTE only (2 cards) ---
  {
    id: 'finances-1',
    module: 'Finances',
    order: 11,
    pose: 'default',
    title: 'Check Your Salary',
    body: "Head to 'My Finances' on Keka to check your salary breakup matches your offer letter.",
    appliesTo: { roles: ['central', 'state'] },
  },
  {
    id: 'finances-2',
    module: 'Finances',
    order: 12,
    pose: 'thinking',
    title: 'Tax & Payroll',
    body: 'Pick your tax regime: New regime = no declarations needed. Old regime = declare your taxes and upload proofs before the deadline Keka shows you. Payroll runs monthly, salary lands on the 5th.',
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: Insurance — FTE only (1 card) ---
  {
    id: 'insurance-1',
    module: 'Insurance',
    order: 13,
    pose: 'default',
    title: 'Health Insurance',
    body: "You're covered! Health insurance includes you, your spouse, and up to 4 dependent children. Band 1–6 = ₹5 lakh cover, Band 7 and above = ₹10 lakh.",
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: Probation — FTE only (1 card) ---
  {
    id: 'probation-1',
    module: 'Probation',
    order: 14,
    pose: 'default',
    title: 'Your Probation Period',
    body: "You're on probation for a period set in your offer letter (it varies by department). Pass it, and you'll get an automatic confirmation email. If it needs extending, your manager will tell you at least a week ahead.",
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: POSH (all paths — 2 cards) ---
  {
    id: 'posh-1',
    module: 'POSH',
    order: 15,
    pose: 'default',
    title: 'A POSH-Compliant Workplace',
    body: 'ConveGenius is a POSH-compliant workplace — zero tolerance for sexual harassment, and everyone has the right to work with dignity.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },
  {
    id: 'posh-2',
    module: 'POSH',
    order: 16,
    pose: 'thinking',
    title: 'Raising a Concern',
    body: 'If you ever need to raise a concern, reach out to reachout@convegenius.ai or any Internal Committee member — Harshali Dalal (President), Tanvi Butalia, Sri Nitya A, Utsav Thapliyal, Nitin Jain, or Anadya Girotra.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: Child Protection (all paths — 1 card) ---
  {
    id: 'child-protection-1',
    module: 'Child Protection',
    order: 17,
    pose: 'default',
    title: 'Child Protection',
    body: 'Every child who comes into contact with ConveGenius deserves safety and dignity. We hold a zero-tolerance stance on abuse, exploitation, and neglect — for all our stakeholders.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: On the Move — FTE only (2 cards) ---
  {
    id: 'travel-1',
    module: 'On the Move',
    order: 18,
    pose: 'default',
    title: 'Traveling for Work',
    body: "Traveling for work? Book via the Domestic Travel Policy on Keka — accommodation priority is Guest House first, then Service Apartment, then Hotel, and food's covered too (just skip the alcohol/tobacco on the bill).",
    appliesTo: { roles: ['central', 'state'] },
  },
  {
    id: 'travel-2',
    module: 'On the Move',
    order: 19,
    pose: 'default',
    title: 'Local Conveyance',
    body: 'Local commute for official work? Claim it: ₹10/km by four-wheeler, ₹5/km by two-wheeler, or actuals for cabs/autos — all through Keka within 30 days of the expense.',
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: Referral — FTE only (2 cards) ---
  {
    id: 'referral-1',
    module: 'Referral',
    order: 20,
    pose: 'default',
    title: 'Refer & Earn',
    body: 'Know someone great? Refer them through Keka. If they join and complete 90 days, you get a referral award — and so do they get a great place to work!',
    appliesTo: { roles: ['central', 'state'] },
  },
  {
    id: 'referral-2',
    module: 'Referral',
    order: 21,
    pose: 'curious',
    title: 'CG Hire Champs',
    body: "Bonus: our 'CG Hire Champs' campaign stacks up your total referral earnings toward mega prizes — from a digital watch all the way up to a Harley Davidson!",
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: Appraisal — FTE only (1 card) ---
  {
    id: 'appraisal-1',
    module: 'Appraisal',
    order: 22,
    pose: 'default',
    title: 'Appraisal Cycle',
    body: "Appraisals run on the Financial Year cycle. To be eligible for this cycle, you'll need to have joined before 30th September.",
    appliesTo: { roles: ['central', 'state'] },
  },

  // --- Module: Helpdesk (all paths — 1 card) ---
  {
    id: 'helpdesk-1',
    module: 'Helpdesk',
    order: 23,
    pose: 'default',
    title: 'Need Help?',
    body: 'Got questions later? Raise a ticket anytime with Team HR, Team Admin, or Team Finance.',
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },

  // --- Module: Wrap-up (all paths — 1 card) ---
  {
    id: 'wrapup-1',
    module: 'Wrap-up',
    order: 24,
    pose: 'welcome',
    title: 'Ready for the Quiz?',
    body: "That's everything for your path! Time for a quick quiz to lock it in — you've got this.",
    appliesTo: { roles: ['central', 'state', 'intern'] },
  },
];
