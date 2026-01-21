import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, QrCode, Link as LinkIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from './Button';
import { getJoinUrl } from '../../lib/peer';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerId: string;
}

export function ShareModal({ isOpen, onClose, peerId }: ShareModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const joinUrl = getJoinUrl(peerId);

  useEffect(() => {
    if (isOpen && peerId) {
      QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#2d2d2d',
          light: '#fdfbf7'
        }
      }).then(setQrCodeUrl);
    }
  }, [isOpen, peerId, joinUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <div
              className="bg-[#fdfbf7] border-[3px] border-[#2d2d2d] p-6 shadow-[4px_4px_0_#2d2d2d]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2d5da1] rounded-full flex items-center justify-center border-2 border-[#2d2d2d]">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2d2d2d] font-sketch">
                    Inviter des joueurs
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#e5e0d8] rounded-lg transition-colors border-2 border-dashed border-[#e5e0d8]"
                >
                  <X className="w-5 h-5 text-[#2d2d2d]" />
                </button>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                {qrCodeUrl ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-white border-2 border-dashed border-[#e5e0d8] rounded-lg"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code pour rejoindre"
                      className="w-48 h-48"
                    />
                  </motion.div>
                ) : (
                  <div className="w-48 h-48 bg-[#e5e0d8] animate-pulse rounded-lg" />
                )}

                <p className="mt-4 text-center text-[#2d2d2d]/60 font-hand text-sm">
                  Scanne ce QR code pour rejoindre
                </p>
              </div>

              {/* Code display */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#2d2d2d]/60 mb-2 font-hand">
                  Ou entre ce code
                </label>
                <div
                  className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-[#2d2d2d]"
                  style={{ borderRadius: '15px 225px 15px 255px / 225px 15px 255px 15px' }}
                >
                  <span className="text-3xl font-bold font-sketch tracking-[0.3em] text-[#2d2d2d]">
                    {peerId}
                  </span>
                </div>
              </div>

              {/* Copy link button */}
              <Button
                fullWidth
                onClick={handleCopy}
                variant={copied ? 'secondary' : 'primary'}
                icon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              >
                {copied ? 'Lien copié !' : 'Copier le lien'}
              </Button>

              {/* URL display */}
              <div className="mt-4 p-3 bg-[#e5e0d8]/50 rounded-lg border-2 border-dashed border-[#e5e0d8]">
                <div className="flex items-center gap-2 text-sm text-[#2d2d2d]/60 font-hand">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{joinUrl}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
