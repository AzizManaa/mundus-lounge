# Mundus VIP loyalty

Spanish web cards; staff awards one stamp per paid order using the scanner or manual confirmation. Seven stamps unlock one drink chosen by staff. Redeeming resets to zero. No expiry, customer login, till integration, messages or native Wallet integration.

## Local development and tests

Requires Node 22+ and Java 21+ for the emulator. No Google credentials are required for tests. Test suites clear their loopback demo emulator data after completion; they never reset the production project.

```sh
npm ci
npm run test:loyalty
```

For browser testing, start these in separate terminals:

```sh
npx --yes firebase-tools@15.35.0 emulators:start --only firestore --project demo-mundus-loyalty
```

```sh
FIRESTORE_EMULATOR_HOST=127.0.0.1:8086 LOYALTY_FIREBASE_PROJECT_ID=demo-mundus-loyalty npm run dev -- --port 3001
```

Existing local Google login configuration is still required for staff. Sign in at `/admin/loyalty` with an approved account. The emulator only permits `demo-` project IDs in app code; it is prohibited on Vercel. Preview deployments refuse all loyalty database access, even if credentials are accidentally inherited. Never expose the emulator beyond loopback.

## Production configuration

Separate Firebase project `mundus-vip-loyalty`, owned by nekodesk.dev@gmail.com; Spark with no billing linked. One default Standard/Native Firestore database in Madrid (`europe-southwest1`). The region cannot be changed after creation. Production rules must match `firestore.rules` (deny all browser access).

Use a dedicated service account with only `roles/datastore.user` in this project, not an Owner/Editor account and not the Sheets service account. Add only these variables to Vercel **Production**:

- `LOYALTY_FIREBASE_PROJECT_ID`
- `LOYALTY_FIREBASE_CLIENT_EMAIL`
- `LOYALTY_FIREBASE_PRIVATE_KEY` (PEM, real newlines or escaped `\n`)

Never put credentials in `NEXT_PUBLIC_` variables or commit a key. Keep JSON credentials outside the repo with mode 600. Keep local development on the emulator. Current authorized staff are controlled by the existing `MENU_ADMIN_ALLOWED_EMAILS`, not by Firebase Authentication.

Spark quotas can interrupt service; billing must remain unlinked. Paid backups, TTL and Functions are unused. See https://firebase.google.com/docs/firestore/quotas . Check Firestore Usage after launch. Existing Vercel limits/costs are separate.

## Operations and security

`/admin/loyalty` creates, finds and edits cards. `/vip/[token]` shows only the first name, balance and target. Staff API uses POST `/api/admin/loyalty` with `action`: list, detail, share, create, update, stamp, redeem, undo, replace or delete. Public POST `/api/loyalty/card` takes the token in its JSON body. Mutation bodies include an operation UUID and expected card revision; create/replace also include a cryptographically random 256-bit token from the browser. Customer lookup uses SHA-256 token hashes. Newly issued tokens are also encrypted with AES-256-GCM and bound to their card ID, allowing approved staff to reopen a QR/link without changing it. The key is derived with HKDF from the existing NEXTAUTH_SECRET, using a loyalty-specific context; no extra service or configuration is required. Plaintext tokens are not stored in Firestore. Requests are validated and reduced to the fields for their action before creating stable retry fingerprints.

Operations are transactional and idempotent. Successful retry receipts are checked before revision checks; different payloads cannot reuse an operation ID. Unknown outcomes stay in tab-local session storage and require explicit retry. If storage is blocked, the current tab keeps its retry record in memory; avoid reloading until an uncertain action is resolved. No offline queue. The authenticated staff scanner automatically submits one stamp per scan session, stops the camera on the first valid QR and opens the updated card. Unknown outcomes use the same operation ID for explicit retry; stale or inactive cards and cards at seven stamps are rejected by the server. Opening a QR URL with a normal camera only opens the read-only customer page; it never writes on navigation. Manual stamping and reward redemption still require confirmation.

When more than one camera is exposed by the browser, the staff scanner shows a camera selector. A successfully opened selection is remembered in localStorage for that browser/device. Missing saved cameras fall back to the default rear-facing camera. Camera names come from the browser; the app does not guess which lens is 1× or apply artificial zoom. Closing or switching stops the previous scan and camera stream.

Name search is accent-insensitive prefix search on the full name; phone search is a digit prefix (include the country code if saved). Results are bounded to 25; refine searches with more characters. The default list uses document-ID cursor pagination. Duplicate names/phones are allowed; staff verifies identity manually.

Customer links are bearer credentials, including QR screenshots. Staff verifies the customer and paid order. Staff can use “Mostrar QR y enlace” to open a modal containing the existing QR, link and share/copy control, including after refresh or on another staff device. Creating/replacing a link opens this modal automatically. Cards issued before encrypted token storage cannot have their original token recovered; staff must explicitly replace those links once, preserving stamps and invalidating the previous link. Link retrieval is staff-only, same-origin and no-store; list/detail/public responses never expose the encrypted value. Rotating NEXTAUTH_SECRET prevents decryption of existing saved tokens; their customer links remain valid, and staff can replace them to restore sharing. Avoid sharing staff screenshots or backups containing customer data. Hosting infrastructure/browser history may still record URLs; noindex/no-referrer are not authentication.

The latest stamp can be undone only until another balance-changing action happens. Undo is itself audited; it cannot repeatedly remove older stamps. Deactivate/reactivate preserves balances. Invalid, replaced and inactive customer links show the same unavailable state. No successful redemption is undone in v1.

Permanent deletion requires a confirmation naming the customer and warning that stamps, details and history cannot be recovered. Card and token lookup are deleted atomically with a retry receipt; recursive history cleanup completes before success is returned. An uncertain deletion can be retried with the same operation ID to finish cleanup. Minimal hashed operation receipts remain (signature, card ID/revision and timestamp, with no name, phone or activity) so delayed retries cannot recreate deleted cards. Deactivation remains the reversible option. Previous private exports may still contain deleted data and must be managed separately.

## Manual backup and recovery

Pause staff writes while exporting for a consistent snapshot. Load the three production variables into the current shell using a private credential manager or protected environment file; do not paste keys into shell history. Then:

```sh
npx tsx scripts/loyalty-backup.ts export /absolute/private/mundus-backup.json mundus-vip-loyalty
```

The export includes names, phones, token hashes, encrypted tokens, cards, activity and operation receipts. Preserve the associated NEXTAUTH_SECRET separately in a secure credential backup if recoverable sharing is needed after recovery. It is sensitive, created with mode 600, must be outside this repository, and must not be emailed or uploaded casually. The command refuses to overwrite an existing file. Keep a dated backup before administrative maintenance.

Recovery is for a database with empty loyalty collections, with the website offline and all writers stopped. Configure the destination project and its restricted credential, inspect the backup, and run:

```sh
npx tsx scripts/loyalty-backup.ts restore /absolute/private/mundus-backup.json DESTINATION_PROJECT_ID
```

The final argument must match the configured destination project. Restore refuses existing loyalty documents and uses create-only writes. It is chunked, not atomic across the full export: if interrupted, keep the site offline and recover into a new empty destination. It never purges existing data. Preserving token hashes keeps existing customer links valid if the website hostname is retained. Verify counts, a known card, its history and a duplicate operation receipt before pointing Production at a restored database. Test this procedure against the emulator before relying on a backup.

## Release checks

Run emulator tests, lint, typecheck and build. Verify `/vip/*`, `/admin/*` and API responses are private/no-store and noindex; sitemap excludes loyalty pages. Use a synthetic production customer (no real phone), test stamp/redemption/link replacement, and deactivate it after testing. Validate scanning and home-screen behavior on physical iPhone Safari and Android Chrome; desktop viewport testing is not a substitute. Do not issue real cards until production smoke testing succeeds.
