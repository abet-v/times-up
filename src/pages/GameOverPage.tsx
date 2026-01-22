import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button, Card, BackButton } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { getTeamName, getPhaseTitle } from '../lib/utils';

export function GameOverPage() {
  const navigate = useNavigate();
  const { session, resetGame } = useGameStore();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  const totalTeamA = session.scores.reduce((sum, s) => sum + s.teamA, 0);
  const totalTeamB = session.scores.reduce((sum, s) => sum + s.teamB, 0);
  const winner = totalTeamA > totalTeamB ? 'A' : totalTeamB > totalTeamA ? 'B' : null;

  const handlePlayAgain = () => {
    // Play the legendary sound
    const audio = new Audio('https://www.myinstants.com//media/sounds/laugh_christophe_lambert_mk.mp3');
    audio.play().catch(() => {}); // Ignore errors if autoplay blocked

    resetGame();
    navigate('/');
  };

  return (
    <div className="h-[100dvh] p-4 relative overflow-y-auto">
      <BackButton className="absolute top-4 left-4 z-10" />
      <div className="max-w-md mx-auto pt-10 pb-4">
        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block"
          >
            <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-2" />
          </motion.div>

          {winner ? (
            <>
              <h1 className="text-3xl font-black font-sketch text-gray-800 mb-1">
                {getTeamName(winner)} gagne !
              </h1>
              <p className="text-gray-500 text-sm font-hand">Félicitations aux champions !</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black font-sketch text-gray-800 mb-1">Égalité !</h1>
              <p className="text-gray-500 text-sm font-hand">Quel match incroyable !</p>
            </>
          )}
        </motion.div>

        {/* Final Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="highlighted" className="mb-4 p-3">
            <h2 className="text-center text-gray-500 text-xs mb-2 font-hand">Score final</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card
                variant="team-a"
                className={`text-center p-4 ${winner === 'A' ? 'ring-4 ring-yellow-400' : ''}`}
              >
                <p className="text-xs text-blue-600 mb-1 font-hand">{getTeamName('A')}</p>
                <p className="text-4xl font-bold text-gray-800">{totalTeamA}</p>
                {winner === 'A' && (
                  <p className="text-yellow-600 text-xs mt-1 font-hand">🏆 Vainqueur</p>
                )}
              </Card>
              <Card
                variant="team-b"
                className={`text-center p-4 ${winner === 'B' ? 'ring-4 ring-amber-400' : ''}`}
              >
                <p className="text-xs text-yellow-600 mb-1 font-hand">{getTeamName('B')}</p>
                <p className="text-4xl font-bold text-gray-800">{totalTeamB}</p>
                {winner === 'B' && (
                  <p className="text-amber-600 text-xs mt-1 font-hand">🏆 Vainqueur</p>
                )}
              </Card>
            </div>
          </Card>
        </motion.div>

        {/* Phase Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-4 p-3">
            <h2 className="text-center text-gray-500 text-xs mb-2 font-hand">Score par phase</h2>
            <div className="space-y-2">
              {session.scores.map((score) => (
                <div key={score.phase} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-gray-800 text-sm font-bold font-hand">Phase {score.phase}</p>
                    <p className="text-xs text-gray-500">{getPhaseTitle(score.phase)}</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-blue-600 font-bold">{score.teamA}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-yellow-600 font-bold">{score.teamB}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            fullWidth
            size="lg"
            onClick={handlePlayAgain}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Nouvelle partie
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

