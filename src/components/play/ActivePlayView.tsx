import { motion, AnimatePresence } from 'framer-motion';
import { Check, SkipForward } from 'lucide-react';
import { Button, Card, Timer } from '../ui';
import type { GameSession } from '../../types/game';
import { getTeamName } from '../../lib/utils';

interface ActivePlayViewProps {
  session: GameSession;
  currentWord: string | null;
  onCorrect: () => void;
  onSkip: () => void;
  timerRunning: boolean;
  onTimerComplete: () => void;
  canSkip: boolean;
  skipPenalty: number;
}

export function ActivePlayView({
  session,
  currentWord,
  onCorrect,
  onSkip,
  timerRunning,
  onTimerComplete,
  canSkip,
  skipPenalty
}: ActivePlayViewProps) {
  const isTeamA = session.currentTeam === 'A';
  const remainingCount = session.remainingWords.length;
  const currentScore = isTeamA ? session.teamAScore : session.teamBScore;

  return (
    <div className="h-[100dvh] p-4 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col pt-10 min-h-0">
        {/* Timer - Centered at top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-4 flex-shrink-0"
        >
          <Timer
            duration={session.settings.roundDuration}
            penalty={session.currentTurn?.accumulatedPenalty ?? 0}
            isRunning={timerRunning}
            onComplete={onTimerComplete}
            size="lg"
          />
        </motion.div>

        {/* Word Display */}
        <div className="flex-1 flex flex-col justify-center min-h-0 mb-4">
          <AnimatePresence mode="wait">
            {currentWord && (
              <motion.div
                key={currentWord}
                initial={{ opacity: 0, scale: 0.9, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateX: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="highlighted" className="text-center py-8">
                  <p className="text-3xl font-bold font-sketch text-gray-800 px-4">
                    {currentWord}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remaining words indicator */}
          <p className="text-center text-gray-400 text-xs font-hand mt-3">
            {remainingCount} mot{remainingCount > 1 ? 's' : ''} restant{remainingCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`grid gap-3 mb-3 flex-shrink-0 ${canSkip ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {canSkip && (
            <Button
              size="lg"
              variant="secondary"
              onClick={onSkip}
              icon={<SkipForward className="w-5 h-5" />}
            >
              Passer {skipPenalty > 0 && <span className="text-sm opacity-70 ml-1">(-{skipPenalty}s)</span>}
            </Button>
          )}
          <Button
            size="lg"
            variant="success"
            onClick={onCorrect}
            icon={<Check className="w-5 h-5" />}
          >
            Trouvé !
          </Button>
        </div>

        {/* Current Team Score - Minimal footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            text-center py-2 rounded-xl border-2 border-dashed flex-shrink-0
            ${isTeamA
              ? 'bg-blue-50/50 border-blue-300'
              : 'bg-amber-50/50 border-amber-300'
            }
          `}
        >
          <p className={`text-sm font-hand ${isTeamA ? 'text-blue-600' : 'text-amber-600'}`}>
            {getTeamName(session.currentTeam)} : <span className="font-bold text-lg">{currentScore}</span> point{currentScore !== 1 ? 's' : ''}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
