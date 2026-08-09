#!/usr/bin/env python3
"""IL CORPO DI CONOSCENZA — vista privata degli atomi (corpus/atomi.html).
Atomi filtrabili per tipo + ricerca testo, con provenienza. Self-contained, privato."""
import json, os, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
CORPUS = os.path.dirname(HERE)
INP = os.path.join(CORPUS, "atomi.jsonl")
OUT = os.path.join(CORPUS, "atomi.html")


def main():
    atoms = [json.loads(l) for l in open(INP, encoding="utf-8") if l.strip()]
    by_tipo = collections.Counter(a["tipo"] for a in atoms)
    payload = json.dumps({
        "atoms": [{
            "tipo": a["tipo"], "testo": a["testo"], "titolo": a.get("titolo") or "",
            "tags": a.get("tags", []), "data": a.get("data"), "tempo": a.get("tempo"),
            "vangelo": a.get("vangelo"), "centro": a.get("centro"),
        } for a in atoms],
        "byTipo": dict(by_tipo), "tot": len(atoms),
        "generato": datetime.date.today().isoformat(),
    }, ensure_ascii=False)

    tpl = """<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Corpo di Conoscenza — Atomi</title>
<style>
:root{--bg:#faf7f2;--card:#fff;--ink:#292524;--mut:#78716c;--gold:#b8860b;--line:#e7e0d6}
@media(prefers-color-scheme:dark){:root{--bg:#1c1917;--card:#26221f;--ink:#f5f0e8;--mut:#a8a29e;--line:#3a3430}}
*{box-sizing:border-box}body{margin:0;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink)}
.wrap{max-width:900px;margin:0 auto;padding:22px 18px 90px}
h1{font-size:24px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 16px}
.controls{position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;border-bottom:1px solid var(--line);margin-bottom:12px}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.filters button{cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:20px;padding:4px 12px;font-size:13px}
.filters button.on{background:var(--gold);color:#fff;border-color:var(--gold)}
#q{width:100%;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font-size:14px}
.atom{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--c,#b8860b);border-radius:10px;padding:12px 14px;margin:9px 0}
.atom .t{font-size:11px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--c,#b8860b)}
.atom .titolo{font-weight:600;margin-left:8px}
.atom .testo{font-family:'EB Garamond',serif;font-size:1.1rem;margin:.4rem 0 .3rem;white-space:pre-wrap}
.atom .meta{font-size:12px;color:var(--mut)}
.tag{display:inline-block;font-size:11px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:0 7px;margin:2px 3px 0 0;color:var(--mut)}
</style></head><body><div class="wrap">
<h1>🧬 Corpo di Conoscenza — gli Atomi</h1>
<p class="sub" id="sub"></p>
<div class="controls">
  <div class="filters" id="filters"></div>
  <input id="q" placeholder="cerca nel testo degli atomi…" autocomplete="off">
</div>
<div id="list"></div>
</div>
<script>
const DATA=__DATA__;
const COL={insegnamento:'#b8860b',preghiera:'#7c3aed',gesto:'#2f7d4f',simbolo:'#c85c8e',meditazione:'#2563a6',testimonianza:'#b3261e',frase:'#9a6a1e',concetto:'#57534e'};
const esc=s=>(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
document.getElementById('sub').textContent=`${DATA.tot} atomi · generato ${DATA.generato}`;
let fTipo=null,fQ='';
const TIPI=Object.keys(DATA.byTipo).sort((a,b)=>DATA.byTipo[b]-DATA.byTipo[a]);
function render(){
  const F=document.getElementById('filters');F.innerHTML='';
  const mk=(l,on,fn)=>{const b=document.createElement('button');b.textContent=l;if(on)b.className='on';b.onclick=fn;return b;};
  F.appendChild(mk(`tutti (${DATA.tot})`,!fTipo,()=>{fTipo=null;render();}));
  TIPI.forEach(t=>F.appendChild(mk(`${t} (${DATA.byTipo[t]})`,fTipo===t,()=>{fTipo=(fTipo===t?null:t);render();})));
  const q=fQ.toLowerCase();
  let items=DATA.atoms.filter(a=>(!fTipo||a.tipo===fTipo)&&(!q||a.testo.toLowerCase().includes(q)||(a.titolo||'').toLowerCase().includes(q)));
  const L=document.getElementById('list');
  L.innerHTML=items.slice(0,600).map(a=>{
    const c=COL[a.tipo]||'#b8860b';
    const meta=[a.data,a.tempo,a.vangelo,a.centro].filter(Boolean).map(esc).join(' · ');
    const tags=(a.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
    return `<div class="atom" style="--c:${c}"><span class="t">${a.tipo}</span><span class="titolo">${esc(a.titolo)}</span>
      <div class="testo">${esc(a.testo)}</div><div class="meta">${meta}</div>${tags}</div>`;
  }).join('')+(items.length>600?`<p class="sub">…e altri ${items.length-600}. Affina la ricerca.</p>`:'');
}
document.getElementById('q').addEventListener('input',e=>{fQ=e.target.value;render();});
render();
</script></body></html>"""
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(tpl.replace("__DATA__", payload))
    print(f"VISTA atomi → {OUT} ({os.path.getsize(OUT)//1024} KB) · {len(atoms)} atomi")


if __name__ == "__main__":
    main()
