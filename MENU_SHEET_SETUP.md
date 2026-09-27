# Menu editor setup

The website reads five published CSV tabs from one Google Sheet: Spanish, English, Catalan, French, and Russian. The client only edits the Spanish source tab; translated tabs use formulas. The website refreshes each cached CSV at most once a minute.

## Create the Sheet

1. Edit menu items only in the Spanish source tab. Translated tabs use formulas to translate text and copy prices and visibility.
2. Keep the existing column order and headers. The website accepts the client-friendly `Item name` and `Show online?` headers as well as the original `item` and `visible` names.
3. Uncheck `Show online?` to hide an item without deleting it. Keep generated tabs protected against accidental edits.
   Check `Keep original name` in the Spanish source to preserve a product, cocktail or brand name in all translated tabs. Leave it unchecked for names that should translate. Descriptions translate independently. The name formulas cover the whole source column; copy checkbox validation when adding rows beyond the prepared range.
4. Publish each tab separately as CSV: **File → Share → Publish to web → select the tab → CSV**. Leave automatic republishing enabled.

## Connect the site

Set `MENU_SHEET_CSV_URL_ES`, `MENU_SHEET_CSV_URL_EN`, `MENU_SHEET_CSV_URL_CA`, `MENU_SHEET_CSV_URL_FR`, and `MENU_SHEET_CSV_URL_RU` to the corresponding published CSV links. For local development, put them in a root `.env` file (see `.env.example`); this file is ignored by Git. For Vercel, add all five variables in the project's environment settings and redeploy. The old `MENU_SHEET_CSV_URL` variable is no longer used and can be removed.

Menu routes are `/es/menu`, `/en/menu`, `/ca/menu`, `/fr/menu`, and `/ru/menu`. The homepage remains available only at `/es` and `/en`; other menu languages link back to `/es`.

Spanish owns internal category names, prices and visibility. The selected language supplies translated item text and category display names. Fixed interface labels are translated in the project. If a translated cell is blank or shows a formula error, Spanish text is used for that cell. If a translated tab is missing, has a different row count, or mismatched prices or visibility, the menu falls back to the Spanish feed. If the Spanish feed is unavailable, the bundled menu is used rather than potentially stale operational values from a translated tab.

A valid published tab with every item hidden displays an empty-menu message; it does not restore old bundled items.

When editing or adding rows, keep translated tabs in the same row order as Spanish. Check the Spanish and selected-language CSV links before diagnosing a website update; Google publishing can lag behind a Sheet edit, followed by up to 60 seconds of website caching. Language switching preserves the category query parameter.
