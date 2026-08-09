#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 3, passo 1: CURATELA (dedup + qualità).

Dalle 1085 Pagine (pagine.enriched.jsonl) produce l'insieme CURATO: una Pagina migliore
per cluster, con punteggio di qualità e le varianti collegate.

- Dedup: blocking per (giorno) e (Vangelo-base) + similarità Jaccard su shingle di parole
  + catene `evolve_da` (già nel grafo) → cluster di versioni della stessa Pagina.
- Qualità: premia struttura devozionale (Vangelo + applicazione + intestazioni + lunghezza
  giusta + data certa), penalizza aperture conversazionali, META/SQL, brevità.
- Output: corpus/pagine.curate.jsonl (i rappresentanti) + statistiche.
"""
import json, os, re, collections

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "pagine.enriched.jsonl")
OUT = os.path.join(CORPUS, "pagine.curate.jsonl")

WORD = re.compile(r"[a-zàèéìòùA-ZÀÈÉÌÒÙ]{3,}")
GOSPEL_APP = re.compile(r"\b(tu oggi|oggi[:\s]|il re oggi|gesto|porta nel corpo|questa settimana)\b", re.I)
CONV_OPEN = re.compile(r"^\s*(ah[…\.]|s[iì][\.,]|perfetto|certo|ecco|ottimo|grazie|"
    r"posso|abbiamo il|ora comincia|ho letto|ho aggiornato|va bene)\b", re.I)
JUNK = re.compile(r"(INSERT INTO|VALUES\s*\(|```|'20\d\d-\d\d-\d\d'|CREATE TABLE|json_extract|"
    r"\|\s*-{2,}\s*\||SELECT )", re.I)
HEADER = re.compile(r"^\s{0,3}#{1,4}\s", re.M)
QUOTE = re.compile(r"^\s{0,3}>", re.M)


def norm_words(text):
    return [w.lower() for w in WORD.findall(text)]


def shingles(words, k=5):
    return set(tuple(words[i:i + k]) for i in range(max(0, len(words) - k + 1)))


def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / (len(a) + len(b) - inter)


def quality(p):
    t = p["testo"]
    n = p["nChar"]
    s = 0.0
    if p["vangelo"]:
        s += 3
    if GOSPEL_APP.search(t):
        s += 2
    s += min(3, len(HEADER.findall(t)))         # struttura a sezioni
    s += min(2, len(QUOTE.findall(t)))          # citazioni del Vangelo
    if 800 <= n <= 4000:
        s += 3
    elif 400 <= n < 800 or 4000 < n <= 8000:
        s += 1
    if p["tipo"] in ("pagina-sacra", "lectio", "diario", "cammino"):
        s += 1
    if p["dataConfidence"] == "alta":
        s += 2
    elif p["dataConfidence"] == "media":
        s += 1
    # penalità
    if CONV_OPEN.search(t[:60]):
        s -= 3
    s -= 2 * min(3, len(JUNK.findall(t)))
    if n < 400:
        s -= 2
    return round(s, 1)


class UF:
    def __init__(self):
        self.p = {}
    def find(self, x):
        self.p.setdefault(x, x)
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[ra] = rb


def main():
    pages = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    idx = {p["id"]: p for p in pages}
    for p in pages:
        p["_sh"] = shingles(norm_words(p["testo"]))
        p["_q"] = quality(p)

    uf = UF()
    for p in pages:
        uf.find(p["id"])

    # Blocking: stesso giorno-ancorato, oppure stesso Vangelo-base
    blocks = collections.defaultdict(list)
    for p in pages:
        if p["dataRiferimento"] and p["dataConfidence"] in ("alta", "media"):
            blocks[("g", p["dataRiferimento"])].append(p)
        if p["vangelo"]:
            base = re.match(r"[A-Za-z]+\s?\d{1,3}", p["vangelo"])
            if base:
                blocks[("v", base.group(0))].append(p)

    SIM = 0.55
    pair_seen = set()
    for key, grp in blocks.items():
        if len(grp) > 400:       # blocco troppo grande (es. Vangelo comune): salta il full O(n^2)
            continue
        for i in range(len(grp)):
            for j in range(i + 1, len(grp)):
                a, b = grp[i], grp[j]
                pk = (a["id"], b["id"]) if a["id"] < b["id"] else (b["id"], a["id"])
                if pk in pair_seen:
                    continue
                pair_seen.add(pk)
                if jaccard(a["_sh"], b["_sh"]) >= SIM:
                    uf.union(a["id"], b["id"])

    # Merge catene evolve_da dal grafo (se presente)
    archi_path = os.path.join(CORPUS, "archi.jsonl")
    if os.path.exists(archi_path):
        for line in open(archi_path, encoding="utf-8"):
            a = json.loads(line)
            if a["rel"] == "evolve_da":
                s = a["src"].replace("pagina:", "")
                d = a["dst"].replace("pagina:", "")
                if s in idx and d in idx:
                    uf.union(s, d)

    # Cluster → scegli il rappresentante (qualità, poi ampiezza)
    clusters = collections.defaultdict(list)
    for p in pages:
        clusters[uf.find(p["id"])].append(p)

    curated = []
    for members in clusters.values():
        members.sort(key=lambda z: (-z["_q"], -z["nChar"]))
        best = members[0]
        varianti = [m["id"] for m in members[1:]]
        rec = {k: best[k] for k in ("id", "fonte", "thread", "thread_id", "createIso",
               "dataRiferimento", "dataConfidence", "vangelo", "titolo", "tipo", "nChar",
               "testo", "coord")}
        rec["qualita"] = best["_q"]
        rec["nVarianti"] = len(varianti)
        rec["varianti"] = varianti
        curated.append(rec)

    curated.sort(key=lambda z: (-z["qualita"], z["dataRiferimento"] or "9999"))

    with open(OUT, "w", encoding="utf-8") as fh:
        for r in curated:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    # Report
    by_tipo = collections.Counter(r["tipo"] for r in curated)
    dedup = len(pages) - len(curated)
    hiq = sum(1 for r in curated if r["qualita"] >= 8)
    midq = sum(1 for r in curated if 5 <= r["qualita"] < 8)
    print("CURATELA completata →", OUT)
    print(f"  Pagine grezze: {len(pages)}  →  cluster/curate: {len(curated)}  "
          f"(dedup: -{dedup}, {dedup*100//len(pages)}%)")
    print(f"  qualità:  alta(≥8): {hiq}   media(5–8): {midq}   bassa(<5): {len(curated)-hiq-midq}")
    print(f"  per tipo: {dict(by_tipo)}")
    print("  Top 8 per qualità:")
    for r in curated[:8]:
        v = r["vangelo"] or "—"
        print(f"    [{r['qualita']:>4}] {r['dataRiferimento'] or '?'} · {r['tipo']:<12} · {v:<12} · {r['titolo'][:44]}")


if __name__ == "__main__":
    main()
