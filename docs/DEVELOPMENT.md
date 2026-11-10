# Development

## Requirements

- Node.js 22 or later
- Java 21 or later (required by the Firebase emulators)

## Running locally

```bash
npm install
npm install --prefix functions
npm run emulators
npm run seed
npm run dev
```

Run the emulators and the dev server in separate terminals, and run `seed` once the emulators
are up. It creates the fictional administrator `admin@example.com`. Emulator data is cleared
when they stop, so seed again after each restart. The emulator UI is at
<http://127.0.0.1:4000>.

The emulator does not send email. In development the login page shows the sign-in link
directly after you request one.

Development mode always uses the `demo-samfalligheten` project. Firebase treats `demo-*`
projects as local only, so development cannot reach production data.

## Sample data

The UI currently reads from `src/demo/`, an in-memory store with fictional data. Each phase
replaces its part of that store with Firestore. Delete `src/demo/` when the last part is
connected.

## Access control

- Sign-in uses email links. Anyone can request a link, so signing in alone grants nothing.
- Access needs both a `role` custom claim and a document in `boardMembers`. The security
  rules check the document, which is what ends access immediately when someone is removed.
- `boardMembers` is changed only through the Cloud Functions in `functions/src/index.ts`. The
  one exception is members marking their own first login, which clears `pending`.
- An account without a role is deleted right after sign-in, so no outsider's address is kept.
- The last administrator cannot be demoted or removed.

The first production administrator is created once, with credentials for the Firebase project:

```bash
GCLOUD_PROJECT=<project-id> node functions/scripts/create-admin.mjs <email> "<name>" --production
```

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run test:rules
npm run test:functions
npm run build
```

`test:rules` and `test:functions` start the emulators themselves, so stop any running emulators
first. CI runs all
of these checks.

## Production configuration

Production builds read `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET` and `VITE_FIREBASE_APP_ID`
from `.env.production`, which is not committed.

Create Firestore, Storage and Functions in the same EU region, for example `europe-north1`.
The Firestore region cannot be changed later.
