#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 2: GRAFO DI CONOSCENZA.

Da corpus/pagine.enriched.jsonl costruisce il grafo (schema in GRAFO-SCHEMA.md):
nodi (Pagina · Giorno · Vangelo · Centro · Cammino · Tempo/Festa · Concetto) e archi
(letta_il · cita · risveglia · parte_di · nel_tempo · evolve_da · tonalità · appartiene_a).

Persistenza: corpus/graph.sqlite (tabelle `nodi`, `archi`) + export nodi.jsonl / archi.jsonl.
"""
import json, os, re, sqlite3, collections, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "pagine.enriched.jsonl")
DB = os.path.join(CORPUS, "graph.sqlite")
NODI_OUT = os.path.join(CORPUS, "nodi.jsonl")
ARCHI_OUT = os.path.join(CORPUS, "archi.jsonl")

TETRAMORFO = {"A": ("Matteo", "mente"), "B": ("Marco", "corpo"), "C": ("Luca", "cuore")}

CAMMINI = [
    (re.compile(r"cammino pasquale|orbite del germoglio|settimana di pasqua", re.I), "Cammino Pasquale Vivente"),
    (re.compile(r"orbite della luce", re.I), "Orbite della Luce"),
    (re.compile(r"ottava operativa|calendario dell'ottava", re.I), "Ottava Operativa"),
    (re.compile(r"da pentecoste a cristo re|24 settimane|forgiatura interiore", re.I), "Da Pentecoste a Cristo Re"),
    (re.compile(r"veni creator", re.I), "Veni Creator Spiritus"),
    (re.compile(r"via crucis|cammino quaresimale", re.I), "Via Crucis"),
]

# Concetti dello strato di profondità (dottrina)
CONCETTI = [
    (re.compile(r"\bH\s?(\d{1,3})\b"), lambda m: (f"idrogeno-h{m.group(1)}", f"Idrogeno H{m.group(1)}")),
    (re.compile(r"legge del tre|legge del 3|santa trinit.*forza", re.I), lambda m: ("legge-del-tre", "Legge del Tre")),
    (re.compile(r"legge del sette|legge del 7|ottava\b", re.I), lambda m: ("legge-del-sette", "Legge del Sette (Ottava)")),
    (re.compile(r"tetramorfo|quattro vangeli|4 vangeli", re.I), lambda m: ("tetramorfo", "Tetramorfo (4 Vangeli / 4 centri)")),
    (re.compile(r"quarta via|gurdjieff", re.I), lambda m: ("quarta-via", "Quarta Via")),
    (re.compile(r"athanor|otre nuovo", re.I), lambda m: ("athanor", "Athanor (corpo/Otre Nuovo)")),
    (re.compile(r"ottagono|otto direzioni|8 direzioni", re.I), lambda m: ("ottagono", "Ottagono (8 organi)")),
    (re.compile(r"i dodici|dammi i dodici|dodici apostoli", re.I), lambda m: ("dodici", "I Dodici (4 centri × 3 forze)")),
    (re.compile(r"ricordo di s[eé]", re.I), lambda m: ("ricordo-di-se", "Ricordo di Sé")),
]


def load():
    with open(INP, encoding="utf-8") as fh:
        return [json.loads(l) for l in fh if l.strip()]


def cammino_of(p):
    hay = (p["titolo"] + " " + p["thread"] + " " + p["testo"][:400])
    for rx, name in CAMMINI:
        if rx.search(hay):
            return name
    return None


def concetti_of(p):
    if p["tipo"] not in ("dottrina", "cammino", "lectio"):
        return []
    hay = p["titolo"] + " " + p["testo"][:1200]
    found = {}
    for rx, fn in CONCETTI:
        for m in rx.finditer(hay):
            cid, label = fn(m)
            found[cid] = label
    return list(found.items())


def main():
    pages = load()
    nodi = {}   # id -> {tipo, label, attrs}
    archi = []  # (src, rel, dst, attrs)

    def add_node(nid, tipo, label, **attrs):
        if nid not in nodi:
            nodi[nid] = {"id": nid, "tipo": tipo, "label": label, "attrs": attrs}
        return nid

    def add_edge(src, rel, dst, **attrs):
        archi.append({"src": src, "rel": rel, "dst": dst, "attrs": attrs})

    # 6 tempi come nodi base
    COLORI = {"avvento": "viola", "natale": "bianco", "ordinario": "verde",
              "quaresima": "viola", "triduo": "rosso", "pasqua": "bianco"}
    for t, col in COLORI.items():
        add_node(f"tempo:{t}", "tempo", t.capitalize(), colore=col)

    for p in pages:
        pid = f"pagina:{p['id']}"
        c = p.get("coord") or {}
        add_node(pid, "pagina", p["titolo"], ptipo=p["tipo"], data=p["dataRiferimento"],
                 dataConfidence=p["dataConfidence"], vangelo=p["vangelo"], fonte=p["fonte"],
                 thread=p["thread"], nChar=p["nChar"],
                 tempo=c.get("tempo"), colore=c.get("colore"),
                 ciclo=c.get("cicloDomenicale"), settimana=c.get("settimanaRomana"),
                 centro=c.get("centro"), festa=c.get("festa"),
                 fraction=c.get("fractionOfYear"))

        # letta_il → Giorno
        if p["dataRiferimento"] and c:
            gid = f"giorno:{p['dataRiferimento']}"
            add_node(gid, "giorno", p["dataRiferimento"],
                     tempo=c.get("tempo"), colore=c.get("colore"),
                     ciclo=c.get("cicloDomenicale"), feriale=c.get("cicloFeriale"),
                     settimana=c.get("settimanaRomana"), giorno=c.get("giornoSettimana"),
                     centro=c.get("centro"), lavoro=c.get("lavoro"), festa=c.get("festa"),
                     annoLiturgico=c.get("annoLiturgico"), fraction=c.get("fractionOfYear"))
            add_edge(pid, "letta_il", gid)
            # Giorno → Tempo/Festa
            if c.get("tempo"):
                add_edge(gid, "appartiene_a", f"tempo:{c['tempo']}")
            if c.get("festa"):
                fid = add_node(f"festa:{c['festa']}", "festa", c["festa"])
                add_edge(gid, "appartiene_a", fid)

        # cita → Vangelo
        if p["vangelo"]:
            vid = f"vangelo:{p['vangelo']}"
            base = re.match(r"[A-Za-z]+\s?\d{1,3}", p["vangelo"])
            add_node(vid, "vangelo", p["vangelo"], base=base.group(0) if base else p["vangelo"])
            add_edge(pid, "cita", vid)
            # tonalità del Vangelo secondo il ciclo del giorno
            if c.get("cicloDomenicale") in TETRAMORFO:
                ev, centro_t = TETRAMORFO[c["cicloDomenicale"]]
                cnid = add_node("tetramorfo", "concetto", "Tetramorfo (4 Vangeli / 4 centri)")
                add_edge(vid, "tonalita", cnid, evangelista=ev, centro=centro_t, ciclo=c["cicloDomenicale"])

        # risveglia → Centro
        if c.get("centro"):
            cid = f"centro:{c['centro']}"
            add_node(cid, "centro", c["centro"], lavoro=c.get("lavoro"), tempo=c.get("tempo"))
            add_edge(pid, "risveglia", cid)
            if c.get("tempo"):
                add_edge(cid, "appartiene_a", f"tempo:{c['tempo']}")

        # parte_di → Cammino
        cam = cammino_of(p)
        if cam:
            camid = f"cammino:{cam}"
            add_node(camid, "cammino", cam)
            add_edge(pid, "parte_di", camid)

        # sottende ← Concetto (dottrina)
        for cid_slug, label in concetti_of(p):
            cnid = add_node(f"concetto:{cid_slug}", "concetto", label)
            add_edge(cnid, "sottende", pid)

    # evolve_da: lineage strutturale entro lo stesso giorno + stesso tipo
    by_day_tipo = collections.defaultdict(list)
    for p in pages:
        if p["dataRiferimento"] and p["dataConfidence"] in ("alta", "media"):
            by_day_tipo[(p["dataRiferimento"], p["tipo"])].append(p)
    n_evolve = 0
    for key, group in by_day_tipo.items():
        if len(group) < 2:
            continue
        group.sort(key=lambda z: (z.get("createIso") or "", -z["nChar"]))
        for prev, cur in zip(group, group[1:]):
            add_edge(f"pagina:{cur['id']}", "evolve_da", f"pagina:{prev['id']}")
            n_evolve += 1

    # ── Persistenza SQLite ──
    if os.path.exists(DB):
        os.remove(DB)
    con = sqlite3.connect(DB)
    con.execute("CREATE TABLE nodi (id TEXT PRIMARY KEY, tipo TEXT, label TEXT, attrs TEXT)")
    con.execute("CREATE TABLE archi (src TEXT, rel TEXT, dst TEXT, attrs TEXT)")
    con.execute("CREATE INDEX idx_nodi_tipo ON nodi(tipo)")
    con.execute("CREATE INDEX idx_archi_src ON archi(src)")
    con.execute("CREATE INDEX idx_archi_dst ON archi(dst)")
    con.execute("CREATE INDEX idx_archi_rel ON archi(rel)")
    con.executemany("INSERT OR IGNORE INTO nodi VALUES (?,?,?,?)",
                    [(n["id"], n["tipo"], n["label"], json.dumps(n["attrs"], ensure_ascii=False))
                     for n in nodi.values()])
    con.executemany("INSERT INTO archi VALUES (?,?,?,?)",
                    [(a["src"], a["rel"], a["dst"], json.dumps(a["attrs"], ensure_ascii=False))
                     for a in archi])
    con.commit()
    con.close()

    with open(NODI_OUT, "w", encoding="utf-8") as fh:
        for n in nodi.values():
            fh.write(json.dumps(n, ensure_ascii=False) + "\n")
    with open(ARCHI_OUT, "w", encoding="utf-8") as fh:
        for a in archi:
            fh.write(json.dumps(a, ensure_ascii=False) + "\n")

    # ── Report ──
    by_tipo = collections.Counter(n["tipo"] for n in nodi.values())
    by_rel = collections.Counter(a["rel"] for a in archi)
    print("GRAFO costruito →", DB)
    print(f"  NODI: {len(nodi)}   ARCHI: {len(archi)}")
    print("  nodi per tipo: ", dict(by_tipo))
    print("  archi per relazione: ", dict(by_rel))
    print(f"  lineage evolve_da: {n_evolve}")


if __name__ == "__main__":
    main()
