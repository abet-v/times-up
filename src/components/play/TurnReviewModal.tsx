import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';
import { Button, Modal } from '../ui';
import type { Turn } from '../../types/game';

interface TurnReviewModalProps {
  isOpen: boolean;
  lastTurn: Turn;
  onUncorrect: (word: string) => void;
  onCorrect: (word: string) => void;
  onClose: () => void;
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

  const hasFoundWords = lastTurn.foundWords.length > 0;
  const hasSkippedWords = skippedOnlyWords.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revoir le tour">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Found Words Section */}
        {hasFoundWords && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
              <span className="font-hand text-sm text-gray-600">
                Mots trouves ({lastTurn.foundWords.length})
              </span>
            </div>
            <div
              className="border-2 border-gray-300 bg-green-50/50 p-2 space-y-2"
              style={{
                borderRadius: '15px 225px 15px 255px / 225px 15px 255px 15px'
              }}
            >
              <AnimatePresence mode="popLayout">
                {lastTurn.foundWords.map((word) => (
                  <motion.div
                    key={word}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center justify-between gap-2 bg-white border-2 border-gray-200 px-3 py-2"
                    style={{
                      borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                    }}
                  >
                    <span className="font-hand text-gray-800">{word}</span>
                    <button
                      onClick={() => onUncorrect(word)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-hand text-red-600 bg-red-50 border-2 border-red-300 hover:bg-red-100 transition-colors"
                      style={{
                        borderRadius: '15px 225px 15px 255px / 225px 15px 255px 15px'
                      }}
                    >
                      <X className="w-3 h-3" strokeWidth={3} />
                      Annuler
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Skipped Words Section */}
        {hasSkippedWords && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-amber-600" strokeWidth={3} />
              <span className="font-hand text-sm text-gray-600">
                Mots passes ({skippedOnlyWords.length})
              </span>
            </div>
            <div
              className="border-2 border-gray-300 bg-amber-50/50 p-2 space-y-2"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
              }}
            >
              <AnimatePresence mode="popLayout">
                {skippedOnlyWords.map((word) => (
                  <motion.div
                    key={word}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center justify-between gap-2 bg-white border-2 border-gray-200 px-3 py-2"
                    style={{
                      borderRadius: '15px 225px 15px 255px / 225px 15px 255px 15px'
                    }}
                  >
                    <span className="font-hand text-gray-800">{word}</span>
                    <button
                      onClick={() => onCorrect(word)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-hand text-green-600 bg-green-50 border-2 border-green-300 hover:bg-green-100 transition-colors"
                      style={{
                        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                      }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                      Valider
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasFoundWords && !hasSkippedWords && (
          <p className="text-center text-gray-500 font-hand py-4">
            Aucun mot a revoir
          </p>
        )}
      </div>

      {/* Close Button */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
        <Button fullWidth variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </Modal>
  );
}
