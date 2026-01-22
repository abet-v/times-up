import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Check, X, Loader2, Send, PartyPopper } from 'lucide-react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { Button, Input, Card } from '../components/ui';
import { peerServerConfig, type P2PMessage } from '../lib/peer';

type ConnectionStatus = 'connecting' | 'connected' | 'entering' | 'done' | 'error';

export function JoinPage() {
  const { peerId } = useParams<{ peerId: string }>();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [name, setName] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [error, setError] = useState('');
  const [wordsPerPlayer] = useState(5);

  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // Connect to host on mount
  useEffect(() => {
    if (!peerId) {
      setStatus('error');
      setError('Code de partie invalide');
      return;
    }

    const peer = new Peer({
      ...peerServerConfig,
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
      const conn = peer.connect(peerId, { reliable: true });

      conn.on('open', () => {
        connectionRef.current = conn;
        setStatus('connected');
      });

      conn.on('data', (data) => {
        const message = data as P2PMessage;
        if (message.type === 'player-confirmed') {
          setStatus('entering');
        } else if (message.type === 'error') {
          setError(message.message);
          setStatus('error');
        }
      });

      conn.on('close', () => {
        setStatus('error');
        setError('Connexion perdue');
      });

      conn.on('error', () => {
        setStatus('error');
        setError('Erreur de connexion');
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setStatus('error');
      if (err.type === 'peer-unavailable') {
        setError('Partie introuvable. Vérifie le code.');
      } else {
        setError('Impossible de se connecter');
      }
    });

    // Cleanup
    return () => {
      connectionRef.current?.close();
      peerRef.current?.destroy();
    };
  }, [peerId]);

  // Auto-focus word input when entering words
  useEffect(() => {
    if (status === 'entering') {
      wordInputRef.current?.focus();
    }
  }, [status]);

  const handleSubmitName = () => {
    if (!name.trim()) {
      setError('Entre ton prénom !');
      return;
    }
    if (!connectionRef.current) return;

    // Easter egg: Greg sound
    const nameLower = name.trim().toLowerCase();
    if (nameLower === 'greg' || nameLower === 'gregoire' || nameLower === 'grégoire') {
      const audio = new Audio('https://www.myinstants.com/media/sounds/ouais-cest-greg.mp3');
      audio.play().catch(() => {});
    }

    const message: P2PMessage = {
      type: 'player-join',
      name: name.trim(),
      peerId: peerRef.current?.id || ''
    };
    connectionRef.current.send(message);
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    if (words.includes(newWord.trim())) {
      setError('Ce mot existe déjà !');
      return;
    }
    if (words.length >= wordsPerPlayer) return;

    const word = newWord.trim();
    setWords(prev => [...prev, word]);
    setNewWord('');
    setError('');

    // Re-focus input for quick successive entries
    setTimeout(() => wordInputRef.current?.focus(), 0);

    // Send word to host
    if (connectionRef.current) {
      const message: P2PMessage = { type: 'word-add', word };
      connectionRef.current.send(message);
    }
  };

  const handleRemoveWord = (word: string) => {
    setWords(prev => prev.filter(w => w !== word));

    // Notify host
    if (connectionRef.current) {
      const message: P2PMessage = { type: 'word-remove', word };
      connectionRef.current.send(message);
    }
  };

  const handleComplete = () => {
    if (words.length < wordsPerPlayer) {
      setError(`Il te faut encore ${wordsPerPlayer - words.length} mot(s) !`);
      return;
    }

    if (connectionRef.current) {
      const message: P2PMessage = { type: 'words-complete', words };
      connectionRef.current.send(message);
    }

    setStatus('done');
  };

  // Connecting screen
  if (status === 'connecting') {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Loader2 className="w-16 h-16 text-[#2d5da1]" />
          </motion.div>
          <h2 className="text-2xl font-bold font-sketch text-[#2d2d2d] mb-2">
            Connexion...
          </h2>
          <p className="text-[#2d2d2d]/60 font-hand">
            Connexion à la partie {peerId}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error screen
  if (status === 'error') {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-[#ff4d4d]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-[#ff4d4d]" />
          </div>
          <h2 className="text-2xl font-bold font-sketch text-[#2d2d2d] mb-2">
            Oups !
          </h2>
          <p className="text-[#2d2d2d]/60 font-hand mb-6">
            {error || 'Une erreur est survenue'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </motion.div>
      </div>
    );
  }

  // Connected - enter name
  if (status === 'connected') {
    return (
      <div className="min-h-screen p-4 flex flex-col">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-hand text-sm">Connecté</span>
          </div>
          <h1 className="text-4xl font-bold font-sketch text-[#2d2d2d]">
            Vin's Up!
          </h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
        >
          <Card variant="highlighted" className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-hand text-[#2d2d2d] mb-2">
                  Bienvenue !
                </h2>
                <p className="text-[#2d2d2d]/60 text-sm font-hand">
                  Entre ton prénom pour rejoindre la partie
                </p>
              </div>

              <Input
                label="Ton prénom"
                placeholder="Entre ton prénom..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                error={error}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
              />

              <Button
                fullWidth
                size="lg"
                onClick={handleSubmitName}
                icon={<Send className="w-5 h-5" />}
              >
                Rejoindre
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Entering words
  if (status === 'entering') {
    return (
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-hand text-xs">Connecté</span>
          </div>
          <h1 className="text-3xl font-bold font-sketch text-[#2d2d2d]">
            {name}
          </h1>
          <p className="text-[#2d2d2d]/60 font-hand">
            Entre tes {wordsPerPlayer} mots secrets
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto w-full mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#2d2d2d]/60 font-hand">Progression</span>
            <span className="text-sm font-bold text-[#2d5da1]">
              {words.length}/{wordsPerPlayer}
            </span>
          </div>
          <div className="h-3 bg-[#e5e0d8] rounded-full overflow-hidden border-2 border-[#2d2d2d]/20">
            <motion.div
              className="h-full bg-[#2d5da1]"
              initial={{ width: 0 }}
              animate={{ width: `${(words.length / wordsPerPlayer) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Word Input - Sticky */}
        <div className="sticky top-0 z-10 bg-[#fdfbf7] pb-3 -mx-4 px-4">
          <div className="max-w-md mx-auto w-full">
            <div className="flex gap-2">
              <Input
                ref={wordInputRef}
                placeholder="Entre un mot..."
                value={newWord}
                onChange={(e) => {
                  setNewWord(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                error={error}
                disabled={words.length >= wordsPerPlayer}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                enterKeyHint="send"
              />
              <Button
                onClick={handleAddWord}
                disabled={!newWord.trim() || words.length >= wordsPerPlayer}
                size="lg"
                variant="danger"
                className="shrink-0 text-2xl !px-8"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Words List - Scrollable */}
        <div className="max-w-md mx-auto w-full flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="popLayout">
            {words.map((word, index) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg border-2 border-[#2d2d2d]/20 shadow-sm"
              >
                <span className="font-hand text-[#2d2d2d]">{word}</span>
                <button
                  onClick={() => handleRemoveWord(word)}
                  className="p-1 text-[#2d2d2d]/40 hover:text-[#ff4d4d] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        {words.length >= wordsPerPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto w-full mt-4"
          >
            <Button
              fullWidth
              size="lg"
              onClick={handleComplete}
              icon={<Check className="w-5 h-5" />}
            >
              Valider mes mots
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Done
  if (status === 'done') {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500"
          >
            <PartyPopper className="w-10 h-10 text-green-600" />
          </motion.div>

          <h2 className="text-3xl font-bold font-sketch text-[#2d2d2d] mb-2">
            C'est fait !
          </h2>

          <p className="text-[#2d2d2d]/60 font-hand text-lg mb-2">
            Tes {words.length} mots ont été envoyés
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-[#fff9c4] border-2 border-dashed border-[#2d2d2d]/30 rounded-lg mt-6"
          >
            <p className="font-hand text-[#2d2d2d]">
              Rejoins l'écran principal pour commencer à jouer !
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}
