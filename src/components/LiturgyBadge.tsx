import { cn } from '../lib/utils';

interface LiturgyBadgeProps {
  colore: 'verde' | 'rosso' | 'bianco' | 'viola' | 'rosa';
  className?: string;
}

const coloriClasses = {
  verde: 'bg-liturgical-verde text-white',
  rosso: 'bg-liturgical-rosso text-white',
  bianco: 'bg-liturgical-bianco text-gray-900 border border-gray-300',
  viola: 'bg-liturgical-viola text-white',
  rosa: 'bg-liturgical-rosa text-white'
};

const coloriNomi = {
  verde: 'Verde',
  rosso: 'Rosso',
  bianco: 'Bianco',
  viola: 'Viola',
  rosa: 'Rosa'
};

export default function LiturgyBadge({ colore, className }: LiturgyBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
        coloriClasses[colore],
        className
      )}
    >
      {coloriNomi[colore]}
    </span>
  );
}
