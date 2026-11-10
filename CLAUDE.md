# Samfälligheten – webbplats & styrelseportal

En enkel webbplats och styrelseportal för en samfällighetsförening, byggd för att ersätta nuvarande Google Sites-sida.
Inspiration: gemensamheten.se (publik hemsida + styrelseportal), men smalare och anpassad efter vår styrelse.

## Viktigaste principerna (läs först)

1. **Enkelt att lämna över.** Utvecklaren (Christopher) kan flytta eller lämna styrelsen. Allt ska kunna förvaltas av en icke-teknisk styrelseledamot via appens eget gränssnitt – ingen ska behöva öppna Firebase-konsolen i vardagen.
2. **GDPR först.** Medlemsregistret är personuppgifter. Minimera data, minimera åtkomst, gör radering enkel.
3. **Så få tredjeparter som möjligt.** Allt ska ligga hos Google (Firebase + föreningens Google Workspace). Lägg ALDRIG till en ny extern tjänst, SDK eller analysverktyg utan att fråga först.
4. **Tråkig, standardiserad teknik.** Hellre lite kod som vem som helst förstår än smarta abstraktioner. Få beroenden.
5. **Data ska alltid gå att exportera.** Ingen inlåsning.

## Stack

- **Frontend:** Vite + React + TypeScript, React Router, Tailwind CSS. Ren SPA (ingen SSR).
- **Firebase Hosting** – serverar både publik sida och portal.
- **Firebase Auth** – endast för styrelsen. Inloggning via e-postlänk (passwordless) och valfritt Google. Ingen öppen registrering: bara e-postadresser som finns i allowlist (`boardMembers`) får logga in.
- **Cloud Firestore** – all strukturerad data. **EU-region** (t.ex. `europe-north1`), samma region för Storage och Functions. Regionen kan inte ändras i efterhand.
- **Cloud Storage for Firebase** – dokumentarkiv (PDF:er) och nyhetsbilder.
- **Cloud Functions (2nd gen, TypeScript)** – mejlutskick och admin-operationer (sätta roller via custom claims, radera medlem).
- **Mejl:** Nodemailer via föreningens Google Workspace-konto (t.ex. `info@<föreningens-domän>`). Inloggningsuppgifter lagras som Functions-secret, aldrig i koden.
- **Firebase Emulator Suite** för all lokal utveckling.
- INTE: Google Analytics, tracking, cookies-banners-behövande skript, externa mejltjänster, externa databaser.

## Funktioner

### Publik webbplats (ingen inloggning)
- Startsida, informationssidor (Boende, Gemensamt, Samfälligheten, Avgifter m.m. – motsvarar dagens Google Sites-innehåll).
- Nyheter (lista + enskild nyhet, omslagsbild).
- Publika dokument (stadgar, protokoll som styrelsen valt att publicera).
- Kontaktuppgifter till styrelsen (endast det styrelsen valt att visa).
- Integritetspolicy-sida.
- Mobilvänlig, tillgänglig (semantisk HTML, kontrast, tangentbordsnavigering).

### Styrelseportal (inloggad)
- **Översikt:** senaste nyheter, kommande uppgifter i årshjulet, senaste dokument.
- **Nyheter:** skapa/redigera/publicera med enkel rich text-editor (välj ett litet, välkänt bibliotek – fråga först). Valfritt: skicka nyheten som mejl till medlemmar.
- **Utskick:** mejla medlemmar utan nyhetspost (t.ex. "vattnet stängs av torsdag").
- **Dokument:** mappar, uppladdning med drag-and-drop, PDF-förhandsvisning, flagga publik/intern.
- **Medlemsregister:** lista, sök, lägg till/redigera, CSV-import och CSV-export, radera/anonymisera vid försäljning.
- **Årshjul:** återkommande uppgifter per månad (inkl. stämmoprocessen), status som kan nollställas inför nytt verksamhetsår.
- **Sidor:** redigera innehållet på de publika informationssidorna.
- **Inställningar:** hantera styrelsemedlemmar (bjud in/ta bort, roll), föreningsuppgifter.
- **Exportera allt:** en knapp som ger medlemmar (CSV) + all text (JSON) + dokument (zip).

## Datamodell (Firestore, utgångspunkt – får justeras)

- `boardMembers/{uid}` – namn, e-post, roll (`admin` | `board`), aktiv. Roll speglas i custom claims.
- `members/{id}` – namn, fastighetsbeteckning/adress, e-post, telefon (valfritt), `emailOptOut`, `unsubscribeToken`, skapad/ändrad.
- `news/{id}` – titel, brödtext, omslagsbild, `status` (draft/published), publiceringsdatum, `mailedAt`.
- `mailings/{id}` – ämne, text, avsändare, skickad tid, antal mottagare, antal studsar. **Spara inte mottagarlistan permanent.**
- `documents/{id}` – titel, mapp, storage-path, `public: boolean`, uppladdad av/när.
- `folders/{id}` – namn, ordning.
- `pages/{slug}` – titel, innehåll, ordning, synlig i meny.
- `yearTasks/{id}` – titel, månad, beskrivning, status, kategori (t.ex. `stamma`).
- `settings/association` – föreningsnamn, kontaktuppgifter, färgtema.

## Säkerhet & GDPR – krav

- Firestore- och Storage-regler: deny by default. Publik läsning endast av publicerade nyheter, publika dokument och sidor. `members` och `mailings` endast läsbara för inloggad styrelse.
- Skriv **tester för säkerhetsreglerna** (`@firebase/rules-unit-testing`) och kör dem i CI.
- Medlemmar har inga konton. Endast styrelsen finns i Firebase Auth.
- Mejlutskick skickas **individuellt** per mottagare (aldrig synliga adresser i Till/Kopia), med avregistreringslänk i varje mejl.
- Radering av medlem ska ta bort all personinfo (inte bara flagga).
- Borttagen styrelseledamot förlorar åtkomst direkt (ta bort claims + revoke tokens).
- Ingen riktig medlemsdata i repot, seeds eller tester – använd påhittad testdata.
- Inga hemligheter i repot. `.env*` i `.gitignore`. Secrets via `firebase functions:secrets:set`.
- Inga loggar med personuppgifter i Functions.

## Arbetssätt

- **UI-texter på svenska**, kod, variabelnamn och commit-meddelanden på engelska.
- Små, fokuserade commits. Kör typecheck, lint och tester innan commit.
- Utveckla mot emulatorerna, aldrig mot produktionsprojektet.
- Fråga innan du lägger till nya npm-beroenden som inte redan nämns här.
- Håll komponenterna enkla; ingen global state-manager om det inte behövs (React Query eller enkla hooks mot Firestore räcker).
- Uppdatera `README.md` (för icke-tekniker: vad finns var, vem äger vad, vad gör man om något slutar fungera) och `docs/DEVELOPMENT.md` (för utvecklare) när något ändras.

## Faser

1. **Grund:** repo, Vite + React + TS + Tailwind, Firebase-init, emulatorer, routing, layout för publik sida och portal.
2. **Auth:** e-postlänk-inloggning, allowlist, roller, skyddade routes.
3. **Publik sida + nyheter + sidor** (migrera innehållet från Google Sites).
4. **Dokumentarkiv.**
5. **Medlemsregister** inkl. CSV-import/export och radering.
6. **Mejlutskick** via Functions + Workspace, avregistrering, studshantering.
7. **Årshjul.**
8. **Exportera allt**, integritetspolicy, README för överlämning, deploy.

## Ägarskap

- GitHub: börjar i Christophers privata repo, flyttas senare till en GitHub-organisation som ägs av föreningen.
- Firebase-projekt, domän och Workspace ägs av föreningens Google-konto. Utvecklare bjuds in som medlemmar.

## Kommandon (fylls i när projektet är uppsatt)

- `npm run dev` – frontend mot emulatorer
- `npm run emulators` – starta Firebase-emulatorer
- `npm run seed` – skapa påhittad admin i emulatorerna
- `npm run test` / `npm run test:rules` / `npm run test:functions`
- `npm run build` / `firebase deploy`
