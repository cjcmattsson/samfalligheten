# Development

## Requirements

- Node.js 22 or later
- Java 21 or later (required by the Firebase emulators)

## Running locally

```bash
npm install
npm run emulators
npm run dev
```

Run the emulators and the dev server in separate terminals. The emulator UI is at
<http://127.0.0.1:4000>.

Development mode always uses the `demo-samfalligheten` project. Firebase treats `demo-*`
projects as local only, so development cannot reach production data.

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run test:rules
npm run build
```

`test:rules` starts the emulators itself, so stop any running emulators first. CI runs all
of these checks.

## Production configuration

Production builds read `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET` and `VITE_FIREBASE_APP_ID`
from `.env.production`, which is not committed.

Create Firestore, Storage and Functions in the same EU region, for example `europe-north1`.
The Firestore region cannot be changed later.
