#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — vista LEGGIBILE in Markdown.

Genera corpus/DIARIO-RICOSTRUITO.md: le Pagine curate DATATE e di qualità, in ordine
cronologico, ciascuna col suo giorno liturgico e il testo integrale. Markdown = si legge
ovunque (niente HTML da rendere). File privato (gitignorato via corpus/*.md? no → aggiungere).
"""
import json, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "pagine.curate.jsonl")
OUT = os.path.join(CORPUS, "DIARIO-RICOSTRUITO.md")

MIN_Q = 6   # solo Pagine decenti

def main():
    rows = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    dated = [r for r in rows if r["dataRiferimento"] and r["qualita"] >= MIN_Q
             and r["dataConfidence"] in ("alta", "media")]
    by_day = collections.defaultdict(list)
    for r in dated:
        by_day[r["dataRiferimento"]].append(r)

    out = ["# ☩ Diario Ricostruito del Corpus\n",
           f"*Le tue Pagine ritrovate negli export, rimesse in ordine di tempo liturgico. "
           f"{len(dated)} Pagine (qualità ≥ {MIN_Q}, data certa) su {len(by_day)} giornate.*\n",
           "\n---\n"]
    for d in sorted(by_day):
        ps = sorted(by_day[d], key=lambda z: -z["qualita"])
        c = next((x.get("coord") for x in ps if x.get("coord")), None) or {}
        coord = ""
        if c.get("tempoLabel"):
            coord = f"{c['tempoLabel']}"
            if c.get("settimanaRomana"):
                coord += f" · {c['settimanaRomana']}"
            coord += f" · Anno {c.get('cicloDomenicale','?')} · {c.get('colore','')}"
            if c.get("festa"):
                coord += f" · **{c['festa']}**"
            if c.get("centro"):
                coord += f" · _{c['centro']}_"
        out.append(f"\n\n## {d} — {c.get('giornoSettimana','')}\n")
        if coord:
            out.append(f"> {coord}\n")
        for p in ps:
            v = f" · {p['vangelo']}" if p["vangelo"] else ""
            out.append(f"\n<sub>[{p['tipo']} · qualità {p['qualita']}{v} · fonte {p['fonte']}]</sub>\n\n")
            out.append(p["testo"].strip() + "\n\n---\n")

    open(OUT, "w", encoding="utf-8").write("".join(out))
    kb = os.path.getsize(OUT) // 1024
    print(f"DIARIO generato → {OUT} ({kb} KB) · {len(dated)} Pagine · {len(by_day)} giornate")


if __name__ == "__main__":
    main()
