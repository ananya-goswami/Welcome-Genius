/**
 * The Screen state machine (§4). This is the single source of truth for
 * `path` (role/gender) and all session state — CLAUDE.md rule: do not
 * duplicate this state anywhere else. Screens are dumb: they receive data
 * and callbacks, they never read storyCards/quizBank or call visibleTo()
 * themselves (that would be a second, parallel filtering rule — rule 1).
 */
import { useMemo, useState, type ReactNode } from 'react';
import type { Screen, UserPath, Role, Gender, QuizAnswer, QuizAnswers } from './types';
import { storyCards } from './data/content';
import { selectQuizForPath } from './data/quiz';
import { visibleTo } from './logic/filter';
import { scoreQuiz, type ScoreResult } from './logic/scoring';

import SplashScreen from './screens/SplashScreen';
import Filter1Screen from './screens/Filter1Screen';
import Filter2Screen from './screens/Filter2Screen';
import JourneyScreen from './screens/JourneyScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import CertificateScreen from './screens/CertificateScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [path, setPath] = useState<UserPath>({ role: 'central', gender: null }); // placeholder until Filter 1 answered; never rendered before then
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [certificateName, setCertificateName] = useState('');
  // Increments on every failed attempt, never resets (§5.5). Not shown to
  // the user — travels with the Phase 8 logging payload only.
  const [attemptNumber, setAttemptNumber] = useState(1);

  // The ONE place visibleTo() is applied to storyCards (rule 1).
  const journeyCards = useMemo(
    () => storyCards.filter((c) => visibleTo(c, path)).sort((a, b) => a.order - b.order),
    [path]
  );

  // Only valid once path is fully answered (Filter 1, +2 for FTE) — guarded
  // by only being read once `screen` has actually reached quiz/results, so
  // selectQuizForPath's dev-mode "gender must be set" assertion never fires
  // on the placeholder `path` above.
  const quizQuestions = useMemo(() => {
    if (screen !== 'quiz' && screen !== 'results') return [];
    return selectQuizForPath(path);
  }, [path, screen]);

  function handleStart() {
    setScreen('filter1');
  }

  function handleSelectRole(role: Role) {
    if (role === 'intern') {
      // Intern skips Filter 2 entirely; gender stays null for the session (§5.2)
      setPath({ role, gender: null });
      setJourneyIndex(0);
      setScreen('journey');
    } else {
      setPath((prev) => ({ ...prev, role, gender: null }));
      setScreen('filter2');
    }
  }

  function handleSelectGender(gender: Gender) {
    setPath((prev) => ({ ...prev, gender }));
    setJourneyIndex(0);
    setScreen('journey');
  }

  function handleJourneyNext() {
    const isLast = journeyIndex >= journeyCards.length - 1;
    if (isLast) {
      setScreen('quiz');
    } else {
      setJourneyIndex((i) => i + 1);
    }
  }

  function handleJourneyBack() {
    setJourneyIndex((i) => Math.max(0, i - 1));
  }

  function handleAnswerChange(questionId: string, answer: QuizAnswer) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  function handleQuizSubmit() {
    setResult(scoreQuiz(quizQuestions, quizAnswers));
    setScreen('results');
  }

  function handleRetry() {
    // §5.5: reset journeyIndex/answers/score ONLY — path is untouched, and
    // attemptNumber increments but is never reset.
    setAttemptNumber((n) => n + 1);
    setJourneyIndex(0);
    setQuizAnswers({});
    setResult(null);
    setScreen('journey');
  }

  function handleContinueToCertificate() {
    setScreen('certificate');
  }

  function handleCertificateNameSubmit(name: string) {
    setCertificateName(name);
  }

  let activeScreen: ReactNode;
  switch (screen) {
    case 'splash':
      activeScreen = <SplashScreen onStart={handleStart} />;
      break;

    case 'filter1':
      activeScreen = <Filter1Screen onSelect={handleSelectRole} />;
      break;

    case 'filter2':
      activeScreen = <Filter2Screen onSelect={handleSelectGender} />;
      break;

    case 'journey':
      activeScreen = (
        <JourneyScreen
          cards={journeyCards}
          index={journeyIndex}
          onNext={handleJourneyNext}
          onBack={handleJourneyBack}
        />
      );
      break;

    case 'quiz':
      activeScreen = (
        <QuizScreen
          questions={quizQuestions}
          answers={quizAnswers}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleQuizSubmit}
        />
      );
      break;

    case 'results':
      // result is always set by the time screen === 'results' (only reachable via handleQuizSubmit)
      activeScreen = <ResultsScreen result={result!} onContinue={handleContinueToCertificate} onRetry={handleRetry} />;
      break;

    case 'certificate':
      activeScreen = (
        <CertificateScreen
          path={path}
          result={result!}
          name={certificateName}
          onNameSubmit={handleCertificateNameSubmit}
        />
      );
      break;
  }

  return (
    <>
      {activeScreen}
      {/* Not user-visible. A hook for automated (Playwright) verification of
          §5.5's restart contract: attemptNumber increments on every fail and
          never resets, independent of anything rendered on screen. Also the
          eventual source for the Phase 8 logging payload's attemptNumber. */}
      <span hidden data-testid="attempt-number">
        {attemptNumber}
      </span>
    </>
  );
}
