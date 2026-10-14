# Frizerski salon STIL — sajt

Statički sajt (HTML, CSS, vanilla JavaScript), bez build koraka i bez biblioteka.

## Struktura
- `index.html` — početna (Ženski frizer, Muški frizer, Šminka, Cenovnik, Preparati, Novosti, Galerija, O nama, Kontakt)
- `cenovnik.html` — kompletan cenovnik (važi od 1. 9. 2026)
- `css/style.css` — svi stilovi; boje i fontovi su promenljive u `:root` na vrhu fajla
- `js/main.js` — mobilni meni, „sada otvoreno/zatvoreno“ (po vremenu u Nišu), aktivna stavka menija, animacije, dugme „na vrh“
- `img/` — logo i fotografije sa Instagrama

## Postavljanje
Ceo folder otpremite na hosting (npr. u `public_html`). Nije potreban server-side kod.

## Izmene
- **Radno vreme:** objekat `HOURS` u `js/main.js` i tabela u sekciji Kontakt u `index.html`.
- **Cene:** `cenovnik.html` (i izdvojene cene u sekciji Cenovnik na početnoj).
- **Akcentna boja:** `--accent` u `css/style.css`.
