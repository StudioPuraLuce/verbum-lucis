### Documento 03 — Automazioni e ManyChat

**Nome del progetto:** Fedele Messaggero

---

### SISTEMA DI AUTOMAZIONE

**Obiettivo:**
Consegnare preghiere quotidiane, settimanali o personalizzate agli utenti tramite WhatsApp (via ManyChat), in modo automatico, umano e spiritualmente rilevante.

---

### STRUTTURA DEL FLOW PRINCIPALE

**Ingresso:**
- Utente clicca su link WhatsApp
- Viene accolto da messaggio introduttivo
- Gli vengono offerte 3 opzioni:
  1. ✦ Ogni Mattina
  2. ✦ Ogni Domenica
  3. ✦ Ogni Momento

**Flow JSON:**
- Template generato e importato in ManyChat
- Ogni scelta dell’utente attiva una **selezione di contenuti** legati alla categoria
- Follow-up automatico:
  - Giornaliero per "Mattina"
  - Settimanale (domenica ore 08:00)
  - Interazione singola per "Momento"

---

### STRUMENTI USATI

- **ManyChat** (Free plan sufficiente per l’MVP)
  - Flusso costruito in modalità Flow Builder
  - Trigger: "keyword", "link", "click da post con commento"
  - Deliverability via WhatsApp Business

- **QR Code fisico:**
  - Stampato e posizionato su oggetti
  - Rimanda a WhatsApp con link tracciato

- **Bot Reply:**
  - Messaggi generici preimpostati (es. "Che Dio ti benedica, questa è per te:")
  - Ogni messaggio include una ✣ + preghiera + firma del bot "Fedele Messaggero"

---

### USO DI TAG & CONDIZIONI

- Gli utenti vengono taggati in base alla categoria scelta
- Condizioni per evitare invii doppi
- Ogni interazione viene archiviata nel CRM ManyChat (con nome, telefono, data interazione)

---

### PERCORSI LITURGICI

- Seguire il **Calendario Liturgico Romano**:
  - **Tempo di Avvento**: preghiere di attesa e luce
  - **Tempo di Natale:** preghiere di nascita, gioia, incarnazione
  - **Tempo Ordinario:** cammino quotidiano, fede operosa
  - **Quaresima:** penitenza, silenzio, conversione
  - **Settimana Santa:** dolore, croce, resurrezione
  - **Tempo di Pasqua:** gioia, vittoria, nuova vita
  - **Pentecoste:** fuoco dello Spirito e missione

- Ogni periodo con:
  - Preghiera settimanale liturgica dedicata
  - Ritmi e parole coerenti con la liturgia ufficiale CEI
  - Invii automatici personalizzati sul calendario

### FOLLOW-UP FUTURI

- Invio di **preghiere personalizzate a richiesta**
- Percorsi settimanali a tema ("**Settimana della Luc**e", "**Settimana della Fiducia")**
- Raccolta f**eedback tramite emoji o testo breve** ("Questa preghiera ti ha parlato?")
- Potenziale attivazione email follow-up.

---

**Nota finale:**
L’automazione non è fredda. È al servizio del sacro. Ogni messaggio è pensato per sembrare scritto a mano da un fratello nella fede. Anche se parte da un flusso automatico, ogni preghiera arriva con il peso della cura.

