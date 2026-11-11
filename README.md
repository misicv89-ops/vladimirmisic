# Studio Vladimir Mišić — portfolio sajt

Statičan sajt, spreman za GitHub Pages. Jedna stranica radi i na desktopu i na mobilnom (responsive), na srpskom i engleskom (prekidač SRB / ENG u navbaru).

## Fajlovi
- `index.html` — ceo sajt (podrazumevano na srpskom)
- `i18n.js` — svi tekstovi na srpskom i engleskom
- `site.js` — animacije, meni, horizontalni portfolio, promena jezika, kontakt forma
- `portfolio/` — screenshotovi radova i portret
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `logo.png`, `og-image.jpg`
- `CNAME` (vladimirmisic.rs), `robots.txt`, `sitemap.xml`

## Objava na GitHub Pages
1. Napravi repozitorijum (npr. `vladimirmisic.rs`) i ubaci SVE fajlove i folder `portfolio` u root.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
3. Domen: fajl `CNAME` već sadrži `vladimirmisic.rs`. Kod registra domena podesi DNS:
   - A zapisi za `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME za `www` → `<tvoj-github-username>.github.io`
   Zatim u Settings → Pages uključi *Enforce HTTPS*.
   Ako još nemaš domen, obriši `CNAME` i sajt će raditi na `https://<username>.github.io/<repo>/`.

## Kontakt forma
Upiti stižu na misicv89@gmail.com preko FormSubmit-a. Posle prvog probnog slanja sa objavljenog sajta stiže mail „Activate Form“ — klikni ga jednom (proveri i Spam). Adresa se menja u `site.js` (konstanta `TO`).

## Izmene tekstova
Tekstovi su u `i18n.js` (`sr` / `en`). Isti srpski tekst stoji i u `index.html` zbog pretrage (SEO) — ako menjaš srpski tekst, promeni ga na oba mesta.
