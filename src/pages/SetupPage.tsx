import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Settings, Clock, FileText, RotateCcw, SkipForward } from 'lucide-react';
import { Button, Input, Card, Modal } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { generateShortId } from '../lib/peer';
import type { PhaseSettingsMap, TimePenalty } from '../types/game';

const DEBUG_PLAYERS = [
  { name: 'Vincent', words: ['Croissant', 'Eiffel', 'Baguette'] },
  { name: 'Thomas', words: ['Soleil', 'Plage', 'Vacances'] },
  { name: 'Paul', words: ['Guitare', 'Musique', 'Concert'] },
  { name: 'Victor', words: ['Football', 'Champion', 'Victoire'] }
];

export function SetupPage() {
  const navigate = useNavigate();
  const { createSession, session, resetGame, enableMultiplayer, addPlayer, addWord, finalizePlayerWords } = useGameStore();

  const [hostName, setHostName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [wordsPerPlayer, setWordsPerPlayer] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60);
  const [phaseSettings, setPhaseSettings] = useState<PhaseSettingsMap>({
    1: { enabled: false, timePenalty: 0 },
    2: { enabled: true, timePenalty: 3 },
    3: { enabled: true, timePenalty: 3 }
  });
  const [error, setError] = useState('');
  const [debugClickCount, setDebugClickCount] = useState(0);

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

    createSession(hostName.trim(), { wordsPerPlayer, roundDuration, phaseSettings });

    // Always enable multiplayer so QR code sharing is available
    const peerId = generateShortId();
    enableMultiplayer(peerId);

    navigate('/words');
  };

  const handleDebugClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);

    if (newCount >= 5) {
      setDebugClickCount(0);

      // Create session with debug settings (5 sec penalty for all phases)
      const debugSettings = {
        wordsPerPlayer: 3,
        roundDuration: 60,
        phaseSettings: {
          1: { enabled: true, timePenalty: 5 as TimePenalty },
          2: { enabled: true, timePenalty: 5 as TimePenalty },
          3: { enabled: true, timePenalty: 5 as TimePenalty }
        }
      };

      // Create session with first player as host
      createSession(DEBUG_PLAYERS[0].name, debugSettings);

      // Enable multiplayer
      const peerId = generateShortId();
      enableMultiplayer(peerId);

      // Add words for host
      const store = useGameStore.getState();
      const hostId = store.session?.players[0]?.id;
      if (hostId) {
        DEBUG_PLAYERS[0].words.forEach(word => addWord(hostId, word));
        finalizePlayerWords(hostId);
      }

      // Add other players with their words
      DEBUG_PLAYERS.slice(1).forEach(playerData => {
        const player = addPlayer(playerData.name);
        playerData.words.forEach(word => addWord(player.id, word));
        finalizePlayerWords(player.id);
      });

      navigate('/words');
    }
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
          Vin's Up!
        </h1>
        <p className="text-gray-500 font-hand text-lg">
          Le Time's up avec des mots custom
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

      {/* Footer */}
      <div className="flex-shrink-0 pb-4 pt-2">
        <p
          className="text-center text-xs text-gray-400 font-hand cursor-default select-none"
          onClick={handleDebugClick}
        >
          by Vincent ABET
        </p>
      </div>

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

          {/* Phase Pass Settings */}
          <div>
            <label className="block text-lg font-bold text-[#2d2d2d] mb-3 font-hand flex items-center gap-2">
              <SkipForward className="w-5 h-5" />
              Droit de passer
            </label>
            <div className="space-y-3">
              {([1, 2, 3] as const).map((phase) => {
                const phaseNames = {
                  1: 'Description',
                  2: 'Un mot',
                  3: 'Mime'
                };
                const settings = phaseSettings[phase];
                return (
                  <div
                    key={phase}
                    className="p-3 border-2 border-dashed border-[#2d2d2d]/30 bg-[#fdfbf7]"
                    style={{ borderRadius: '15px 30px 15px 30px / 30px 15px 30px 15px' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-hand font-bold text-[#2d2d2d]">
                        Phase {phase}: {phaseNames[phase]}
                      </span>
                      <button
                        onClick={() => setPhaseSettings(prev => ({
                          ...prev,
                          [phase]: { ...prev[phase], enabled: !prev[phase].enabled }
                        }))}
                        className="relative w-14 h-8 border-[3px] border-[#2d2d2d] transition-colors duration-200"
                        style={{
                          borderRadius: '50px 45px 50px 45px / 45px 50px 45px 50px',
                          boxShadow: '2px 2px 0px 0px rgba(45, 45, 45, 0.3)',
                          backgroundColor: settings.enabled ? '#6b9e78' : '#ff4d4d',
                        }}
                      >
                        <span
                          className={`
                            absolute top-0.5 w-5 h-5 bg-white border-2 border-[#2d2d2d]
                            transition-all duration-200
                            ${settings.enabled ? 'left-7' : 'left-1'}
                          `}
                          style={{
                            borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%',
                            boxShadow: '1px 1px 0px 0px rgba(45, 45, 45, 0.2)',
                          }}
                        />
                      </button>
                    </div>
                    {settings.enabled && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-[#2d2d2d]/70 font-hand">Pénalité:</span>
                        {([0, 3, 5] as TimePenalty[]).map((penalty) => (
                          <button
                            key={penalty}
                            onClick={() => setPhaseSettings(prev => ({
                              ...prev,
                              [phase]: { ...prev[phase], timePenalty: penalty }
                            }))}
                            className={`
                              w-10 h-8 border-2 font-bold text-sm font-hand
                              transition-all duration-100
                              hover:rotate-2
                            `}
                            style={{
                              borderRadius: '10px 20px 10px 20px / 20px 10px 20px 10px',
                              ...(settings.timePenalty === penalty
                                ? {
                                    backgroundColor: '#ff4d4d',
                                    color: '#ffffff',
                                    borderColor: '#2d2d2d',
                                    boxShadow: '2px 2px 0px 0px #2d2d2d',
                                  }
                                : {
                                    backgroundColor: '#ffffff',
                                    color: '#2d2d2d',
                                    borderColor: '#2d2d2d',
                                    boxShadow: '1px 1px 0px 0px rgba(45, 45, 45, 0.15)',
                                  }),
                            }}
                          >
                            {penalty}s
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
