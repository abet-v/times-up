import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BackButton } from '../components/ui';
import {
  CountdownOverlay,
  TurnEndOverlay,
  PreTurnView,
  ActivePlayView
} from '../components/play';
import { useGameStore } from '../store/gameStore';

type PlaySubPhase = 'pre-turn' | 'countdown' | 'playing' | 'turn-end';

export function PlayPage() {
  const navigate = useNavigate();
  const [subPhase, setSubPhase] = useState<PlaySubPhase>('pre-turn');
  const [turnPointsScored, setTurnPointsScored] = useState(0);
  const pointsRef = useRef(0);

  const {
    session,
    getCurrentWord,
    getActivePlayer,
    getNextPlayer,
    markCorrect,
    skipWord,
    endTurn,
    startTurn,
    nextPhase
  } = useGameStore();

  const handleCountdownComplete = useCallback(() => {
    startTurn();
    pointsRef.current = 0;
    setTurnPointsScored(0);
    setSubPhase('playing');
  }, [startTurn]);

  const handleCorrect = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 }
    });

    pointsRef.current += 1;
    markCorrect();
  }, [markCorrect]);

  const handleSkip = useCallback(() => {
    skipWord();
  }, [skipWord]);

  const handleTimerComplete = useCallback(() => {
    setTurnPointsScored(pointsRef.current);
    setSubPhase('turn-end');
  }, []);

  const handleTurnEndComplete = useCallback(() => {
    endTurn();
    setSubPhase('pre-turn');
  }, [endTurn]);

  useEffect(() => {
    // Only redirect to home if there's no session at all
    // Don't redirect during normal game flow transitions (phase-summary, game-over)
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Check if all words are guessed after each render
  useEffect(() => {
    if (session && session.status === 'playing' && session.remainingWords.length === 0 && subPhase === 'playing') {
      setTurnPointsScored(pointsRef.current);
      nextPhase();
      navigate('/phase-summary');
    }
  }, [session, subPhase, nextPhase, navigate]);

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
        />
      )}

      <AnimatePresence>
        {subPhase === 'turn-end' && (
          <TurnEndOverlay
            key="turn-end"
            pointsScored={turnPointsScored}
            team={session.currentTeam}
            nextPlayerName={nextPlayer?.name}
            onComplete={handleTurnEndComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
