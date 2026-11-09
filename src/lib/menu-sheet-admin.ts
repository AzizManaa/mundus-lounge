import { createHash, createSign } from "node:crypto";

const headers = ["Category", "Subcategory", "Item name", "Description", "Price", "Bottle price", "Shot price", "Modifier", "Show online?", "Keep original name"];
type Cell = string | number | boolean;
export type SheetProduct = { row: number; version: string; values: Cell[] };
export const sheetConfigured = () => Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && process.env.MENU_SPREADSHEET_ID);
const version = (values: Cell[]) => createHash("sha256").update(JSON.stringify(values)).digest("hex");

async function token() {
  if (!sheetConfigured()) throw new Error("Google Sheets write access is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signer = createSign("RSA-SHA256"); signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"), "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  if (!response.ok) throw new Error("Google authentication failed. Check service account configuration.");
  return (await response.json()).access_token as string;
}
async function request(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.MENU_SPREADSHEET_ID!)}/values/${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error("Google Sheets request failed. Check workbook sharing and Sheets API access.");
  return response.json();
}
async function read(accessToken: string) {
  // Read underlying numbers and booleans, independent of cell formatting or locale.
  const result = await request(`${encodeURIComponent("'MENU_ES'!A1:J")}?valueRenderOption=UNFORMATTED_VALUE`, accessToken);
  const rows: Cell[][] = result.values ?? [];
  if (headers.some((header, index) => rows[0]?.[index] !== header)) throw new Error("The MENU_ES columns do not match the expected template.");
  return rows.slice(1).map((values, index) => ({ row: index + 2, values, version: version(values) }));
}
export async function listProducts() {
  return (await read(await token())).filter(product => String(product.values[2] ?? "").trim());
}
export async function saveProduct(input: { row?: number; version?: string; values: Cell[] }) {
  const accessToken = await token();
  const rows = await read(accessToken);
  if (!rows.some(product => product.values[0] === input.values[0])) throw new Error("Choose an existing category.");
  let range: string;
  if (input.row !== undefined) {
    const current = rows.find(product => product.row === input.row);
    if (!current || current.version !== input.version) throw new Error("This row changed. Reload products before editing it.");
    range = `'MENU_ES'!A${input.row}:J${input.row}`;
  } else {
    // Reuse blank template rows; checkbox values alone do not make a product.
    const empty = rows.find(product => product.values.slice(0, 8).every(value => value === ""));
    if (!empty) throw new Error("No empty template row available. Add blank rows in the sheet first.");
    range = `'MENU_ES'!A${empty.row}:J${empty.row}`;
  }
  await request(`${encodeURIComponent(range)}?valueInputOption=RAW`, accessToken, { method: "PUT", body: JSON.stringify({ values: [input.values] }) });
}
