import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card } from '../ui';
import type { Turn } from '../../types/game';

interface TurnReviewModalProps {
  isOpen: boolean;
  lastTurn: Turn;
  onUncorrect: (word: string) => void;
  onCorrect: (word: string) => void;
  onClose: () => void;
}

interface WordItemProps {
  word: string;
  isFound: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
}

function WordItem({ word, isFound, onSwipe }: WordItemProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragEnd = (_: never, info: PanInfo) => {
    setDragging(false);
    if (Math.abs(info.offset.x) > 50) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        backgroundColor: dragging ? (isFound ? '#fecaca' : '#bbf7d0') : '#ffffff'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={() => onSwipe(isFound ? 'left' : 'right')}
      className={`
        flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none touch-pan-y
        ${isFound
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        }
      `}
      whileTap={{ scale: 0.95 }}
    >
      {isFound ? (
        <>
          <ChevronLeft className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="font-hand text-sm text-gray-800 flex-1 text-center">{word}</span>
          <div className="w-4" />
        </>
      ) : (
        <>
          <div className="w-4" />
          <span className="font-hand text-sm text-gray-800 flex-1 text-center">{word}</span>
          <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0" />
        </>
      )}
    </motion.div>
  );
}

export function TurnReviewModal({
  isOpen,
  lastTurn,
  onUncorrect,
  onCorrect,
  onClose
}: TurnReviewModalProps) {
  // Filter skipped words to exclude those that were eventually found
  // and deduplicate (same word may be skipped multiple times)
  const skippedOnlyWords = [...new Set(
    lastTurn.skippedWords.filter(word => !lastTurn.foundWords.includes(word))
  )];

  const handleSwipe = (word: string, isFound: boolean, direction: 'left' | 'right') => {
    if (isFound && direction === 'left') {
      // Move from Found to Skipped
      onUncorrect(word);
    } else if (!isFound && direction === 'right') {
      // Move from Skipped to Found
      onCorrect(word);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#fdfbf7] p-4 flex flex-col"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold font-sketch text-gray-800">
          Revoir le tour
        </h1>
        <p className="text-gray-500 text-sm font-hand">
          Swipe ou clique pour déplacer les mots
        </p>
      </div>

      {/* Split View - Same style as Teams */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left Column - Passé (Red) */}
        <Card
          variant="team-b"
          className="p-3 flex flex-col overflow-hidden"
          style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fca5a5'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h2 className="font-bold text-sm font-hand text-red-700">Passé</h2>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto min-h-[100px]" style={{ WebkitOverflowScrolling: 'touch' }}>
            <AnimatePresence mode="popLayout">
              {skippedOnlyWords.length === 0 ? (
                <p className="text-red-300 text-sm text-center py-4 font-hand">
                  Aucun mot passé
                </p>
              ) : (
                skippedOnlyWords.map((word) => (
                  <WordItem
                    key={`skipped-${word}`}
                    word={word}
                    isFound={false}
                    onSwipe={(dir) => handleSwipe(word, false, dir)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
          <div className="text-center mt-2 text-sm font-bold text-red-600">
            {skippedOnlyWords.length} mot{skippedOnlyWords.length > 1 ? 's' : ''}
          </div>
        </Card>

        {/* Right Column - Trouvé (Green) */}
        <Card
          variant="team-a"
          className="p-3 flex flex-col overflow-hidden"
          style={{
            backgroundColor: '#f0fdf4',
            borderColor: '#86efac'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <h2 className="font-bold text-sm font-hand text-green-700">Trouvé</h2>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto min-h-[100px]" style={{ WebkitOverflowScrolling: 'touch' }}>
            <AnimatePresence mode="popLayout">
              {lastTurn.foundWords.length === 0 ? (
                <p className="text-green-300 text-sm text-center py-4 font-hand">
                  Aucun mot trouvé
                </p>
              ) : (
                lastTurn.foundWords.map((word) => (
                  <WordItem
                    key={`found-${word}`}
                    word={word}
                    isFound={true}
                    onSwipe={(dir) => handleSwipe(word, true, dir)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
          <div className="text-center mt-2 text-sm font-bold text-green-600">
            {lastTurn.foundWords.length} mot{lastTurn.foundWords.length > 1 ? 's' : ''}
          </div>
        </Card>
      </div>

      {/* Score Summary */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 font-hand">
          Score ce tour : <span className="font-bold text-xl text-green-600">+{lastTurn.foundWords.length}</span>
        </p>
      </div>

      {/* OK Button */}
      <div className="mt-4">
        <Button fullWidth size="lg" variant="success" onClick={onClose}>
          Ok
        </Button>
      </div>
    </motion.div>
  );
}
