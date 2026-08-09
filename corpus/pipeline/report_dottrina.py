#!/usr/bin/env python3
"""Report del Corpo della Dottrina: categorie, scale, concetti-hub (più collegati).

    python3 corpus/pipeline/report_dottrina.py
Legge corpus/dottrina.jsonl (privato, gitignorato) e stampa una sintesi navigabile.
"""
import json
import os
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "dottrina.jsonl")


def norm(nome: str) -> str:
    return " ".join((nome or "").lower().split())


def main() -> None:
    rows = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    print(f"CORPO DELLA DOTTRINA — {len(rows)} concetti (grezzi, non ancora deduplicati)")
    print("=" * 56)

    # Fusione per nome normalizzato: quante fonti citano lo stesso concetto
    by_name = defaultdict(list)
    for r in rows:
        by_name[norm(r.get("nome", ""))].append(r)
    print(f"Concetti distinti (per nome): {len(by_name)}")

    cat = Counter(r.get("categoria") or "—" for r in rows)
    print("\nPer categoria:")
    for k, v in cat.most_common():
        print(f"  {k:12} {v}")

    # Scale presenti (idrogeni, ottava, ecc.)
    scale = Counter(str(r.get("scala")) for r in rows if r.get("scala"))
    print("\nScale/posizioni più citate:")
    for k, v in scale.most_common(20):
        print(f"  {k:16} {v}")

    # Concetti-hub: più menzionati + più collegati
    grado = Counter()
    for r in rows:
        for c in r.get("collegamenti", []) or []:
            grado[norm(c)] += 1
    print("\nConcetti-hub (più collegati dagli altri):")
    for k, v in grado.most_common(20):
        # nome "bello" dalla prima occorrenza
        nice = next((x["nome"] for x in rows if norm(x.get("nome", "")) == k), k)
        print(f"  {nice[:40]:40} ←{v}")

    print("\nConcetti più ricorrenti (per n. di fonti):")
    for name, items in sorted(by_name.items(), key=lambda kv: -len(kv[1]))[:20]:
        nice = items[0]["nome"]
        print(f"  {nice[:40]:40} ×{len(items)}")


if __name__ == "__main__":
    main()
