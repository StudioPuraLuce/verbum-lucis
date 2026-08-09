#!/usr/bin/env python3
"""
LAVORAZIONE DEL CORPUS — Sessione 3, passo 2: VISTA CURATA (leggibile).

Genera corpus/curato.html: la cronistoria delle Pagine CURATE, ogni Pagina apribile a
TESTO INTEGRALE (così si può leggere e giudicare la qualità), con badge qualità, tipo,
Vangelo e numero di varianti dedotte. Filtri per fascia-qualità e tipo. File privato.
"""
import json, os, collections, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "pagine.curate.jsonl")
OUT = os.path.join(CORPUS, "curato.html")

COL = {"viola": "#7c3aed", "bianco": "#c08a1e", "verde": "#2f7d4f",
       "rosso": "#b3261e", "rosa": "#c85c8e", None: "#78716c"}


def main():
    rows = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    by_day = collections.defaultdict(list)
    undated = []
    for r in rows:
        (by_day[r["dataRiferimento"]] if r["dataRiferimento"] else undated).append(r)

    days = []
    for d in sorted(by_day):
        ps = sorted(by_day[d], key=lambda z: -z["qualita"])
        c = next((x.get("coord") for x in ps if x.get("coord")), None) or {}
        days.append({
            "data": d, "tempoLabel": c.get("tempoLabel"), "colore": c.get("colore"),
            "ciclo": c.get("cicloDomenicale"), "settimana": c.get("settimanaRomana"),
            "giorno": c.get("giornoSettimana"), "centro": c.get("centro"), "festa": c.get("festa"),
            "pagine": [{
                "tipo": x["tipo"], "vangelo": x["vangelo"], "titolo": x["titolo"],
                "qualita": x["qualita"], "nVarianti": x["nVarianti"],
                "fonte": x["fonte"], "thread": x["thread"], "nChar": x["nChar"],
                "conf": x["dataConfidence"], "testo": x["testo"],
            } for x in ps],
        })

    stats = {
        "curate": len(rows), "giorni": len(by_day), "senzaData": len(undated),
        "alta": sum(1 for r in rows if r["qualita"] >= 8),
        "media": sum(1 for r in rows if 5 <= r["qualita"] < 8),
        "bassa": sum(1 for r in rows if r["qualita"] < 5),
        "arco": f"{days[0]['data']} → {days[-1]['data']}" if days else "—",
        "generato": datetime.date.today().isoformat(),
    }
    payload = json.dumps({"days": days, "stats": stats}, ensure_ascii=False)

    tpl = """<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Corpus curato — Verbum Lucis</title>
<style>
:root{--bg:#faf7f2;--card:#fff;--ink:#292524;--mut:#78716c;--gold:#b8860b;--line:#e7e0d6}
@media(prefers-color-scheme:dark){:root{--bg:#1c1917;--card:#26221f;--ink:#f5f0e8;--mut:#a8a29e;--line:#3a3430}}
*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink)}
.wrap{max-width:860px;margin:0 auto;padding:24px 18px 100px}
h1{font-size:25px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 18px}
.stats{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.stat b{font-size:19px}.stat span{color:var(--mut);font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-left:6px}
.filters{position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--line);margin-bottom:8px}
.filters button{cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:20px;padding:4px 12px;font-size:13px}
.filters button.on{background:var(--gold);color:#fff;border-color:var(--gold)}
.day{margin:16px 0 0}
.dhead{position:sticky;top:52px;background:var(--bg);padding:6px 0;font-weight:700;border-left:5px solid var(--dot,#78716c);padding-left:10px}
.dhead .c{font-weight:400;color:var(--mut);font-size:13px}
.festa{color:var(--gold);font-weight:600}.centro{font-style:italic}
details{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--dot,#78716c);border-radius:10px;margin:8px 0;padding:2px 14px}
summary{cursor:pointer;padding:10px 0;list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
summary::-webkit-details-marker{display:none}
.q{font-weight:700;font-size:12px;padding:1px 8px;border-radius:6px;color:#fff}
.q.hi{background:#2f7d4f}.q.mid{background:#b8860b}.q.lo{background:#b3261e}
.badge{font-size:11px;padding:1px 7px;border-radius:6px;background:var(--bg);border:1px solid var(--line);text-transform:uppercase;letter-spacing:.03em}
.vv{color:var(--mut);font-size:12px}.tt{font-weight:600}
.meta{color:var(--mut);font-size:12px}
.body{white-space:pre-wrap;border-top:1px dashed var(--line);padding:12px 0;font-size:14.5px}
.var{color:var(--mut);font-size:12px;font-style:italic}
</style></head><body><div class="wrap">
<h1>☩ Corpus curato — leggibile</h1>
<p class="sub" id="sub"></p>
<div class="stats" id="stats"></div>
<div class="filters" id="filters"></div>
<div id="tl"></div>
</div>
<script>
const DATA=__DATA__;
const COL={viola:'#7c3aed',bianco:'#c08a1e',verde:'#2f7d4f',rosso:'#b3261e',rosa:'#c85c8e',null:'#78716c'};
const esc=s=>(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const S=DATA.stats;
document.getElementById('sub').textContent=`${S.curate} Pagine curate · ${S.giorni} giornate · ${S.arco} · generato ${S.generato}`;
const st=document.getElementById('stats');
[['alta ≥8',S.alta,'hi'],['media 5–8',S.media,'mid'],['bassa <5',S.bassa,'lo']].forEach(([k,v])=>
  st.insertAdjacentHTML('beforeend',`<div class="stat"><b>${v}</b><span>${k}</span></div>`));
const TIPI=[...new Set(DATA.days.flatMap(d=>d.pagine.map(p=>p.tipo)))].sort();
let fTipo=null, fQ=null;
function qtier(q){return q>=8?'hi':q>=5?'mid':'lo';}
function render(){
  const F=document.getElementById('filters');F.innerHTML='';
  const mk=(lbl,on,fn)=>{const b=document.createElement('button');b.textContent=lbl;if(on)b.className='on';b.onclick=fn;return b;};
  F.appendChild(mk('tutti i tipi',!fTipo,()=>{fTipo=null;render();}));
  TIPI.forEach(t=>F.appendChild(mk(t,fTipo===t,()=>{fTipo=(fTipo===t?null:t);render();})));
  F.appendChild(mk('· qualità: tutte',!fQ,()=>{fQ=null;render();}));
  [['alta','hi'],['media','mid'],['bassa','lo']].forEach(([l,v])=>
    F.appendChild(mk(l,fQ===v,()=>{fQ=(fQ===v?null:v);render();})));
  const tl=document.getElementById('tl');tl.innerHTML='';
  DATA.days.forEach(d=>{
    let pgs=d.pagine.filter(p=>(!fTipo||p.tipo===fTipo)&&(!fQ||qtier(p.qualita)===fQ));
    if(!pgs.length)return;
    const dot=COL[d.colore]||'#78716c';
    let coord=d.tempoLabel?`${esc(d.tempoLabel)}${d.settimana?' · '+d.settimana:''} · Anno ${d.ciclo||'?'}`:'';
    if(d.festa)coord+=` · <span class="festa">${esc(d.festa)}</span>`;
    if(d.centro)coord+=` · <span class="centro">${esc(d.centro)}</span>`;
    const items=pgs.map(p=>`<details style="--dot:${dot}"><summary>
      <span class="q ${qtier(p.qualita)}">${p.qualita}</span>
      <span class="badge">${p.tipo}</span>
      ${p.vangelo?`<span class="vv">${esc(p.vangelo)}</span>`:''}
      <span class="tt">${esc(p.titolo).slice(0,70)}</span>
      <span class="meta">· ${(p.nChar/1000).toFixed(1)}k · ${p.fonte}${p.nVarianti?` · +${p.nVarianti} varianti`:''}</span>
      </summary><div class="body">${esc(p.testo)}</div>
      <div class="var">thread: ${esc(p.thread)} · confidence data: ${p.conf}</div></details>`).join('');
    tl.insertAdjacentHTML('beforeend',
      `<div class="day"><div class="dhead" style="--dot:${dot}">${d.data} · ${d.giorno||''}
       <span class="c">${coord?'— '+coord:''}</span></div>${items}</div>`);
  });
}
render();
</script></body></html>"""
    tpl = tpl.replace("__DATA__", payload)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(tpl)
    kb = os.path.getsize(OUT) // 1024
    print("VISTA CURATA generata →", OUT, f"({kb} KB)")
    print(f"  {stats['curate']} Pagine · {stats['giorni']} giornate · qualità "
          f"alta {stats['alta']} / media {stats['media']} / bassa {stats['bassa']}")


if __name__ == "__main__":
    main()
