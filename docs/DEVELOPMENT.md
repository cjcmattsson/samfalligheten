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

The production web config is in `src/lib/firebase.ts`. It is public by design (it only names
the project); access is controlled by the security rules.

Production regions (fixed, cannot be changed):

- Firestore and Functions: `europe-north2` (Stockholm).
- Files: the bucket `samfalligheten-710db-se` in `europe-north2` (Stockholm). It was created in
  Google Cloud and imported into Firebase, because the Firebase console does not offer Stockholm.
- The project's default bucket `samfalligheten-710db.firebasestorage.app` is in `europe-north1`
  (Finland). It is not used, and `storage-unused.rules` keeps it locked.

`firebase.json` deploys storage rules per target. The targets map to buckets in `.firebaserc`
(`main` and `unused`, for both the production and the emulator project).

## Shareable demo

`npm run build:demo -- <output.html>` builds a single self-contained page with the fictional
sample data. The portal opens without sign-in, nothing is sent to Firebase, and downloads are
turned off. It is meant for showing the design to others, for example as a Claude artifact.

`npm run deploy:demo` publishes the same demo to Firebase Hosting in the production project,
at <https://samfalligheten-710db.web.app>. The real site replaces it there once it is ready.
