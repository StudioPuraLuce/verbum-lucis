# AGENTS.md — istruzioni permanenti per l'AI su Verbum Lucis

> Come si lavora qui. Leggi prima `docs/00-governance/STELLA-POLARE.md` (identità, invarianti) e
> `STATUS.md` (dov'è il progetto ora). Questo file dice **come** operare.

## Missione

Portare Verbum Lucis (portale cattolico italiano, Astro 5 SSR + Cloudflare Workers/D1) a essere
un'opera **strutturata, in direzione, votata alla perfezione anche tecnica**, che rende gloria e
fa soldi tramite un motore organico. Vedi la Stella Polare per l'identità.

## Ordine di autorità (in conflitto, vince il più alto)

1. `docs/00-governance/STELLA-POLARE.md` — identità, offerta, promesse, non-negoziabili.
2. Questo `AGENTS.md` — metodo e invarianti tecnici.
3. `DECISIONS.md` — decisioni prese (ADR).
4. `ROADMAP.md` → `NEXT.md` — cosa costruire ora.

**Una decisione tecnica non cambia mai identità/offerta/promesse.** Se un'implementazione
richiederebbe di violare la Stella Polare: **fermati e descrivi il conflitto**, non reinterpretare.

## Invarianti (non si toccano senza gate umano)

- **Ortodossia**: lo strato dottrinale/esoterico non entra mai nel prompt/contenuto mainstream.
  Gli atomi `concetto` esoterici sono esclusi dal generatore devozionale.
- **Privacy corpus**: gli artefatti-testimonianza restano **gitignorati** (`corpus/*.jsonl`,
  `corpus/atoms-cache/`, `corpus/*.html`, `corpus/*.sqlite`, `drizzle/seed-*.sql`). In git solo
  codice, schema, prompt, doc. `.dev.vars`/segreti **mai** committati.
- **Fonte di verità**: `db/schema.ts` (Drizzle) è la verità dello schema; **tutto `drizzle/` è
  gitignorato** (le SQL sono artefatti locali). La spina liturgica è `src/lib/liturgical-spiral.ts`
  (motore deterministico offline), unica autorità sulla coordinata.

## Principi tecnici

- **Un modello per il lavoro giusto.** Estrazione/lavori meccanici (verbatim, batch) → modello
  economico (**Haiku** via Gateway). Generazione customer-facing ("voce del Re", Pagina Sacra) →
  modello forte (**Sonnet**). Non pagare Sonnet per lavoro meccanico.
- **AI via Cloudflare AI Gateway** `verbum-lucis` (account `60496826f56a093a72602bfae074fdcf`),
  fatturazione unificata. Offline: `POST …/verbum-lucis/anthropic/v1/messages` con header
  `cf-aig-authorization: Bearer $CF_AIG_TOKEN`. Modello Sonnet = `claude-sonnet-4-6` (NON
  `claude-sonnet-4.6`); Haiku = `claude-haiku-4-5`. In-Worker: `env.AI.run(...)` con `{gateway}`.
- **Idempotenza**: i batch AI hanno cache per-record (es. `atoms-cache/`), riavviabili senza
  ri-spendere. Guardia anti-allucinazione sull'estrazione verbatim (l'atomo è sottostringa
  normalizzata della fonte).
- **Offline-first**: la coordinata liturgica è deterministica (nessuna dipendenza di rete). D1/API
  esterne solo per i dati che non si calcolano (letture, ecc.).
- **Costo consapevole**: preferire sempre la via più economica che regge la qualità richiesta;
  segnalare la spesa stimata prima dei run a pagamento grossi.
- Lingua operativa **italiano**; timezone **Europe/Rome**.

## Gate umani (l'AI prepara e propone, Chris approva ed esegue)

Semina D1 **remota/prod** · creazione DB/deploy in produzione · **prezzi** dei prodotti ·
**comunicazioni esterne** (post IG, broadcast WhatsApp) · **pubblicazioni** (KDP, stampe) ·
listing prodotti · qualsiasi scrittura su servizi esterni · operazioni distruttive. Default
**fail-closed**.

## Metodo di lavoro

1. Leggi la spec (Stella Polare → ROADMAP → NEXT). 2. Elenca file/risorse toccati e dichiara le
assunzioni. 3. Fai la **minima fetta verticale funzionante**. 4. Verifica (browser preview / query /
test). 5. Aggiorna `STATUS.md` + `CHANGELOG.md` + `NEXT.md`. Per fasi: mai tutto in un rilascio.

## Definizione di "completato"

Fonte-dati definita · ID/stati canonici · error-handling + retry dove serve · idempotenza ·
criteri d'accettazione verificati (non "dovrebbe funzionare") · doc + changelog aggiornati ·
log puliti.
