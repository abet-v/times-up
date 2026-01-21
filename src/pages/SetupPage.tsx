import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Settings, Clock, FileText, RotateCcw } from 'lucide-react';
import { Button, Input, Card, Modal } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { generateShortId } from '../lib/peer';

export function SetupPage() {
  const navigate = useNavigate();
  const { createSession, session, resetGame, enableMultiplayer } = useGameStore();

  const [hostName, setHostName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60);
  const [error, setError] = useState('');

  // If there's already a session, redirect based on status
  useEffect(() => {
    if (session) {
      switch (session.status) {
        case 'words':
          navigate('/words');
          break;
        case 'teams':
          navigate('/teams');
          break;
        case 'playing':
          navigate('/play');
          break;
        case 'phase-summary':
          navigate('/phase-summary');
          break;
        case 'game-over':
          navigate('/game-over');
          break;
      }
    }
  }, [session, navigate]);

  // If session exists, don't render the form (useEffect will redirect)
  if (session) {
    return (
      <div className="h-[100dvh] p-4 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-hand text-xl mb-4">Chargement...</p>
        <Button variant="ghost" onClick={resetGame} icon={<RotateCcw className="w-4 h-4" />}>
          Nouvelle partie
        </Button>
      </div>
    );
  }

  const handleStart = () => {
    if (!hostName.trim()) {
      setError('Entre ton prénom !');
      return;
    }

    createSession(hostName.trim(), { wordsPerPlayer, roundDuration });

    // Always enable multiplayer so QR code sharing is available
    const peerId = generateShortId();
    enableMultiplayer(peerId);

    navigate('/words');
  };

  return (
    <div className="h-[100dvh] p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 pt-6 flex-shrink-0"
      >
        <h1 className="text-4xl font-bold font-sketch text-gray-800 mb-1">
          Time's Up!
        </h1>
        <p className="text-gray-500 font-hand text-lg">
          Le jeu de devinettes en équipe
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full min-h-0"
      >
        <Card variant="highlighted" className="p-5">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-hand text-gray-800 mb-2">
                Nouvelle Partie
              </h2>
              <p className="text-gray-500 text-sm">
                Tu es l'organisateur de la partie
              </p>
            </div>

            <Input
              label="Ton prénom"
              placeholder="Entre ton prénom..."
              value={hostName}
              onChange={(e) => {
                setHostName(e.target.value);
                setError('');
              }}
              error={error}
            />

            {/* Settings Summary */}
            <div
              className="flex items-center justify-between p-3 bg-[#fff9c4] border-[3px] border-dashed border-[#2d2d2d] cursor-pointer hover:rotate-1 transition-transform duration-100"
              style={{
                borderRadius: '15px 50px 30px 50px / 50px 15px 50px 30px',
                boxShadow: '3px 3px 0px 0px rgba(45, 45, 45, 0.15)',
              }}
              onClick={() => setShowSettings(true)}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-[#2d2d2d]" />
                <span className="text-[#2d2d2d] font-hand font-bold">Paramètres</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#2d2d2d]/70 font-hand">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {wordsPerPlayer} mots
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {roundDuration}s
                </span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={handleStart}
              icon={<Play className="w-5 h-5" />}
            >
              C'est parti !
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Paramètres"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-[#2d2d2d] mb-3 font-hand">
              Mots par joueur
            </label>
            <div className="flex items-center gap-3">
              {[3, 5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setWordsPerPlayer(n)}
                  className={`
                    w-12 h-12 border-[3px] font-bold text-lg font-hand
                    transition-all duration-100
                    hover:rotate-2
                  `}
                  style={{
                    borderRadius: '15px 50px 30px 50px / 50px 15px 50px 30px',
                    ...(wordsPerPlayer === n
                      ? {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          borderColor: '#2d2d2d',
                          boxShadow: '3px 3px 0px 0px #2d2d2d',
                          transform: 'rotate(-2deg)',
                        }
                      : {
                          backgroundColor: '#ffffff',
                          color: '#2d2d2d',
                          borderColor: '#2d2d2d',
                          boxShadow: '2px 2px 0px 0px rgba(45, 45, 45, 0.15)',
                        }),
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-[#2d2d2d] mb-3 font-hand">
              Durée d'un tour (secondes)
            </label>
            <div className="flex items-center gap-3">
              {[30, 45, 60, 90].map((n) => (
                <button
                  key={n}
                  onClick={() => setRoundDuration(n)}
                  className={`
                    w-14 h-12 border-[3px] font-bold text-lg font-hand
                    transition-all duration-100
                    hover:rotate-2
                  `}
                  style={{
                    borderRadius: '30px 15px 50px 15px / 15px 50px 15px 50px',
                    ...(roundDuration === n
                      ? {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          borderColor: '#2d2d2d',
                          boxShadow: '3px 3px 0px 0px #2d2d2d',
                          transform: 'rotate(-2deg)',
                        }
                      : {
                          backgroundColor: '#ffffff',
                          color: '#2d2d2d',
                          borderColor: '#2d2d2d',
                          boxShadow: '2px 2px 0px 0px rgba(45, 45, 45, 0.15)',
                        }),
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Button fullWidth onClick={() => setShowSettings(false)}>
            Valider
          </Button>
        </div>
      </Modal>

    </div>
  );
}
