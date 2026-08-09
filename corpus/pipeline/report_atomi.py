#!/usr/bin/env python3
"""IL CORPO DI CONOSCENZA — report degli atomi (conteggi, copertura, campioni)."""
import json, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "atomi.jsonl")


def main():
    atoms = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    by_tipo = collections.Counter(a["tipo"] for a in atoms)
    by_tempo = collections.Counter(a.get("tempo") or "—" for a in atoms)
    pagine = len(set(a["corpusId"] for a in atoms))
    tag = collections.Counter(t for a in atoms for t in a.get("tags", []))

    print(f"CORPO DI CONOSCENZA — {len(atoms)} atomi da {pagine} Pagine")
    print("=" * 56)
    print("Per tipo:")
    for t, n in by_tipo.most_common():
        print(f"  {t:<14} {n:>5}")
    print("\nPer tempo liturgico:")
    for t, n in by_tempo.most_common():
        print(f"  {t:<14} {n:>5}")
    print("\nTag più frequenti:")
    for t, n in tag.most_common(20):
        print(f"  {t:<22} {n}")
    media = len(atoms) / pagine if pagine else 0
    print(f"\nMedia atomi per Pagina: {media:.1f}")


if __name__ == "__main__":
    main()
