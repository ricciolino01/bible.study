# Libri della Bibbia (PWA)
## Pubblicare gratis su GitHub Pages
1. Crea un account su github.com. 2. New repository (pubblico, es. "bibbia"). 3. Add file > Upload files: carica TUTTI i file della cartella (index.html, style.css, app.js, books.json, sw.js, manifest.webmanifest) e, se è la prima volta, anche la cartella icons. Commit changes.
4. Settings > Pages > Deploy from a branch > main / (root) > Save. Dopo ~1 minuto trovi il link in alto.
Alternative: Netlify Drop (app.netlify.com/drop, trascina la cartella) oppure Cloudflare Pages > Upload assets.
## Installare sull'iPhone
Apri il link con Safari > Condividi > Aggiungi a Home. Prova offline: apri l'app una volta con la rete, attiva la modalità aereo, riaprila dall'icona.
## Aggiornare
1. Modifica prospetto_libri.xlsx (stesse colonne). 2. Esegui `python3 converti_excel.py` (serve `pip install openpyxl`): rigenera books.json e stampa un riepilogo.
3. In sw.js incrementa la versione (bibbia-v8 > bibbia-v9). 4. Ricarica i file su GitHub. 5. Sul telefono apri l'app due volte; in fondo alla Home leggi "Versione app".
Icone: icons/icon.svg è l'originale; i PNG (180, 192, 512) sono già pronti. Per rigenerarli converti l'SVG con un qualsiasi convertitore SVG > PNG.
