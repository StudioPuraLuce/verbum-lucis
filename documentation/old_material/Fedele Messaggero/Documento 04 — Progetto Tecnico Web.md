### Documento 04 — Progetto Tecnico Web
**Nome del progetto:** Fedele Messaggero
![[Pasted image 20250501144523.png]]
---

### OBIETTIVO TECNICO
Realizzare una piattaforma web minimalista, ispirata alla sacralità visiva dei testi liturgici, che consenta:
- Visualizzazione e selezione delle preghiere
- Esplorazione per categoria (Mattina, Domenica, Momento)
- Apertura modale con salvataggio immagine
- Espandibilità futura (email, feed, liturgia)

---

### STACK TECNOLOGICO

**Frontend:**
- **Next.js**: Routing semplice, performance elevate, SSR e SSG
- **TailwindCSS**: Utility-first styling, coerenza visiva, rapidità
- **shadcn/ui**: Componenti già stilizzati ma personalizzabili (Tabs, Dialog, Button, Card)
- **Lucide Icons**: Icone leggere, spirituali
- **Framer Motion**: Animazioni leggere per UI spirituale e viva

**Screenshot delle preghiere:**
- **html2canvas**: per generare immagine scaricabile da ogni preghiera

**Hosting & Deploy:**
- **Vercel**: Deploy continuo, supporto nativo per Next.js, dominio custom

---

### COMPONENTI DELLA PAGINA

1. **Header**
   - Simbolo ✝︎
   - Frase gancio: "Se stai leggendo questo, forse ti manca Dio"
   - CTA WhatsApp visibile

2. **Tabs**
   - Ogni Mattina / Ogni Domenica / Ogni Momento
   - Ogni tab carica preghiere relative

3. **Card**
   - Design pulito: bordo dorato chiaro, sfondo bianco, ✣ visivo
   - Click attiva un modale con preghiera centrata

4. **Dialog Modal**
   - Include: ✝︎, testo preghiera, fedelemessaggero.it
   - Pulsante "Salva come immagine"

5. **Dark Mode** (facoltativa)
   - Toggle ☀︎/☾ discreto in alto a destra

---
![[Pasted image 20250501144557.png]]
### ESPANSIONI FUTURE

- Sezione "Liturgia" con percorsi CEI
- Feed settimanale con highlights spirituali
- PWA (Progressive Web App) per notifiche e salvataggio offline
- Integrazione backend con Firebase o Supabase (archiviazione preghiere inviate, feedback, preferiti)

---

### NOTE TECNICHE
- Progetto pensato per svilupparsi in moduli (scalabilità verticale)
- Tutte le librerie scelte sono open-source
- Design mobile-first, ma perfettamente fruibile anche su desktop

---

**Conclusione:**
L’architettura tecnica è semplice, robusta, e spiritualmente coerente. Il codice è pensato per servire il messaggio, non oscurarlo.

