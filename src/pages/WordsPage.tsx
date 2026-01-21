import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, UserPlus, Users, QrCode, Wifi } from 'lucide-react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { Button, Input, Card, BackButton, ShareModal } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import type { P2PMessage } from '../lib/peer';

export function WordsPage() {
  const navigate = useNavigate();
  const {
    session,
    currentPlayerId,
    addWord,
    removeWord,
    finalizePlayerWords,
    addPlayer,
    removePlayer,
    goToTeams,
    isMultiplayerHost,
    hostPeerId,
    addRemotePlayer,
    updateRemotePlayerWords,
    finalizeRemotePlayerWords,
    removeRemotePlayer,
    getRemotePlayer
  } = useGameStore();

  const [newWord, setNewWord] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);

  // P2P state
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const peerInitializedRef = useRef(false);

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (session && !currentPlayerId) {
      setShowAddPlayer(true);
    }
  }, [session, currentPlayerId]);

  // Initialize P2P host if multiplayer mode
  useEffect(() => {
    if (!isMultiplayerHost || !hostPeerId) return;

    // Prevent multiple initializations (React Strict Mode / HMR)
    if (peerInitializedRef.current && peerRef.current) {
      return;
    }

    peerInitializedRef.current = true;

    const peer = new Peer(hostPeerId, {
      host: 'vinsup-peer.fly.dev',
      port: 443,
      path: '/peerjs',
      secure: true,
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10,
      },
    });

    peerRef.current = peer;

    peer.on('open', () => {
      console.log('Host peer ready:', hostPeerId);
    });

    peer.on('connection', (conn) => {
      console.log('New connection from:', conn.peer);

      conn.on('open', () => {
        connectionsRef.current.set(conn.peer, conn);
      });

      conn.on('data', (data) => {
        const message = data as P2PMessage;
        handleP2PMessage(conn, message);
      });

      conn.on('close', () => {
        connectionsRef.current.delete(conn.peer);
        // Only remove the player if they haven't completed their words
        const player = getRemotePlayer(conn.peer);
        if (player && !player.wordsCompleted) {
          removeRemotePlayer(conn.peer);
        }
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        connectionsRef.current.delete(conn.peer);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    // Cleanup only on unmount
    return () => {
      // Don't destroy in development due to strict mode double-mount
      // The peer will be reused
    };
  }, [isMultiplayerHost, hostPeerId]);

  const handleP2PMessage = (conn: DataConnection, message: P2PMessage) => {
    switch (message.type) {
      case 'player-join': {
        const player = addRemotePlayer(message.name, conn.peer);
        // Send confirmation back to the remote player
        const response: P2PMessage = { type: 'player-confirmed', playerId: player.id };
        conn.send(response);
        break;
      }
      case 'word-add': {
        const player = getRemotePlayer(conn.peer);
        if (player) {
          const newWords = [...player.words, message.word];
          updateRemotePlayerWords(conn.peer, newWords);
        }
        break;
      }
      case 'word-remove': {
        const player = getRemotePlayer(conn.peer);
        if (player) {
          const newWords = player.words.filter(w => w !== message.word);
          updateRemotePlayerWords(conn.peer, newWords);
        }
        break;
      }
      case 'words-complete': {
        finalizeRemotePlayerWords(conn.peer, message.words);
        break;
      }
    }
  };

  if (!session) return null;

  const currentPlayer = session.players.find(p => p.id === currentPlayerId);
  const wordsPerPlayer = session.settings.wordsPerPlayer;
  const currentWords = currentPlayer?.words || [];
  const wordsRemaining = wordsPerPlayer - currentWords.length;

  // Count remote players
  const remotePlayers = session.players.filter(p => p.isRemote);
  const remotePlayersCompleted = remotePlayers.filter(p => p.wordsCompleted).length;

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    if (!currentPlayerId) return;

    if (currentWords.includes(newWord.trim())) {
      setError('Ce mot existe déjà !');
      return;
    }

    addWord(currentPlayerId, newWord.trim());
    setNewWord('');
    setError('');
  };

  const handleRemoveWord = (word: string) => {
    if (!currentPlayerId) return;
    removeWord(currentPlayerId, word);
  };

  const handleFinishWords = () => {
    if (!currentPlayerId) return;
    if (currentWords.length < wordsPerPlayer) {
      setError(`Il te faut encore ${wordsRemaining} mot(s) !`);
      return;
    }
    finalizePlayerWords(currentPlayerId);
    setShowAddPlayer(true);
  };

  const handleAddNewPlayer = () => {
    if (!newPlayerName.trim()) {
      setError('Entre un prénom !');
      return;
    }
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddPlayer(false);
    setError('');
  };

  const handleGoToTeams = () => {
    if (session.players.length < 4) {
      setError('Il faut au moins 4 joueurs !');
      return;
    }

    // Check if all players have completed their words
    const incompletePlayer = session.players.find(p => !p.wordsCompleted);
    if (incompletePlayer) {
      setError(`${incompletePlayer.name} n'a pas fini ses mots !`);
      return;
    }

    goToTeams();
    navigate('/teams');
  };

  // Show "Add Player" screen when current player is done
  if (!currentPlayerId && showAddPlayer) {
    return (
      <div className="min-h-[100dvh] p-4 flex flex-col">
        <BackButton className="absolute top-4 left-4" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pt-10"
        >
          <Card variant="highlighted" className="p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold font-hand text-gray-800 mb-1">
                Mots enregistrés !
              </h2>
              <p className="text-gray-500 text-sm">
                {isMultiplayerHost
                  ? 'Attends que les autres joueurs finissent leurs mots'
                  : 'Passe le téléphone au joueur suivant'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Player list */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-hand text-gray-600">Joueurs inscrits</span>
                  <span className="font-bold text-indigo-600">{session.players.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.players.map((p) => (
                    <span
                      key={p.id}
                      className={`px-3 py-1 rounded-full text-sm font-hand flex items-center gap-1 ${
                        p.wordsCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.isRemote && <Wifi className="w-3 h-3" />}
                      {p.name}
                      {p.wordsCompleted && ' ✓'}
                      {!p.wordsCompleted && p.isRemote && ` (${p.words.length}/${wordsPerPlayer})`}
                      {/* Remove button - not for host */}
                      {!p.isHost && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.isRemote && p.peerId) {
                              removeRemotePlayer(p.peerId);
                            } else {
                              removePlayer(p.id);
                            }
                          }}
                          className="ml-1 p-0.5 rounded-full hover:bg-red-200 text-current hover:text-red-600 transition-colors"
                          title={`Retirer ${p.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Multiplayer: Show share button */}
              {isMultiplayerHost && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setShowShare(true)}
                  icon={<QrCode className="w-5 h-5" />}
                >
                  Inviter des joueurs
                </Button>
              )}

              {/* Add local player */}
              <div className="space-y-3">
                <Input
                  label="Ajouter un joueur local"
                  placeholder="Entre son prénom..."
                  value={newPlayerName}
                  onChange={(e) => {
                    setNewPlayerName(e.target.value);
                    setError('');
                  }}
                  error={error}
                />

                <Button
                  fullWidth
                  onClick={handleAddNewPlayer}
                  icon={<UserPlus className="w-5 h-5" />}
                >
                  Ajouter ce joueur
                </Button>
              </div>

              {session.players.length >= 4 && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleGoToTeams}
                  icon={<Users className="w-5 h-5" />}
                >
                  Passer aux équipes ({session.players.length} joueurs)
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Share Modal */}
        {isMultiplayerHost && hostPeerId && (
          <ShareModal
            isOpen={showShare}
            onClose={() => setShowShare(false)}
            peerId={hostPeerId}
          />
        )}
      </div>
    );
  }

  if (!currentPlayerId) return null;

  // Word entry screen for current player
  return (
    <div className="min-h-[100dvh] p-4 flex flex-col relative">
      <BackButton className="absolute top-4 left-4 z-10" />

      {/* Share button for multiplayer */}
      {isMultiplayerHost && hostPeerId && (
        <button
          onClick={() => setShowShare(true)}
          className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <QrCode className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-4 pt-10">
        <h1 className="text-2xl font-bold font-sketch text-gray-800">
          {currentPlayer?.name}
        </h1>
        <p className="text-gray-500 text-sm font-hand">
          Entre tes {wordsPerPlayer} mots secrets
        </p>
      </div>

      {/* Remote players status (multiplayer mode) */}
      {isMultiplayerHost && remotePlayers.length > 0 && (
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-hand">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>
              {remotePlayersCompleted}/{remotePlayers.length} joueurs distants prêts
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="max-w-md mx-auto w-full mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-hand">Progression</span>
          <span className="text-sm font-bold text-indigo-600">
            {currentWords.length}/{wordsPerPlayer}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentWords.length / wordsPerPlayer) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Word Input */}
      <div className="max-w-md mx-auto w-full mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Entre un mot..."
            value={newWord}
            onChange={(e) => {
              setNewWord(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            error={error}
            disabled={currentWords.length >= wordsPerPlayer}
          />
          <Button
            onClick={handleAddWord}
            disabled={!newWord.trim() || currentWords.length >= wordsPerPlayer}
            className="shrink-0"
          >
            +
          </Button>
        </div>
      </div>

      {/* Words List */}
      <div className="max-w-md mx-auto w-full flex-1">
        <AnimatePresence mode="popLayout">
          {currentWords.map((word, index) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg border-2 border-gray-200 shadow-sm"
            >
              <span className="font-hand text-gray-800">{word}</span>
              <button
                onClick={() => handleRemoveWord(word)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      {currentWords.length >= wordsPerPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full mt-4"
        >
          <Button
            fullWidth
            size="lg"
            onClick={handleFinishWords}
            icon={<Check className="w-5 h-5" />}
          >
            Valider mes mots
          </Button>
        </motion.div>
      )}

      {/* Share Modal */}
      {isMultiplayerHost && hostPeerId && (
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          peerId={hostPeerId}
        />
      )}
    </div>
  );
}
