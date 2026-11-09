# Menu editor

Open `/admin` locally. `/admin-test` redirects there. The editor reads and writes the real `MENU_ES` tab; no database or separate translation service is used. New products default to hidden.

## Google sign-in

The stable NextAuth Google provider verifies the OAuth response and handles PKCE, state and CSRF protection. Only a Google profile with `email_verified: true` and an exact address in `MENU_ADMIN_ALLOWED_EMAILS` may sign in. The server checks the current allowlist again before rendering products and on every editor API request. Removing an address and redeploying blocks its existing sessions too.

Sessions use NextAuth's default encrypted, HttpOnly, SameSite=Lax cookies, with Secure cookies on the production HTTPS URL. Sessions last eight hours and can be ended with Salir. There is no password form, bearer-key fallback, registration endpoint, database adapter or Google token stored in the client session. Google login requests only `openid email profile`; workbook access still uses the server's service account.

Configure these server-only environment variables locally and in Vercel:

- `NEXTAUTH_URL`: `http://localhost:3001` locally; `https://munduslounge.com` in production.
- `NEXTAUTH_SECRET`: unique cryptographically random secret of at least 32 characters. Generate with `openssl rand -base64 32`; never commit it. Rotating it ends existing sessions.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: from a Google OAuth client of type Web application.
- `MENU_ADMIN_ALLOWED_EMAILS`: comma-separated exact approved Google addresses. Empty configuration grants no access. Never use a domain-wide match.

Register these exact authorized redirect URIs in Google Cloud:

- `http://localhost:3001/api/auth/callback/google`
- `https://munduslounge.com/api/auth/callback/google`

Use the canonical production domain for login, not Vercel preview URLs. Do not expose production editor secrets to untrusted preview deployments. In Google's Testing mode, keep the test-user list aligned with the approved accounts; it is an additional provider restriction, not a replacement for server authorization. Test removal, blocked accounts and sign-out before rollout. Enable two-step verification on editor Google accounts.

## Google Sheets setup

1. Enable the Google Sheets API in the Google Cloud project.
2. Create a service account and a JSON key. Keep the key outside the repository.
3. Share only the menu workbook with the service account email as Editor. Writes target only MENU_ES.
4. Configure `MENU_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`. Copy `client_email` and `private_key` from the JSON key into the corresponding server variables. Never use NEXT_PUBLIC_ for credentials.

The workbook ID is `18Ijk5iJ5znSgPBJ-xqWyUtGpfv207LZwg1OXalKcADA`.

## Verification and remaining write limitation

Sign in, select an existing product, and verify the loaded fields against MENU_ES. Save an intentional edit, then verify the row in Sheets. Add a hidden test product, verify its translations, then clear the test row in Sheets. Do not publish fake products on the public menu.

Reads use UNFORMATTED_VALUE so prices are numbers regardless of cell formatting. All writes use RAW input so text beginning with `=` is stored as text. Edits use a row fingerprint and reject a row that moved or changed after loading. No rows are inserted or deleted, preserving translation formula ranges. Adds reuse a blank template row, ignoring checkbox values when identifying blanks.

Writes are still for one editor at a time. The read/check/write sequence is not a distributed lock; simultaneous adds could select the same empty row. Coordinate writes before enabling concurrent editing. Existing headers and published feed URLs remain unchanged.
