import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { Button } from './Button';
import { useGameStore } from '../../store/gameStore';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const { resetGame } = useGameStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    resetGame();
    navigate('/');
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConfirm(true)}
        className={`
          flex items-center gap-2 px-3 py-2
          text-gray-600 hover:text-gray-800
          bg-white/80 hover:bg-white
          border-2 border-gray-300 hover:border-gray-400
          rounded-lg shadow-sm
          transition-colors duration-200
          font-bold text-sm
          ${className}
        `}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour</span>
      </motion.button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Quitter la partie ?"
      >
        <div className="space-y-4">
          <p className="text-gray-600 font-hand text-lg">
            Tu vas perdre la partie en cours et toutes les données seront effacées.
          </p>
          <p className="text-gray-500 text-sm">
            Es-tu sûr de vouloir retourner à l'accueil ?
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirm}
            >
              Quitter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

