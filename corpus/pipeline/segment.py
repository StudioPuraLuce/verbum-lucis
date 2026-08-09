#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 1, passo 2: SEGMENT.

Dai frammenti (corpus/raw/fragments.jsonl) taglia le PAGINE — l'unità-giornata del
corpus: la Pagina Sacra / meditazione / preghiera / cammino di un dato giorno.

Confini di segmento dentro i thread lunghi: header markdown o riga in grassetto che
contengono un giorno+data italiana, un nome liturgico, o un marcatore
("DIARIO DEL TEMPIO", "PAGINA SACRA", "Il Vangelo oggi").

Per ogni Pagina estrae: dataRiferimento (→ISO), dataConfidence, vangelo, titolo,
tipo, testo, nChar, id. Output: corpus/pagine.jsonl.
"""
import json, os, re, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "raw", "fragments.jsonl")
OUT = os.path.join(CORPUS, "pagine.jsonl")

MESI = {"gennaio":1,"febbraio":2,"marzo":3,"aprile":4,"maggio":5,"giugno":6,"luglio":7,
        "agosto":8,"settembre":9,"ottobre":10,"novembre":11,"dicembre":12}
MESI_RE = "|".join(MESI)
GIORNI_LIT = (r"luned[ìi]|marted[ìi]|mercoled[ìi]|gioved[ìi]|venerd[ìi]|sabato|domenica")

DATE_IT   = re.compile(rf"\b([1-3]?\d)\s+({MESI_RE})\s+(20\d\d)\b", re.I)
DATE_NUM  = re.compile(r"\b([0-3]?\d)[/.\-]([01]?\d)[/.\-](20\d\d)\b")
DATE_ISO  = re.compile(r"\b(20\d\d)-([01]\d)-([0-3]\d)\b")

# Riferimento evangelico/biblico "Gv 6,35-40", "Mt 13,1-23", "Lc 24,13"
BIBREF = re.compile(r"\b(Gv|Mt|Mc|Lc|At|Rm|Sal|Ap|Is|Ct|Fil|Ef|Col|Eb|Gal|Cor|Pt|Gc|Fm|Tm)\s?"
                    r"(\d{1,3})[,\.\s](\d{1,3})(?:\s?[-–]\s?(\d{1,3}))?", re.I)
VANGELI = {"gv","mt","mc","lc"}

# Un confine di Pagina: riga-header (#..., **...**, o MAIUSCOLO) con data o marcatore liturgico
MARK = re.compile(rf"(diario del tempio|pagina sacra|il vangelo\s+(di\s+)?oggi|"
                  rf"({GIORNI_LIT})\b|lunedì dell'angelo|domenica di|settimana di)", re.I)

DEVOZ = re.compile(r"\b(Cristo|Signore|Gesù|Spirito|Padre|Regno|preghiera|cuore|anima|"
    r"silenzio|luce|fuoco|grazia|risorto|presenza|offr|contempl|medita|vangelo|amen|"
    r"benedizione|carne|croce|sacro|liturg)\b", re.I)

# META/business: contenuto operativo o istruzioni all'AI, NON testimonianza. Se compare
# nelle prime righe (o è denso), la Pagina è scartata.
META_OPEN = re.compile(r"^\s*(voglio\s+creare|crea\s+(una|un|la|il)|puoi\s+(creare|farmi|"
    r"generare)|ecco\s+(una|un|il|la|8|le)\s|ti\s+ho\s+fornito|certo[!,]|perfetto[.,!]|"
    r"ottimo[.,!]|ecco\s+qua|prepariamo|posso\s+ora\s+offrirti|ecco\s+un\s+elenco)", re.I)
META_BIZ = re.compile(r"\b(gohighlevel|manychat|carosell[io]|instagram|dataset|landing page|"
    r"funnel|ecosistema automatizzat|app chiamata|puraluce\.it|studio pura luce|"
    r"tabella (ripulita|con i post)|rimuovi (nomi|duplicati)|kdp|brand kit|"
    r"scheda prodotto|preventivo|template editoriale)\b", re.I)


def sha(*p):
    return hashlib.sha1("\x1f".join(str(x) for x in p).encode()).hexdigest()[:16]


# Coda conversazionale di ChatGPT da rimuovere (offerte di follow-up, non testimonianza)
TAIL = re.compile(r"^\s*(men[uù]\s*:?$|vuoi\b|fammi sapere|se vuoi[,\s]|dimmi (tu|se|quale|pure)|"
    r"posso (ora |anche |subito |gi[àa] )?(prepararti|offrirti|generare|creare|darti|mostrarti|comporre)|"
    r"ti va (se|di)|procediamo|vuoi che|desideri (che|un|una)|preferisci)", re.I)


def strip_tail(text):
    """Taglia il blocco-offerta finale (Menu / «Vuoi…» numerati) tipico degli export ChatGPT."""
    lines = text.rstrip().split("\n")
    n = len(lines)
    cut = None
    for i in range(n - 1, max(0, n - 14) - 1, -1):
        if TAIL.match(lines[i].strip()):
            cut = i
    if cut is None:
        return text
    k = cut
    while k - 1 >= 0:
        s = lines[k - 1].strip()
        if s == "" or s in ("---", "—", "–") or re.match(r"^\d+[\.\)]", s) or TAIL.match(s):
            k -= 1
        else:
            break
    while k > 0 and lines[k - 1].strip() in ("", "---", "—", "–"):
        k -= 1
    cleaned = "\n".join(lines[:k]).rstrip()
    return cleaned if len(cleaned) >= 200 else text


def parse_date(text):
    """Ritorna (iso, confidence) cercando una data esplicita nel testo (prime righe pesano di più)."""
    head = text[:500]
    for scope, conf in ((head, "alta"), (text, "media")):
        m = DATE_IT.search(scope)
        if m:
            d, mon, y = int(m.group(1)), MESI[m.group(2).lower()], int(m.group(3))
            try:
                return f"{y:04d}-{mon:02d}-{d:02d}", conf
            except Exception:
                pass
        m = DATE_ISO.search(scope)
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}", conf
        m = DATE_NUM.search(scope)
        if m:
            d, mon, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= mon <= 12 and 1 <= d <= 31:
                return f"{y:04d}-{mon:02d}-{d:02d}", conf
    return None, None


def first_bibref(text):
    m = BIBREF.search(text)
    if not m:
        return None, False
    book = m.group(1).capitalize()
    ref = f"{book} {m.group(2)},{m.group(3)}"
    if m.group(4):
        ref += f"-{m.group(4)}"
    return ref, book.lower() in VANGELI


def classify(title, text):
    t = (title + " " + text[:600]).lower()
    if "lectio" in t:
        return "lectio"
    if re.search(r"\b(orbita|orbite|ottava operativa|settimana di pasqua|cammino pasquale|"
                 r"da pentecoste a cristo re|germoglio)\b", t):
        return "cammino"
    if re.search(r"\b(idrogen|legge del tre|legge del sette|quarta via|gurdjieff|"
                 r"centro intellettuale|centro emozionale|centro motorio|tetramorfo)\b", t):
        return "dottrina"
    if "diario del tempio" in t:
        return "diario"
    if re.search(r"\b(preghiera|litania|rosario|novena|ti prego|padre nostro|ave maria)\b", t) \
            and "vangelo" not in t:
        return "preghiera"
    # Pagina Sacra: Vangelo + applicazione ("Tu oggi", "oggi...")
    if first_bibref(text)[0] and re.search(r"\b(tu oggi|oggi[:\s]|il re oggi|vangelo)\b", t):
        return "pagina-sacra"
    return "nota"


def title_of(chunk):
    for line in chunk.splitlines():
        s = line.strip().lstrip("#").strip().strip("*_").strip()
        s = re.sub(r"[☩✦✝️🕯️🔥📿⚙️🧠✨🗂️👣🍞🌱🕊️]", "", s).strip()
        if len(s) >= 4:
            return s[:90]
    return "(senza titolo)"


def split_pages(text):
    """Spezza un frammento lungo in chunk ai confini di Pagina; se non ce ne sono, un solo chunk."""
    lines = text.splitlines(keepends=True)
    boundaries = [0]
    for i, ln in enumerate(lines):
        if i == 0:
            continue
        stripped = ln.strip()
        is_header = stripped.startswith("#") or (stripped.startswith("**") and stripped.endswith("**"))
        looks_dated = bool(DATE_IT.search(stripped) or DATE_ISO.search(stripped))
        if (is_header and (MARK.search(stripped) or looks_dated)) or \
           (looks_dated and len(stripped) < 80):
            boundaries.append(i)
    boundaries = sorted(set(boundaries))
    if len(boundaries) <= 1:
        return [text]
    chunks = []
    for a, b in zip(boundaries, boundaries[1:] + [len(lines)]):
        chunks.append("".join(lines[a:b]))
    return chunks


def main():
    pages = []
    seen = set()
    with open(INP, encoding="utf-8") as fh:
        for line in fh:
            frag = json.loads(line)
            text = frag["text"]
            # Obsidian/Gemini doc = già un'unità; ChatGPT assistant = potenzialmente multi-giorno
            chunks = split_pages(text) if frag["fonte"] == "chatgpt" else [text]
            for chunk in chunks:
                chunk = strip_tail(chunk.strip())
                nchar = len(chunk)
                if nchar < 300:
                    continue
                if len(DEVOZ.findall(chunk)) < 3:
                    continue
                # scarta META/business (istruzioni all'AI, marketing, tabelle operative)
                if META_OPEN.search(chunk[:120]) or len(META_BIZ.findall(chunk)) >= 2:
                    continue
                vangelo, is_gospel = first_bibref(chunk)
                tipo = classify(title_of(chunk), chunk)
                # tieni solo Pagine con senso di corpus: rif. evangelico, o cammino/dottrina/preghiera
                if not vangelo and tipo == "nota":
                    continue
                data_iso, conf = parse_date(chunk)
                if not data_iso:
                    data_iso, conf = frag.get("create_iso"), "bassa"
                pid = sha(frag["fonte"], frag["thread_id"], chunk[:120])
                if pid in seen:
                    continue
                seen.add(pid)
                pages.append({
                    "id": pid,
                    "fonte": frag["fonte"], "thread": frag["thread"], "thread_id": frag["thread_id"],
                    "createIso": frag.get("create_iso"),
                    "dataRiferimento": data_iso, "dataConfidence": conf,
                    "vangelo": vangelo, "titolo": title_of(chunk), "tipo": tipo,
                    "nChar": nchar, "testo": chunk,
                })

    with open(OUT, "w", encoding="utf-8") as fh:
        for p in pages:
            fh.write(json.dumps(p, ensure_ascii=False) + "\n")

    # Report
    import collections
    by_tipo = collections.Counter(p["tipo"] for p in pages)
    by_conf = collections.Counter(p["dataConfidence"] for p in pages)
    by_fonte = collections.Counter(p["fonte"] for p in pages)
    dated_alta = sum(1 for p in pages if p["dataConfidence"] == "alta")
    print("SEGMENT completato →", OUT)
    print(f"  PAGINE totali: {len(pages)}")
    print(f"  per fonte:   {dict(by_fonte)}")
    print(f"  per tipo:    {dict(by_tipo)}")
    print(f"  per data-confidence: {dict(by_conf)}  (date esplicite 'alta': {dated_alta})")


if __name__ == "__main__":
    main()
