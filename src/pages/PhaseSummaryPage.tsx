import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { Button, Card, BackButton } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { getPhaseTitle, getTeamName } from '../lib/utils';
import { playScoreTing, playScoreComplete } from '../lib/sounds';

export function PhaseSummaryPage() {
  const navigate = useNavigate();
  const { session, setStatus } = useGameStore();
  const [phase, setPhase] = useState<'suspense' | 'reveal'>('suspense');
  const [displayedScoreA, setDisplayedScoreA] = useState(0);
  const [displayedScoreB, setDisplayedScoreB] = useState(0);

  const targetScoreA = session?.scores[session.scores.length - 1]?.teamA ?? 0;
  const targetScoreB = session?.scores[session.scores.length - 1]?.teamB ?? 0;
  const maxScore = Math.max(targetScoreA, targetScoreB, 1);

  // Suspense - increment both scores simultaneously
  useEffect(() => {
    if (phase !== 'suspense') return;

    const doneA = displayedScoreA >= targetScoreA;
    const doneB = displayedScoreB >= targetScoreB;

    if (doneA && doneB) {
      // Both done, reveal after short delay
      const timer = setTimeout(() => {
        playScoreComplete();
        setPhase('reveal');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 600);
      return () => clearTimeout(timer);
    }

    // Increment both teams at the same time
    const timer = setTimeout(() => {
      const currentStep = Math.max(displayedScoreA, displayedScoreB);
      playScoreTing(currentStep, maxScore);

      if (!doneA) {
        setDisplayedScoreA(prev => prev + 1);
      }
      if (!doneB) {
        setDisplayedScoreB(prev => prev + 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [phase, displayedScoreA, displayedScoreB, targetScoreA, targetScoreB, maxScore]);

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  const lastScore = session.scores[session.scores.length - 1];
  const totalTeamA = session.scores.reduce((sum, s) => sum + s.teamA, 0);
  const totalTeamB = session.scores.reduce((sum, s) => sum + s.teamB, 0);
  const isGameOver = session.status === 'game-over';
  const winner = lastScore ? (lastScore.teamA > lastScore.teamB ? 'A' : lastScore.teamB > lastScore.teamA ? 'B' : null) : null;

  const handleContinue = () => {
    if (isGameOver) {
      navigate('/game-over');
    } else {
      setStatus('playing');
      navigate('/play');
    }
  };

  return (
    <div className="h-[100dvh] p-4 flex flex-col relative overflow-hidden">
      <BackButton className="absolute top-4 left-4 z-10" />

      <AnimatePresence mode="wait">
        {phase === 'suspense' && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Suspense Title */}
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-hand text-gray-500 mb-6"
            >
              {isGameOver ? 'Résultats finaux...' : `Phase ${lastScore?.phase} terminée...`}
            </motion.p>

            {/* Team Podiums */}
            <div className="flex items-end justify-center gap-6 mb-6" style={{ height: '220px' }}>
              {/* Team A Podium */}
              <div className="flex flex-col items-center">
                <motion.div
                  key={`score-a-${displayedScoreA}`}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold font-sketch text-blue-600 mb-2"
                >
                  {displayedScoreA}
                </motion.div>
                <motion.div
                  animate={{ height: maxScore > 0 ? (displayedScoreA / maxScore) * 130 + 30 : 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 bg-blue-100 border-[3px] border-[#2d2d2d]"
                  style={{
                    borderRadius: '15px 50px 0 0 / 50px 15px 0 0',
                    boxShadow: '4px 4px 0px 0px #2d2d2d',
                    minHeight: '30px'
                  }}
                />
                <span className="font-hand text-sm font-bold text-blue-600 mt-2">
                  {getTeamName('A')}
                </span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-end pb-8">
                <span className="text-2xl font-sketch text-gray-400">VS</span>
              </div>

              {/* Team B Podium */}
              <div className="flex flex-col items-center">
                <motion.div
                  key={`score-b-${displayedScoreB}`}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold font-sketch text-amber-600 mb-2"
                >
                  {displayedScoreB}
                </motion.div>
                <motion.div
                  animate={{ height: maxScore > 0 ? (displayedScoreB / maxScore) * 130 + 30 : 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 bg-amber-100 border-[3px] border-[#2d2d2d]"
                  style={{
                    borderRadius: '50px 15px 0 0 / 15px 50px 0 0',
                    boxShadow: '4px 4px 0px 0px #2d2d2d',
                    minHeight: '30px'
                  }}
                />
                <span className="font-hand text-sm font-bold text-amber-600 mt-2">
                  {getTeamName('B')}
                </span>
              </div>
            </div>

            {/* Dramatic text */}
            <motion.p
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-xl font-sketch text-gray-700"
            >
              Qui va l'emporter ?
            </motion.p>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto flex-1 flex flex-col justify-center pt-10 min-h-0"
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4 flex-shrink-0"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-block p-3 bg-yellow-100 rounded-full mb-2 border-2 border-yellow-300"
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold font-sketch text-gray-800"
              >
                {isGameOver ? 'Partie terminée !' : `Phase ${lastScore?.phase} terminée !`}
              </motion.h1>
              {!isGameOver && lastScore && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-500 text-sm mt-1 font-hand"
                >
                  {getPhaseTitle(lastScore.phase)}
                </motion.p>
              )}
            </motion.div>

            {/* Phase Score */}
            {lastScore && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-shrink-0"
              >
                <Card variant="highlighted" className="mb-4 p-3">
                  <h2 className="text-center text-gray-500 text-xs mb-2 font-hand">
                    Cette phase
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      <Card variant="team-a" className={`text-center p-3 ${winner === 'A' ? 'ring-4 ring-yellow-400' : ''}`}>
                        <p className="text-xs text-blue-600 font-hand">{getTeamName('A')}</p>
                        <motion.p
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                          className="text-3xl font-bold text-gray-800"
                        >
                          {lastScore.teamA}
                        </motion.p>
                        {winner === 'A' && (
                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="text-xs text-yellow-600 font-bold"
                          >
                            🏆 Vainqueur !
                          </motion.span>
                        )}
                      </Card>
                    </motion.div>
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      <Card variant="team-b" className={`text-center p-3 ${winner === 'B' ? 'ring-4 ring-yellow-400' : ''}`}>
                        <p className="text-xs text-yellow-600 font-hand">{getTeamName('B')}</p>
                        <motion.p
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                          className="text-3xl font-bold text-gray-800"
                        >
                          {lastScore.teamB}
                        </motion.p>
                        {winner === 'B' && (
                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="text-xs text-yellow-600 font-bold"
                          >
                            🏆 Vainqueur !
                          </motion.span>
                        )}
                      </Card>
                    </motion.div>
                  </div>
                  {!winner && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center text-sm font-hand text-gray-500 mt-2"
                    >
                      Égalité parfaite ! 🤝
                    </motion.p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Total Score */}
            {session.scores.length > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="flex-shrink-0"
              >
                <Card className="mb-4 p-3">
                  <h2 className="text-center text-gray-500 text-xs mb-2 font-hand">
                    Score total
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`text-center p-3 rounded-xl border-2 ${
                      totalTeamA > totalTeamB
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className="text-xs text-blue-600 font-hand">{getTeamName('A')}</p>
                      <p className="text-3xl font-bold text-gray-800">{totalTeamA}</p>
                    </div>
                    <div className={`text-center p-3 rounded-xl border-2 ${
                      totalTeamB > totalTeamA
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className="text-xs text-yellow-600 font-hand">{getTeamName('B')}</p>
                      <p className="text-3xl font-bold text-gray-800">{totalTeamB}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Next Phase Info */}
            {!isGameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mb-4 flex-shrink-0"
              >
                <p className="text-gray-500 text-sm font-hand">
                  Prochaine phase : <span className="text-indigo-600 font-bold">
                    Phase {session.phase} - {getPhaseTitle(session.phase)}
                  </span>
                </p>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex-shrink-0 pb-2"
            >
              <Button
                fullWidth
                size="lg"
                onClick={handleContinue}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {isGameOver ? 'Voir les résultats' : 'Phase suivante'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
