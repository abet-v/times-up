import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="bg-white border-2 border-gray-700 rounded-lg p-6 shadow-[4px_4px_0_#374151]">
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 font-hand">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-dashed border-gray-300"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

