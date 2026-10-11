#!/usr/bin/env python3
"""THEOSIS Studio: local, read-only private graph retrieval.

No AI/network/deployment. Output is PRIVATE context for the author's chat.
The corpus/graph.sqlite DB is gitignored and not available in GitHub.
"""
import argparse
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / "corpus" / "graph.sqlite"
TERM = re.compile(r"[^\W_]+", re.UNICODE)
STOP = {"the", "and", "from", "about", "with", "per", "del", "della", "che", "una", "sono", "come"}


def keywords(text):
    return {part.casefold() for part in TERM.findall(str(text)) if len(part) >= 3 and part.casefold() not in STOP}


def search_graph(db_path, question, limit=8):
    """Return node titles and direct links only; never entire source content."""
    db_path = Path(db_path).resolve()
    con = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    try:
        nodes = [dict(row) for row in con.execute("SELECT id, tipo, label FROM nodi")]
        by_id = {n["id"]: n for n in nodes}
        q = keywords(question)
        if not q:
            return {"status": "NO_QUERY_TERMS", "privacy": "PRIVATE_ONLY", "matches": []}
        ranked = []
        for node in nodes:
            overlap = len(q & keywords(node["label"]))
            if overlap:
                ranked.append((10 * overlap + int(question.casefold() in node["label"].casefold()) * 5, node))
        ranked.sort(key=lambda item: (-item[0], item[1]["id"]))
        result = []
        for score, node in ranked[:limit]:
            neighbors = []
            rows = con.execute("SELECT src, rel, dst FROM archi WHERE src=? OR dst=? LIMIT 32",
                               (node["id"], node["id"]))
            for row in rows:
                other_id = row["dst"] if row["src"] == node["id"] else row["src"]
                other = by_id.get(other_id)
                if other:
                    neighbors.append({"id": other_id, "kind": other["tipo"],
                                      "label": other["label"], "relation": row["rel"]})
            result.append({"id": node["id"], "kind": node["tipo"], "label": node["label"],
                           "rank": score, "neighbors": neighbors[:10]})
        return {"status": "FOUND" if result else "NO_MATCHES",
                "privacy": "PRIVATE_ONLY_DO_NOT_PUBLISH",
                "index": "historical graph.sqlite (not verified from remote)",
                "question": question, "matches": result}
    finally:
        con.close()


def main():
    p = argparse.ArgumentParser(description="Read-only local private Theosis graph context")
    p.add_argument("question", help="What concept are you exploring?")
    p.add_argument("--db", type=Path, default=DEFAULT_DB)
    p.add_argument("--limit", type=int, default=8)
    opts = p.parse_args()
    if not 1 <= opts.limit <= 30:
        p.error("--limit must be between 1 and 30")
    if not opts.db.is_file():
        print(json.dumps({"status": "PRIVATE_GRAPH_UNAVAILABLE",
                          "privacy": "PRIVATE_ONLY",
                          "next": "Check corpus/README.md and verify local source files; do not invent retrieval."}))
        return 2
    try:
        print(json.dumps(search_graph(opts.db, opts.question, opts.limit),
                         ensure_ascii=False, indent=2))
        return 0
    except sqlite3.Error:
        print(json.dumps({"status": "GRAPH_READ_FAILED", "privacy": "PRIVATE_ONLY"}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
