import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { truncate } from '../lib/utils';

interface SaintCardProps {
  nome: string;
  slug: string;
  titolo?: string | null;
  biografiaBreve?: string | null;
  immagineUrl?: string | null;
  dataFesta: string;
  patronoDi?: string[];
}

export default function SaintCard({ 
  nome, 
  slug, 
  titolo, 
  biografiaBreve, 
  immagineUrl,
  dataFesta,
  patronoDi = []
}: SaintCardProps) {
  // Formatta data festa (MM-DD to "DD Mese")
  const [month, day] = dataFesta.split('-');
  const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const dataFestaFormat = `${day} ${mesi[parseInt(month) - 1]}`;

  return (
    <a href={`/santi/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="space-y-3">
          <div className="flex items-start gap-4">
            {immagineUrl && (
              <img 
                src={immagineUrl} 
                alt={nome}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition"
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg group-hover:text-primary transition line-clamp-2">
                {nome}
              </CardTitle>
              {titolo && (
                <p className="text-sm text-muted-foreground mt-1">{titolo}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                📅 Festa: {dataFestaFormat}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {biografiaBreve && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncate(biografiaBreve, 120)}
            </p>
          )}
          
          {patronoDi.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {patronoDi.slice(0, 3).map((patronato, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {patronato}
                </span>
              ))}
              {patronoDi.length > 3 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{patronoDi.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
