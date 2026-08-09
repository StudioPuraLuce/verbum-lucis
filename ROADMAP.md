# ROADMAP — Verbum Lucis

> Le fasi e i loro **criteri d'uscita**. Il dettaglio strategico a quattro assi (costruzione,
> design, monetizzazione, distribuzione) è nel master-plan approvato. Lo stato verificato è in
> `STATUS.md`; il prossimo passo unico in `NEXT.md`.

Sequenza (lancio incrementale — gli assi si intrecciano):
`Fase 0 → Fase 1 → Fase 1.5 (LANCIO) → Fase 2 → Fase 3 → Fase 4`.

## Fase 0 — Governance + Corpo completo  ◐ in corso
- Governance istituita: Stella Polare + AGENTS + ROADMAP/STATUS/NEXT/DECISIONS/CHANGELOG.
- Atomi estratti su tutte le Pagine di qualità ≥ 5 (le <5 sono rumore, escluse per costo/qualità).
- Corpo della Dottrina completo (con salvataggio JSON troncato + cache in `extract_doctrine.mjs`).
- **Uscita**: doc canonici in repo; `atomi_corpus` riseminata in D1 locale con copertura ~completa;
  `dottrina.jsonl` senza parse-error.

## Fase 1 — La spina al sito + Componitore + design base
- Coerenza: santi/preghiere/novene/rosario diventano **facce del giorno** (striscia-coordinata +
  cross-link alla spirale), non silos.
- **Componitore Giornaliero** (`src/lib/componitore.ts`): data → coordinata → atomi → pagina.
- RAG nel generatore (atomi come "voce dell'autore"; `concetto` esoterici fuori dal mainstream).
- Design-language unico (shadcn + Motion + Aceternity/Magic UI, stone+oro), propagato ai template.
- **Uscita**: le pagine chiave mostrano coordinata + cross-link; il Componitore rende una pagina di
  atomi reali per una data; CWV verdi; log puliti.

## Fase 1.5 — LANCIO incrementale  ⟶ gate umano
- Semina D1 **remota** + D1 prod + `database_id` in `wrangler.toml` + KV prod.
- Deploy Workers, dominio verbumlucis.it, analytics privacy-friendly.
- SEO tecnico (sitemap, schema.org, og:image per pagina). AffiliateBox Amazon + ads ON.
- **Uscita**: verbumlucis.it risponde 200 da D1 remoto; affiliazione col tag `verbumlucis-21`;
  sitemap + og:image validi.

## Fase 2 — Motore organico
- Workers Cron → Componitore → 1 Pagina Sacra/giorno + pacchetto IG + messaggio WhatsApp (bozze).
- **Uscita**: il cron produce i tre output come bozze; invio resta gate umano.

## Fase 3 — Prodotti (KDP per primo)
- eBook KDP composto dagli atomi (tema forte: cammino di 40 giorni / estensione "Preghiere per chi
  non brilla") → KDP + PDF Gumroad/Stripe.
- **Uscita**: manoscritto impaginato pronto per il gate di pubblicazione.

## Fase 4 — Premium + eredità
- Maestro Interiore (abbonamento, strato dottrinale) · stanza privata (auth da decidere) · Diario
  del Tempio (la sua storia dagli atomi `testimonianza`).
