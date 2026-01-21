import { getAvatarColor } from '../../lib/utils';

interface AvatarProps {
  name: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl'
};

export function Avatar({ name, index = 0, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const color = getAvatarColor(index);

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center
        font-bold text-white
        border-2 border-gray-700
        shadow-[2px_2px_0_rgba(0,0,0,0.2)]
        font-hand
        ${className}
      `}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

