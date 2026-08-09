# NEXT — il prossimo risultato unico

> Un solo risultato alla volta, con criteri d'accettazione e gate. Quando è fatto e verificato, si
> aggiorna `STATUS.md` + `CHANGELOG.md` e si sceglie il prossimo da `ROADMAP.md`.

## Ora: chiudere la Fase 0 → aprire la Fase 1 (il Componitore)

**Risultato:** `src/lib/componitore.ts` — il Componitore Giornaliero. Data una data:
1. calcola la coordinata (`liturgicalCoordinate`),
2. seleziona dagli atomi (`atomi_corpus`) quelli pertinenti alla coordinata (Vangelo-tonalità /
   tempo / centro), escludendo gli atomi `concetto` esoterici dal flusso mainstream,
3. restituisce un oggetto-pagina strutturato (meditazione + preghiera + gesto + frase) riutilizzabile
   da: web (Pagina Sacra), Storie IG, messaggio WhatsApp.

**Criteri d'accettazione:**
- Chiamato con `2025-04-21` restituisce atomi reali coerenti (Pasqua, "La Presenza che cammina
  accanto"), senza atomi `concetto` esoterici.
- Deterministico e offline per la selezione (l'AI, se usata per rifinire la composizione, è
  opzionale e dietro cache).
- Nessuna regressione: `/pagina-sacra/oggi`, `/spirale` restano 200 con log puliti.

**Gate:** nessuno (lavoro locale). Il primo gate umano arriva alla **Fase 1.5** (semina D1 remota +
deploy prod).

## Subito prima (in chiusura)
- ◐ Estrazione **Corpo della Dottrina** (Haiku, qualità ≥ 5) in corso → poi aggiornare `STATUS.md`.
