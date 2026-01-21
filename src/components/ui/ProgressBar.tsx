import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showCount?: boolean;
  color?: 'indigo' | 'green' | 'blue' | 'pink';
}

const colors = {
  indigo: 'from-indigo-500 to-purple-500',
  green: 'from-emerald-500 to-teal-500',
  blue: 'from-blue-500 to-cyan-500',
  pink: 'from-pink-500 to-rose-500'
};

export function ProgressBar({ 
  current, 
  total, 
  label,
  showCount = true,
  color = 'indigo'
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      {(label || showCount) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showCount && (
            <span className="text-sm font-medium text-white">
              {current} / {total}
            </span>
          )}
        </div>
      )}
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

