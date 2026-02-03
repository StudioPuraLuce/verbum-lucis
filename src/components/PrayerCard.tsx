import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { truncate } from '../lib/utils';

interface PrayerCardProps {
  titolo: string;
  slug: string;
  testo: string;
  categoria: string;
  durata?: number | null;
  fonteUfficiale?: boolean | null;
  occasione?: string | null;
}

const categorieIcone: Record<string, string> = {
  'fondamentale': '🙏',
  'mariana': '👸',
  'rosario': '📿',
  'novena': '🕯️',
  'mattino': '🌅',
  'sera': '🌙',
  'protezione': '🛡️',
  'litania': '📖',
  'angelo custode': '👼'
};

export default function PrayerCard({ 
  titolo, 
  slug, 
  testo,
  categoria,
  durata,
  fonteUfficiale,
  occasione
}: PrayerCardProps) {
  const icona = categorieIcone[categoria] || '🙏';

  return (
    <a href={`/preghiere/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icona}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {categoria}
              </span>
            </div>
            {fonteUfficiale && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-xs">
                ✓ Ufficiale
              </span>
            )}
          </div>
          
          <CardTitle className="group-hover:text-primary transition line-clamp-2">
            {titolo}
          </CardTitle>
          
          {occasione && (
            <CardDescription className="capitalize">
              Per: {occasione}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncate(testo, 120)}
          </p>
          
          {durata && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⏱️</span>
              <span>{durata} {durata === 1 ? 'minuto' : 'minuti'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
