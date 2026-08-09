#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 1, passo 4: REPORT.

Da corpus/pagine.enriched.jsonl genera due indici navigabili:
  • CRONISTORIA.md — la linea temporale del cammino, giorno per giorno, con coordinata
    liturgica e le Pagine trovate; evidenzia i giorni ancorati (data esplicita).
  • INVENTARIO.md — copertura per Vangelo, per tempo liturgico, per ciclo A/B/C, per tipo;
    Top Pagine per ampiezza; gap da colmare.
"""
import json, os, collections, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "pagine.enriched.jsonl")
CRON = os.path.join(CORPUS, "CRONISTORIA.md")
INV = os.path.join(CORPUS, "INVENTARIO.md")

TEMPO_ORD = ["avvento", "natale", "ordinario", "quaresima", "triduo", "pasqua"]


def load():
    with open(INP, encoding="utf-8") as fh:
        return [json.loads(l) for l in fh if l.strip()]


def cronistoria(pages):
    # backbone = pagine con data ancorata (alta/media); le 'bassa' entrano come approssimate
    by_day = collections.defaultdict(list)
    for p in pages:
        if p["dataRiferimento"]:
            by_day[p["dataRiferimento"]].append(p)
    days = sorted(by_day)
    anchored = sorted(d for d in days if any(
        x["dataConfidence"] in ("alta", "media") for x in by_day[d]))

    out = ["# ☩ CRONISTORIA — la linea del cammino\n",
           f"*Generato {datetime.date.today().isoformat()} · "
           f"{len(pages)} Pagine · {len(days)} giornate con data · "
           f"{len(anchored)} giornate ancorate (data esplicita).*\n",
           "> Le giornate **ancorate** hanno una data scritta a mano nel testo. "
           "Le altre usano la data del thread come approssimazione.\n",
           f"\nArco temporale: **{days[0]} → {days[-1]}**\n",
           "\n---\n\n## Giornate ancorate (data esplicita nel testo)\n"]
    for d in anchored:
        ps = [x for x in by_day[d] if x["dataConfidence"] in ("alta", "media")]
        c = ps[0].get("coord") or {}
        giorno = c.get("giornoSettimana", "")
        coordline = ""
        if c:
            coordline = (f"{c.get('tempoLabel','?')}"
                         f"{' · ' + c['settimanaRomana'] if c.get('settimanaRomana') else ''}"
                         f" · Anno {c.get('cicloDomenicale','?')} · {c.get('colore','?')}")
            if c.get("festa"):
                coordline += f" · **{c['festa']}**"
            if c.get("centro"):
                coordline += f" · _{c['centro']}_"
        out.append(f"\n### {d} · {giorno}\n")
        if coordline:
            out.append(f"`{coordline}`\n")
        for x in sorted(ps, key=lambda z: -z["nChar"]):
            v = f" · {x['vangelo']}" if x["vangelo"] else ""
            out.append(f"- **[{x['tipo']}]** {x['titolo']}{v} "
                       f"· {x['nChar']//1000}k · _{x['fonte']}_ · `{x['id']}`\n")
    open(CRON, "w", encoding="utf-8").write("".join(out))
    return len(days), len(anchored), days[0], days[-1]


def inventario(pages):
    by_tipo = collections.Counter(p["tipo"] for p in pages)
    by_fonte = collections.Counter(p["fonte"] for p in pages)
    by_tempo = collections.Counter(
        (p["coord"] or {}).get("tempo", "—") for p in pages)
    by_ciclo = collections.Counter(
        (p["coord"] or {}).get("cicloDomenicale", "—") for p in pages)

    # per Vangelo (base "Gv 6")
    def base(v):
        return v.split(",")[0] if v else "—"
    by_vang = collections.Counter(base(p["vangelo"]) for p in pages if p["vangelo"])

    out = ["# 📖 INVENTARIO del corpus\n",
           f"*Generato {datetime.date.today().isoformat()} · {len(pages)} Pagine.*\n",
           "\n## Per tipo\n"]
    for t, n in by_tipo.most_common():
        out.append(f"- **{t}**: {n}\n")
    out.append("\n## Per fonte\n")
    for t, n in by_fonte.most_common():
        out.append(f"- **{t}**: {n}\n")
    out.append("\n## Per tempo liturgico\n")
    for t in TEMPO_ORD:
        out.append(f"- **{t}**: {by_tempo.get(t,0)}\n")
    out.append("\n## Per ciclo domenicale (tonalità del Vangelo)\n")
    for cyc in ("A", "B", "C"):
        chars = {"A": "Matteo/mente", "B": "Marco/corpo", "C": "Luca/cuore"}[cyc]
        out.append(f"- **Anno {cyc}** ({chars}): {by_ciclo.get(cyc,0)}\n")
    out.append("\n## Per riferimento evangelico (Top 30)\n")
    for v, n in by_vang.most_common(30):
        out.append(f"- **{v}**: {n} Pagine\n")

    out.append("\n## Top 25 Pagine per ampiezza\n")
    for p in sorted(pages, key=lambda z: -z["nChar"])[:25]:
        v = f" · {p['vangelo']}" if p["vangelo"] else ""
        d = p["dataRiferimento"] or "?"
        out.append(f"- {p['nChar']//1000}k · **[{p['tipo']}]** {p['titolo']}{v} "
                   f"· {d} · _{p['thread']}_\n")

    # Gap: tempi con centro/lavoro non ancora mappati nella spina
    out.append("\n## Gap noti (da colmare in curatela, Sessione 3)\n")
    out.append("- Centro/lavoro non ancora mappati nel motore-spina: "
               "**Quaresima, Natale, Tempo Ordinario I (sett. 1–9)**.\n")
    out.append("- Deduplica semantica (stessa Pagina riscritta più volte) non ancora applicata.\n")
    open(INV, "w", encoding="utf-8").write("".join(out))


def main():
    pages = load()
    ndays, nanch, dmin, dmax = cronistoria(pages)
    inventario(pages)
    print("REPORT completato:")
    print(f"  → {CRON}")
    print(f"  → {INV}")
    print(f"  Giornate con data: {ndays}  ·  ancorate: {nanch}  ·  arco {dmin} → {dmax}")


if __name__ == "__main__":
    main()
