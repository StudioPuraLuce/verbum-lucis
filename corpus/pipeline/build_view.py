#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 2: VISTA (timeline + grafo).

Genera corpus/graph.html, una pagina HTML self-contained per ispezionare visivamente
la cronistoria del cammino e le connessioni del grafo. Dati incorporati (solo metadati,
non il testo integrale). File PRIVATO (gitignorato).
"""
import json, os, sqlite3, collections, datetime, html

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
PAGINE = os.path.join(CORPUS, "pagine.enriched.jsonl")
DB = os.path.join(CORPUS, "graph.sqlite")
OUT = os.path.join(CORPUS, "graph.html")

COL_HEX = {"viola": "#7c3aed", "bianco": "#c08a1e", "verde": "#2f7d4f",
           "rosso": "#b3261e", "rosa": "#c85c8e", None: "#78716c"}


def load_pages():
    with open(PAGINE, encoding="utf-8") as fh:
        return [json.loads(l) for l in fh if l.strip()]


def main():
    pages = load_pages()
    con = sqlite3.connect(DB)
    nodi_tipo = dict(con.execute("SELECT tipo, COUNT(*) FROM nodi GROUP BY tipo").fetchall())
    archi_rel = dict(con.execute("SELECT rel, COUNT(*) FROM archi GROUP BY rel").fetchall())
    con.close()

    # Timeline: giorni con data, i "ancorati" (alta/media) in evidenza
    by_day = collections.defaultdict(list)
    for p in pages:
        if p["dataRiferimento"]:
            by_day[p["dataRiferimento"]].append(p)

    days = []
    for d in sorted(by_day):
        ps = by_day[d]
        anchored = any(x["dataConfidence"] in ("alta", "media") for x in ps)
        c = next((x.get("coord") for x in ps if x.get("coord")), None) or {}
        days.append({
            "data": d, "anchored": anchored,
            "tempo": c.get("tempo"), "tempoLabel": c.get("tempoLabel"),
            "colore": c.get("colore"), "ciclo": c.get("cicloDomenicale"),
            "settimana": c.get("settimanaRomana"), "giorno": c.get("giornoSettimana"),
            "centro": c.get("centro"), "festa": c.get("festa"),
            "pagine": [{
                "tipo": x["tipo"], "vangelo": x["vangelo"],
                "titolo": x["titolo"][:80],
                "excerpt": " ".join(x["testo"].split())[:180],
                "fonte": x["fonte"], "nChar": x["nChar"],
                "conf": x["dataConfidence"],
            } for x in sorted(ps, key=lambda z: -z["nChar"])],
        })

    stats = {
        "pagine": len(pages),
        "giorni": len(days),
        "ancorati": sum(1 for d in days if d["anchored"]),
        "arco": f"{days[0]['data']} → {days[-1]['data']}" if days else "—",
        "nodi": nodi_tipo, "archi": archi_rel,
        "generato": datetime.date.today().isoformat(),
    }

    data_json = json.dumps({"days": days, "stats": stats}, ensure_ascii=False)

    page = """<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cronistoria & Grafo — Verbum Lucis Corpus</title>
<style>
:root{--bg:#faf7f2;--card:#fff;--ink:#292524;--mut:#78716c;--gold:#b8860b;--line:#e7e0d6}
@media(prefers-color-scheme:dark){:root{--bg:#1c1917;--card:#292524;--ink:#f5f0e8;--mut:#a8a29e;--line:#3a3430}}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink)}
.wrap{max-width:1000px;margin:0 auto;padding:24px 18px 80px}
h1{font-size:26px;margin:0 0 4px;font-weight:700}
.sub{color:var(--mut);margin:0 0 20px}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;min-width:96px}
.stat b{display:block;font-size:22px}.stat span{color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.bars{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 22px;font-size:13px}
.bars h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.bar{display:inline-flex;align-items:center;gap:6px;margin:3px 10px 3px 0}
.chip{background:var(--bg);border:1px solid var(--line);border-radius:20px;padding:2px 10px;font-size:12px}
.filters{position:sticky;top:0;background:var(--bg);padding:10px 0;margin:0 0 6px;z-index:5;display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--line)}
.filters button{cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:20px;padding:4px 12px;font-size:13px}
.filters button.on{background:var(--gold);color:#fff;border-color:var(--gold)}
.day{position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px 12px;margin:14px 0;border-left:5px solid var(--dot,#78716c)}
.day.appr{box-shadow:0 1px 8px rgba(0,0,0,.05)}
.dhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px}
.ddate{font-weight:700;font-size:16px}.dcoord{color:var(--mut);font-size:13px}
.festa{color:var(--gold);font-weight:600}
.centro{font-style:italic;color:var(--mut)}
.pg{border-top:1px dashed var(--line);padding:8px 0 2px;margin-top:8px}
.pg:first-of-type{border-top:0}
.badge{display:inline-block;font-size:11px;padding:1px 7px;border-radius:6px;background:var(--bg);border:1px solid var(--line);margin-right:6px;text-transform:uppercase;letter-spacing:.03em}
.badge.pagina-sacra{color:#b8860b}.badge.cammino{color:#2f7d4f}.badge.preghiera{color:#7c3aed}.badge.dottrina{color:#b3261e}.badge.diario{color:#c85c8e}
.vv{color:var(--mut);font-size:12px}
.ptitle{font-weight:600}
.pex{color:var(--mut);font-size:13px;margin-top:2px}
.approx{opacity:.55}
</style></head><body><div class="wrap">
<h1>☩ Cronistoria & Grafo del Corpus</h1>
<p class="sub" id="sub"></p>
<div class="stats" id="stats"></div>
<div class="bars" id="bars"></div>
<div class="filters" id="filters"></div>
<div id="timeline"></div>
</div>
<script>
const DATA = __DATA__;
const COL = {viola:'#7c3aed',bianco:'#c08a1e',verde:'#2f7d4f',rosso:'#b3261e',rosa:'#c85c8e',null:'#78716c'};
const esc = s => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S = DATA.stats;
document.getElementById('sub').textContent =
  `${S.pagine} Pagine · ${S.giorni} giornate (${S.ancorati} ancorate) · ${S.arco} · generato ${S.generato}`;
const statsEl = document.getElementById('stats');
[['Pagine',S.pagine],['Giornate',S.giorni],['Ancorate',S.ancorati]].forEach(([k,v])=>{
  statsEl.insertAdjacentHTML('beforeend',`<div class="stat"><b>${v}</b><span>${k}</span></div>`);});
Object.entries(S.nodi).forEach(([k,v])=>statsEl.insertAdjacentHTML('beforeend',
  `<div class="stat"><b>${v}</b><span>${k}</span></div>`));
const bars = document.getElementById('bars');
bars.insertAdjacentHTML('beforeend','<h3>Archi del grafo</h3>');
Object.entries(S.archi).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>
  bars.insertAdjacentHTML('beforeend',`<span class="bar"><span class="chip">${k}</span> ${v}</span>`));

const TIPI = [...new Set(DATA.days.flatMap(d=>d.pagine.map(p=>p.tipo)))].sort();
let filter = null;
const fEl = document.getElementById('filters');
const mkBtn = (label,val)=>{const b=document.createElement('button');b.textContent=label;
  if(val===filter)b.className='on';b.onclick=()=>{filter=(filter===val?null:val);render();};return b;};
function render(){
  fEl.innerHTML='';fEl.appendChild(mkBtn('tutte',null));
  TIPI.forEach(t=>fEl.appendChild(mkBtn(t,t)));
  const tl=document.getElementById('timeline');tl.innerHTML='';
  DATA.days.forEach(d=>{
    const pgs = filter ? d.pagine.filter(p=>p.tipo===filter) : d.pagine;
    if(!pgs.length) return;
    const dot = COL[d.colore]||'#78716c';
    let coord = d.tempoLabel? `${esc(d.tempoLabel)}${d.settimana?' · '+d.settimana:''} · Anno ${d.ciclo||'?'} · ${d.colore||''}`:'';
    if(d.festa) coord += ` · <span class="festa">${esc(d.festa)}</span>`;
    if(d.centro) coord += ` · <span class="centro">${esc(d.centro)}</span>`;
    const rows = pgs.map(p=>`<div class="pg${p.conf==='bassa'?' approx':''}">
      <div><span class="badge ${p.tipo}">${p.tipo}</span>
      ${p.vangelo?`<span class="vv">${esc(p.vangelo)}</span> · `:''}
      <span class="ptitle">${esc(p.titolo)}</span>
      <span class="vv"> · ${(p.nChar/1000).toFixed(1)}k · ${p.fonte}</span></div>
      <div class="pex">${esc(p.excerpt)}…</div></div>`).join('');
    tl.insertAdjacentHTML('beforeend',
      `<div class="day ${d.anchored?'appr':''}" style="--dot:${dot}">
        <div class="dhead"><span class="ddate">${d.data}</span>
        <span class="dcoord">${d.giorno||''}${coord?' — '+coord:''}</span></div>
        ${rows}</div>`);
  });
}
render();
</script></body></html>"""

    page = page.replace("__DATA__", data_json)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(page)
    print("VISTA generata →", OUT)
    print(f"  {stats['pagine']} Pagine · {stats['giorni']} giornate ({stats['ancorati']} ancorate) · {stats['arco']}")


if __name__ == "__main__":
    main()
