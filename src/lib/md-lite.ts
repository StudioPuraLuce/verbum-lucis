/**
 * md-lite — un convertitore Markdown→HTML minimale e SICURO per rendere le Pagine reali
 * del corpus (testo scritto a mano, con **grassetto**, ### titoli, > citazioni, --- righe).
 *
 * Ordine corretto: si riconosce il tipo di riga sul testo GREZZO (così ">" e "#" non vengono
 * già trasformati in entità), poi si fa escaping del contenuto e infine il grassetto/corsivo.
 * Nessuna dipendenza esterna, nessuna iniezione HTML possibile.
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Applica grassetto/corsivo su testo GIÀ escapato (non tocca i <br> inseriti). */
function emphasis(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>');
}

export function mdLite(raw: string): string {
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];   // contenuti GIÀ escapati
  let quote: string[] = [];

  const flushPara = () => {
    if (para.length) { out.push('<p>' + emphasis(para.join('<br>')) + '</p>'); para = []; }
  };
  const flushQuote = () => {
    if (quote.length) { out.push('<blockquote>' + emphasis(quote.join('<br>')) + '</blockquote>'); quote = []; }
  };

  for (const line of lines) {
    const t = line.trim();
    if (t === '') { flushPara(); flushQuote(); continue; }
    if (/^#{1,6}\s/.test(t)) {
      flushPara(); flushQuote();
      const level = (t.match(/^#+/) as RegExpMatchArray)[0].length;
      const tag = level <= 2 ? 'h3' : 'h4';
      out.push(`<${tag}>` + emphasis(escapeHtml(t.replace(/^#+\s+/, ''))) + `</${tag}>`);
      continue;
    }
    if (/^([*_-]\s*){3,}$/.test(t) || /^[—–]{1,}$/.test(t) || t === '---') {
      flushPara(); flushQuote(); out.push('<hr>');
      continue;
    }
    if (/^>\s?/.test(t)) { flushPara(); quote.push(escapeHtml(t.replace(/^>\s?/, ''))); continue; }
    flushQuote(); para.push(escapeHtml(t));
  }
  flushPara(); flushQuote();
  return out.join('\n');
}
