# WerfKompas Assistent

Mobiele app voor ploegbazen van Suerickx Flooring: dagregistraties,
dauwpunt/vochtberekening, Startwerkbespreking (SWB), LMRA, aanrijdingsformulier
en planning-inzage. Tegenhanger van
[WerfKompas Beheer](https://github.com/SuerickxFlooring/werfkompas-beheer),
de beheerapplicatie die kantoor gebruikt.

## Hosting & deploy

Anders dan de Beheer-app draait deze app wél rechtstreeks vanaf dit repo: elke
push naar `main` wordt automatisch live gepubliceerd via **GitHub Pages** op
`https://suerickxflooring.github.io/vloerapp/`. Er is dus geen aparte
deploy-stap — een commit + push naar `main` is meteen zichtbaar voor de
ploegbazen. Wees hier voorzichtig mee: dit is een live app die dagelijks op
de werf gebruikt wordt.

## Techstack

Bewust framework-loos: één groot `index.html`-bestand (HTML, CSS en
JavaScript samen), geen build-stap, geen package.json. Externe libraries via
CDN `<script>`-tags (Supabase JS client, jsPDF + html2canvas voor
PDF-generatie).

- **Backend / database**: [Supabase](https://supabase.com) (Postgres + Auth
  + Storage), zelfde project als waar WerfKompas Beheer sommige gegevens
  (o.a. Startwerkbespreking, planning) mee deelt. De app gebruikt enkel de
  **publieke anon key** — normaal voor Supabase, toegang wordt afgedwongen
  via Row Level Security, niet door de key geheim te houden. De sleutel kan
  via het instellingen-scherm (tandwiel-icoon) in de app zelf overschreven
  worden; gebruik daar **nooit** de `service_role`-key.
- **PWA**: installeerbaar op het beginscherm van een smartphone/tablet via
  `manifest.json` + `sw.js` (service worker, cachet de app voor offline
  gebruik op de werf).

## Structuur van `index.html`

Alles zit in één bestand, maar de `<script>`-sectie is opgedeeld in
duidelijk gemarkeerde blokken:

```
// ═══════════════════════════════════════════════════════════
// SECTIENAAM
// ═══════════════════════════════════════════════════════════
```

Zoek (Ctrl+F) op zo'n sectienaam om snel naar een onderdeel te springen —
zie de "Kaart van het bestand"-comment bovenaan de `<script>`-tag voor het
volledige overzicht met een korte uitleg per sectie.

## Doelgroep / apparaten

Ploegbazen gebruiken voorlopig hun eigen smartphone (klein scherm) om de app
te openen — test nieuwe schermen dus op smartphone-breedte (~320-375px), niet
enkel op desktop.

## Lokaal testen

Geen build-stap nodig — open `index.html` gewoon in een browser, of serveer
de map met een simpele static server (bv. `npx serve .`). Login loopt via
Supabase Auth, dus lokaal testen vereist geldige gebruikersgegevens in
dezelfde Supabase-projectdatabase als productie.

## Licentie

Proprietary — zie [LICENSE](./LICENSE). Enkel voor intern gebruik bij
Suerickx Flooring.
