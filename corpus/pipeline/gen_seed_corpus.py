#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 4, passo 1: SEED SQL.

Da corpus/pagine.curate.jsonl genera drizzle/seed-corpus.sql: gli INSERT per riempire
la tabella `pagine_corpus` (le Pagine reali, testo integrale intatto).

Il file SQL contiene TESTIMONIANZA PRIVATA → è gitignorato. Si applica con:
  npm run db:corpus:schema:local && npm run db:corpus:seed:local   (dev)
  npm run db:corpus:schema:remote && npm run db:corpus:seed:remote  (produzione, gate utente)
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
ROOT = os.path.dirname(CORPUS)
INP = os.path.join(CORPUS, "pagine.curate.jsonl")
OUT = os.path.join(ROOT, "drizzle", "seed-corpus.sql")

COLS = ["corpus_id", "data", "data_confidence", "tempo", "colore", "ciclo_domenicale",
        "settimana", "centro", "festa", "fraction_of_year", "vangelo", "tipo", "titolo",
        "testo", "fonte", "thread", "qualita", "n_varianti", "n_char"]


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    rows = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    lines = [
        "-- seed-corpus.sql — le Pagine REALI dell'utente (testimonianza privata).",
        "-- Generato da corpus/pipeline/gen_seed_corpus.py. NON committare (gitignorato).",
        "DELETE FROM pagine_corpus;",
    ]
    for r in rows:
        c = r.get("coord") or {}
        vals = {
            "corpus_id": r["id"],
            "data": r.get("dataRiferimento"),
            "data_confidence": r.get("dataConfidence"),
            "tempo": c.get("tempo"),
            "colore": c.get("colore"),
            "ciclo_domenicale": c.get("cicloDomenicale"),
            "settimana": c.get("settimanaRomana"),
            "centro": c.get("centro"),
            "festa": c.get("festa"),
            "fraction_of_year": c.get("fractionOfYear"),
            "vangelo": r.get("vangelo"),
            "tipo": r["tipo"],
            "titolo": r.get("titolo"),
            "testo": r["testo"],
            "fonte": r.get("fonte"),
            "thread": r.get("thread"),
            "qualita": r.get("qualita"),
            "n_varianti": r.get("nVarianti", 0),
            "n_char": r.get("nChar"),
        }
        vlist = ", ".join(q(vals[c]) for c in COLS)
        lines.append(f"INSERT INTO pagine_corpus ({', '.join(COLS)}) VALUES ({vlist});")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    kb = os.path.getsize(OUT) // 1024
    print(f"SEED SQL generato → {OUT} ({kb} KB) · {len(rows)} INSERT")


if __name__ == "__main__":
    main()
