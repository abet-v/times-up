import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types/game';
import { getTeamName } from '../../lib/utils';
import { playScoreTing, playScoreComplete } from '../../lib/sounds';

interface ScoreTransferOverlayProps {
  team: Team;
  pointsToAdd: number;
  startingScore: number;
  onComplete: () => void;
}

const teamColors = {
  A: {
    bg: 'rgba(45, 93, 161, 0.95)',
    text: '#ffffff',
    accent: '#93c5fd'
  },
  B: {
    bg: 'rgba(217, 119, 6, 0.95)',
    text: '#ffffff',
    accent: '#fcd34d'
  }
};

export function ScoreTransferOverlay({
  team,
  pointsToAdd,
  startingScore,
  onComplete
}: ScoreTransferOverlayProps) {
  const [displayedScore, setDisplayedScore] = useState(startingScore);
  const [pointsAdded, setPointsAdded] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const colors = teamColors[team];

  useEffect(() => {
    if (pointsToAdd === 0) {
      // No points to add, complete immediately after a short delay
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Increment score one by one
    if (pointsAdded < pointsToAdd) {
      const delay = Math.max(100, 300 - pointsAdded * 20); // Speed up as we go
      const timer = setTimeout(() => {
        playScoreTing(pointsAdded, pointsToAdd);
        setDisplayedScore(prev => prev + 1);
        setPointsAdded(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // All points added
      setIsComplete(true);
      playScoreComplete();
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pointsAdded, pointsToAdd, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Team name */}
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-hand text-2xl mb-4"
          style={{ color: colors.accent }}
        >
          {getTeamName(team)}
        </motion.span>

        {/* Score display */}
        <div className="relative">
          <motion.span
            className="font-sketch font-bold"
            style={{
              fontSize: '150px',
              color: colors.text,
              textShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)'
            }}
            animate={isComplete ? {
              scale: [1, 1.2, 1],
              transition: { duration: 0.3 }
            } : {}}
          >
            {displayedScore}
          </motion.span>

          {/* Flying +1 animations */}
          <AnimatePresence>
            {pointsAdded > 0 && pointsAdded <= pointsToAdd && !isComplete && (
              <motion.span
                key={pointsAdded}
                initial={{ opacity: 1, y: 0, x: 50, scale: 1 }}
                animate={{ opacity: 0, y: -80, x: 20, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-0 right-0 font-sketch font-bold text-4xl"
                style={{ color: colors.accent }}
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Points label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-hand text-xl mt-2"
          style={{ color: colors.accent }}
        >
          points
        </motion.span>

        {/* Progress indicator */}
        {pointsToAdd > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex gap-2"
          >
            {Array.from({ length: pointsToAdd }).map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: i < pointsAdded ? colors.text : 'rgba(255,255,255,0.3)'
                }}
                animate={i === pointsAdded - 1 ? {
                  scale: [1, 1.5, 1],
                  transition: { duration: 0.2 }
                } : {}}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
