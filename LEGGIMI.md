# Keter · כֶּתֶר — App per il telefono (PWA)

Questa cartella contiene Keter trasformato in Progressive Web App: una volta
pubblicata su GitHub Pages, la installi sul tuo Android e si apre a schermo
intero come una vera app, funziona anche offline, e **le modifiche si salvano
da sole sul telefono** (localStorage) — l'export/import JSON resta come backup.

## Contenuto

| File | Cosa fa |
|---|---|
| `index.html` | pagina principale: carica librerie, icone, dati e app |
| `app.jsx` | il codice di Keter (identico alla versione artifact, adattato) |
| `data.js` | lessico (6.177 voci), testi e articoli |
| `manifest.webmanifest` | nome, colori e icone dell'app |
| `sw.js` | service worker: uso offline e aggiornamenti |
| `icon-*.png` | icone (corona d'oro su verde bosco) |

## 1 — Pubblicazione su GitHub Pages (una volta sola)

1. Crea un account gratuito su **github.com** (se non lo hai già).
2. In alto a destra: **+** → **New repository**. Nome: `keter`. Lascia
   **Public** e premi **Create repository**.
3. Nella pagina del repository: **uploading an existing file** (link nel
   riquadro iniziale). Trascina dentro **tutti gli 8 file** di questa
   cartella e premi **Commit changes**.
4. Vai su **Settings** → **Pages** (menu a sinistra). Sotto *Build and
   deployment*: Source = **Deploy from a branch**, Branch = **main** e
   cartella **/ (root)**. Premi **Save**.
5. Dopo 1-2 minuti l'app è online all'indirizzo:
   `https://TUONOME.github.io/keter/`

## 2 — Installazione sul telefono Android

1. Apri l'indirizzo qui sopra in **Chrome**.
2. Menu **⋮** → **Aggiungi a schermata Home** (o "Installa app").
3. Conferma: l'icona con la corona compare tra le tue app. Da lì Keter si
   apre a schermo intero, anche senza connessione.

## 3 — Estrazione testo da PDF/immagini

Fuori dall'ambiente Claude questa funzione richiede una **chiave API
Anthropic personale**. Si crea su `console.anthropic.com` → API keys
(l'uso si paga a consumo, centesimi per estrazione). La prima volta che
usi la funzione, l'app te la chiede e la salva **solo sul tuo telefono**.
Tutto il resto dell'app funziona senza chiave.

## 4 — Aggiornare l'app nelle prossime sessioni

Il flusso con Claude resta lo stesso: lavori sul file, e alla fine della
sessione Claude ti prepara i file aggiornati (di solito solo `app.jsx` e/o
`data.js`). Su GitHub: apri il file → icona **matita/Upload** → sostituisci
→ **Commit**. Alla prossima apertura l'app si aggiorna da sola (il service
worker scarica sempre la versione più recente quando c'è rete).

## Nota sui salvataggi

Le modifiche alle voci e i nuovi testi si salvano nel browser del telefono.
Se cancelli i dati di navigazione di Chrome, si perdono: per sicurezza usa
ogni tanto il pulsante di **export JSON** dentro l'app, come hai sempre
fatto — così Claude può fondere le modifiche nel file in modo permanente.
