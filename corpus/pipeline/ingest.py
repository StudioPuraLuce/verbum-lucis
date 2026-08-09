#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 1, passo 1: INGEST.

Parsa tutte le fonti (ChatGPT export, vault Obsidian, documenti Gemini Canvas) in un
formato unico di *frammenti* e li scrive in corpus/raw/fragments.jsonl.

Un frammento = un blocco di testo con provenienza:
  { fonte, thread, thread_id, create_iso, role, text }

Filtra il rumore tecnico/commerciale via denylist (non è corpus spirituale).
NON genera nulla: estrae solo testo già scritto dall'utente.
"""
import json, glob, os, re, datetime, hashlib, sys

HOME = os.path.expanduser("~")
GPT_DIR = f"{HOME}/Work/_archive/DatiGPT_exported"
GEMINI_DIR = f"{HOME}/Work/_archive/Dati_GEMINI_exported"
NOTE_DIR = f"{HOME}/Note"

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)               # .../verbum-lucis/corpus
RAW = os.path.join(CORPUS, "raw")
OUT = os.path.join(RAW, "fragments.jsonl")

# ── Denylist: rumore tecnico/commerciale, NON corpus ──
NOISE = re.compile(r"\b(wrangler|cloudflare|npm install|prisma|SELECT \*|<div |</div>|"
    r"function\s*\(|=>\s*\{|console\.log|partita iva|forfettario|fattura|preventivo|"
    r"ade\b|codice ateco|regime forfettario|marketplace subito|shineon|cricut|"
    r"def main|import pandas|pip install)\b", re.I)
# Percorsi Obsidian da escludere (commerciale / strutturale / sistema)
NOTE_DENY = re.compile(r"(/\.trash/|/\.obsidian/|/\.makemd/|/\.smart-|/\.space/|/\.claudian/|"
    r"/Projects/|/Soliwkr/|/PuraLuce\.it|/Fedele Messaggero/|/OFFERTA|/COLLEZIONE|"
    r"/OFFERTA B2B|Landing Page|Kit 0|Pacchetto 0|/archive/|/PeriodicNotes/)", re.I)

def sha(*parts):
    return hashlib.sha1("\x1f".join(str(p) for p in parts).encode()).hexdigest()[:16]

def epoch_to_iso(ct):
    if not ct:
        return None
    return datetime.datetime.fromtimestamp(float(ct), datetime.UTC).strftime("%Y-%m-%d")

def is_noise(text):
    return len(NOISE.findall(text)) >= 2

def emit(fh, frag):
    fh.write(json.dumps(frag, ensure_ascii=False) + "\n")

# ── 1. ChatGPT ──
def ingest_chatgpt(fh):
    n = 0
    for f in sorted(glob.glob(f"{GPT_DIR}/conversations-*.json")):
        for conv in json.load(open(f, encoding="utf-8")):
            title = (conv.get("title") or "").strip()
            tid = conv.get("conversation_id") or conv.get("id") or sha(title)
            create_iso = epoch_to_iso(conv.get("create_time"))
            for node in (conv.get("mapping") or {}).values():
                m = node.get("message")
                if not m:
                    continue
                c = m.get("content") or {}
                if c.get("content_type") != "text":
                    continue
                role = (m.get("author") or {}).get("role", "?")
                # ordinamento temporale del messaggio dentro il thread
                mct = epoch_to_iso(m.get("create_time")) or create_iso
                for p in (c.get("parts") or []):
                    if not isinstance(p, str):
                        continue
                    p = p.strip()
                    if len(p) < 40 or is_noise(p):
                        continue
                    emit(fh, {
                        "id": sha("gpt", tid, role, p[:80]),
                        "fonte": "chatgpt", "thread": title, "thread_id": tid,
                        "create_iso": mct, "role": role, "text": p,
                    })
                    n += 1
    return n

# ── 2. Obsidian ──
def ingest_obsidian(fh):
    n = 0
    for path in glob.glob(f"{NOTE_DIR}/**/*.md", recursive=True):
        rel = os.path.relpath(path, NOTE_DIR)
        if NOTE_DENY.search("/" + rel):   # match sul path RELATIVO (l'assoluto contiene "soliwkr")
            continue
        try:
            text = open(path, encoding="utf-8").read().strip()
        except Exception:
            continue
        if len(text) < 60 or is_noise(text):
            continue
        # data dal filename se presente (es. "2025-05-26.md" o "22 Maggio 2025 - Gv...")
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(path), datetime.UTC).strftime("%Y-%m-%d")
        emit(fh, {
            "id": sha("obs", rel),
            "fonte": "obsidian", "thread": os.path.basename(path)[:-3], "thread_id": rel,
            "create_iso": mtime, "role": "user", "text": text,
        })
        n += 1
    return n

# ── 3. Gemini text docs (Canvas UTF-8, no audio/img/zip) ──
def ingest_gemini(fh):
    n = 0
    for path in glob.glob(f"{GEMINI_DIR}/*"):
        if not os.path.isfile(path):
            continue
        low = path.lower()
        if low.endswith((".wav", ".jpg", ".jpeg", ".png", ".mp4", ".mov", ".zip", ".mp3")):
            continue
        try:
            with open(path, "rb") as b:
                head = b.read(4)
            if head[:1] == b"\x00" or head[:2] in (b"PK", b"\xff\xd8"):  # binari
                continue
            text = open(path, encoding="utf-8", errors="strict").read().strip()
        except Exception:
            continue
        if len(text) < 80 or is_noise(text):
            continue
        name = os.path.basename(path)
        emit(fh, {
            "id": sha("gem", name),
            "fonte": "gemini-doc", "thread": name, "thread_id": name,
            "create_iso": None, "role": "assistant", "text": text,
        })
        n += 1
    return n

def main():
    os.makedirs(RAW, exist_ok=True)
    counts = {}
    with open(OUT, "w", encoding="utf-8") as fh:
        counts["chatgpt"] = ingest_chatgpt(fh)
        counts["obsidian"] = ingest_obsidian(fh)
        counts["gemini-doc"] = ingest_gemini(fh)
    total = sum(counts.values())
    print("INGEST completato →", OUT)
    for k, v in counts.items():
        print(f"  {k:<12} {v:>6} frammenti")
    print(f"  {'TOTALE':<12} {total:>6}")

if __name__ == "__main__":
    main()
