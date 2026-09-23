# Menu editor setup

The website reads two published CSV tabs from one Google Sheet: the editable Spanish menu and its generated English translation. The client only edits the Spanish tab. The website refreshes each cached CSV at most once a minute.

## Create the Sheet

1. Edit menu items only in the Spanish source tab. The English tab uses formulas to translate text and copies prices and visibility.
2. Keep the existing column order and headers. The website accepts the client-friendly `Item name` and `Show online?` headers as well as the original `item` and `visible` names.
3. Uncheck `Show online?` to hide an item without deleting it. Keep generated tabs protected against accidental edits.
4. Publish each tab separately as CSV: **File → Share → Publish to web → select the tab → CSV**. Leave automatic republishing enabled.

## Connect the site

Set `MENU_SHEET_CSV_URL_ES` and `MENU_SHEET_CSV_URL_EN` to the corresponding published CSV links. For local development, put them in a root `.env` file (see `.env.example`); this file is ignored by Git. For Vercel, add the same two variables in the project's environment settings and redeploy. The old `MENU_SHEET_CSV_URL` variable is no longer used and can be removed. If a URL is missing or its feed is unavailable, the website uses the Spanish feed or bundled menu fallback as appropriate.

`/es/menu` uses the Spanish tab. `/en/menu` uses translated text from the English tab but takes prices and visibility from Spanish when the rows match. If an English text cell is blank or shows a formula error, the Spanish text is used for that cell. If the English tab is missing, has a different row count, or has mismatched prices or visibility, the whole English menu falls back to Spanish. The bundled menu remains the last fallback if neither published tab can be read.

A valid published tab with every item hidden displays an empty-menu message; it does not restore old bundled items.

When editing or adding rows, keep the translated tabs in the same row order as the Spanish tab. Check the two published CSV links before diagnosing a website update; Google publishing can lag behind a Sheet edit, followed by up to 60 seconds of website caching.
