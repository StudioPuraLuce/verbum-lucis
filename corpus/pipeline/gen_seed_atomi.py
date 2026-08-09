#!/usr/bin/env python3
"""
IL CORPO DI CONOSCENZA — seed SQL degli atomi.
Da corpus/atomi.jsonl genera drizzle/seed-atomi.sql (INSERT in atomi_corpus).
File PRIVATO (testimonianza) → gitignorato.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
ROOT = os.path.dirname(CORPUS)
INP = os.path.join(CORPUS, "atomi.jsonl")
OUT = os.path.join(ROOT, "drizzle", "seed-atomi.sql")

COLS = ["atom_id", "corpus_id", "tipo", "testo", "titolo", "tags", "data",
        "tempo", "colore", "ciclo_domenicale", "centro", "vangelo", "qualita"]


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    rows = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    lines = [
        "-- seed-atomi.sql — il CORPO DI CONOSCENZA (atomi verbatim, privato).",
        "-- Generato da corpus/pipeline/gen_seed_atomi.py. NON committare.",
        "DELETE FROM atomi_corpus;",
    ]
    for r in rows:
        vals = {
            "atom_id": r["id"], "corpus_id": r["corpusId"], "tipo": r["tipo"],
            "testo": r["testo"], "titolo": r.get("titolo"),
            "tags": json.dumps(r.get("tags", []), ensure_ascii=False),
            "data": r.get("data"), "tempo": r.get("tempo"), "colore": r.get("colore"),
            "ciclo_domenicale": r.get("ciclo"), "centro": r.get("centro"),
            "vangelo": r.get("vangelo"), "qualita": r.get("qualita"),
        }
        lines.append(f"INSERT INTO atomi_corpus ({', '.join(COLS)}) VALUES ({', '.join(q(vals[c]) for c in COLS)});")
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"SEED atomi → {OUT} ({os.path.getsize(OUT)//1024} KB) · {len(rows)} INSERT")


if __name__ == "__main__":
    main()
