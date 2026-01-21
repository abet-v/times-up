import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Button, Card, BackButton } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { getPhaseTitle, getTeamName } from '../lib/utils';

export function PhaseSummaryPage() {
  const navigate = useNavigate();
  const { session, setStatus } = useGameStore();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

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
      <div className="max-w-md mx-auto flex-1 flex flex-col justify-center pt-10 min-h-0">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 flex-shrink-0"
        >
          <div className="inline-block p-3 bg-yellow-100 rounded-full mb-2 border-2 border-yellow-300">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold font-sketch text-gray-800">
            {isGameOver ? 'Partie terminée !' : `Phase ${lastScore?.phase} terminée !`}
          </h1>
          {!isGameOver && lastScore && (
            <p className="text-gray-500 text-sm mt-1 font-hand">{getPhaseTitle(lastScore.phase)}</p>
          )}
        </motion.div>

        {/* Phase Score */}
        {lastScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Card variant="highlighted" className="mb-4 p-3">
              <h2 className="text-center text-gray-500 text-xs mb-2 font-hand">
                Cette phase
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Card variant="team-a" className="text-center p-3">
                  <p className="text-xs text-blue-600 font-hand">{getTeamName('A')}</p>
                  <p className="text-3xl font-bold text-gray-800">{lastScore.teamA}</p>
                </Card>
                <Card variant="team-b" className="text-center p-3">
                  <p className="text-xs text-yellow-600 font-hand">{getTeamName('B')}</p>
                  <p className="text-3xl font-bold text-gray-800">{lastScore.teamB}</p>
                </Card>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Total Score */}
        {session.scores.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.5 }}
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
      </div>
    </div>
  );
}

