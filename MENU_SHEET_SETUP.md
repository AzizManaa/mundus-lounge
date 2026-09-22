# Menu editor setup

The live site can read a Google Sheet published as a CSV. The client only edits rows in the Sheet; the site refreshes its cached menu at most once a minute.

## Create the Sheet

1. Download the current menu template from `/menu-template` on the deployed site.
2. In Google Sheets, create a Sheet and import that CSV.
3. Keep the first row unchanged. The available columns are:
   - `category`
   - `subcategory`
   - `item`
   - `description`
   - `price`
   - `bottle_price`
   - `shot_price`
   - `modifier`
   - `visible`
4. Use `true` or `false` in `visible`. A false row is hidden without being deleted.
5. Publish the sheet as a CSV in Google Sheets: **File → Share → Publish to web → CSV**.

## Connect the site

Set `MENU_SHEET_CSV_URL` in the Vercel Production environment to the published CSV URL, then redeploy once. The website keeps the bundled menu if the Sheet cannot be read.
