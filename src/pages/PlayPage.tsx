import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Users } from 'lucide-react';
import { BackButton } from '../components/ui';
import {
  CountdownOverlay,
  TurnEndOverlay,
  PreTurnView,
  ActivePlayView,
  TurnReviewModal,
  ScoreTransferOverlay,
  TeamCompositionModal
} from '../components/play';
import { useGameStore } from '../store/gameStore';

type PlaySubPhase = 'pre-turn' | 'countdown' | 'playing' | 'turn-end' | 'score-transfer';

export function PlayPage() {
  const navigate = useNavigate();
  const [subPhase, setSubPhase] = useState<PlaySubPhase>('pre-turn');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const {
    session,
    getCurrentWord,
    getActivePlayer,
    getNextPlayer,
    markCorrect,
    skipWord,
    endTurn,
    startTurn,
    nextPhase,
    canSkipCurrentPhase,
    getCurrentPhasePenalty,
    reviewUncorrectWord,
    reviewCorrectWord
  } = useGameStore();

  const handleCountdownComplete = useCallback(() => {
    startTurn();
    setSubPhase('playing');
  }, [startTurn]);

  const handleCorrect = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 }
    });
    markCorrect();
  }, [markCorrect]);

  const handleSkip = useCallback(() => {
    skipWord();
  }, [skipWord]);

  const handleTimerComplete = useCallback(() => {
    endTurn(); // Save currentTurn to lastTurn for review
    setSubPhase('turn-end');
  }, [endTurn]);

  const handleTurnEndComplete = useCallback(() => {
    setSubPhase('score-transfer');
  }, []);

  const handleScoreTransferComplete = useCallback(() => {
    // Check if phase is complete (all words guessed)
    const currentSession = useGameStore.getState().session;
    if (currentSession && currentSession.remainingWords.length === 0) {
      nextPhase();
      navigate('/phase-summary');
    } else {
      setSubPhase('pre-turn');
    }
  }, [nextPhase, navigate]);

  const handleCloseReview = useCallback(() => {
    setShowReviewModal(false);
    // Check if all words have been found after review corrections
    const currentSession = useGameStore.getState().session;
    if (currentSession && currentSession.remainingWords.length === 0) {
      nextPhase();
      navigate('/phase-summary');
    }
  }, [nextPhase, navigate]);

  useEffect(() => {
    // Only redirect to home if there's no session at all
    // Don't redirect during normal game flow transitions (phase-summary, game-over)
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Check if all words are guessed - go to turn-end for review opportunity
  useEffect(() => {
    if (session && session.status === 'playing' && session.remainingWords.length === 0 && subPhase === 'playing') {
      endTurn(); // Save currentTurn to lastTurn for review
      setSubPhase('turn-end');
    }
  }, [session, subPhase, endTurn]);

  if (!session || session.status !== 'playing') {
    return null;
  }

  const currentWord = getCurrentWord();
  const activePlayer = getActivePlayer();
  const nextPlayer = getNextPlayer();
  const playerIndex = activePlayer
    ? session.players.findIndex(p => p.id === activePlayer.id)
    : 0;

  return (
    <div className="min-h-screen relative">
      <BackButton className="absolute top-4 left-4 z-10" />

      <button
        onClick={() => setShowTeamModal(true)}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-700 text-gray-700 hover:bg-[#ff4d4d] hover:text-white active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
        style={{
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          boxShadow: '4px 4px 0 #374151',
        }}
        aria-label="Voir les équipes"
      >
        <Users className="w-5 h-5" strokeWidth={2.5} />
      </button>

      <TeamCompositionModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
      />

      <AnimatePresence mode="wait">
        {subPhase === 'pre-turn' && (
          <PreTurnView
            key="pre-turn"
            session={session}
            activePlayer={activePlayer}
            playerIndex={playerIndex}
            onStart={() => setSubPhase('countdown')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subPhase === 'countdown' && (
          <CountdownOverlay
            key="countdown"
            onComplete={handleCountdownComplete}
          />
        )}
      </AnimatePresence>

      {subPhase === 'playing' && (
        <ActivePlayView
          session={session}
          currentWord={currentWord}
          onCorrect={handleCorrect}
          onSkip={handleSkip}
          timerRunning={true}
          onTimerComplete={handleTimerComplete}
          canSkip={canSkipCurrentPhase()}
          skipPenalty={getCurrentPhasePenalty()}
        />
      )}

      <AnimatePresence>
        {subPhase === 'turn-end' && session.lastTurn && (
          <>
            <TurnEndOverlay
              key="turn-end"
              lastTurn={session.lastTurn}
              nextPlayerName={nextPlayer?.name}
              onComplete={handleTurnEndComplete}
              canReview={session.lastTurn.foundWords.length > 0 || session.lastTurn.skippedWords.length > 0}
              onOpenReview={() => setShowReviewModal(true)}
            />
            <TurnReviewModal
              isOpen={showReviewModal}
              lastTurn={session.lastTurn}
              onUncorrect={reviewUncorrectWord}
              onCorrect={reviewCorrectWord}
              onClose={handleCloseReview}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {subPhase === 'score-transfer' && session.lastTurn && (
          <ScoreTransferOverlay
            key="score-transfer"
            team={session.lastTurn.teamId}
            pointsToAdd={session.lastTurn.correctCount}
            startingScore={
              session.lastTurn.teamId === 'A'
                ? session.teamAScore - session.lastTurn.correctCount
                : session.teamBScore - session.lastTurn.correctCount
            }
            onComplete={handleScoreTransferComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
