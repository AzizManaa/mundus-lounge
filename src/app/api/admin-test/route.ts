import { getAdminSession } from "../../../lib/admin-auth";
import { listProducts, saveProduct, sheetConfigured } from "../../../lib/menu-sheet-admin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: "Tu sesión ha caducado o no tienes acceso. Vuelve a iniciar sesión con Google." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!sheetConfigured()) return Response.json({ error: "Google Sheets write access is not configured yet. Follow docs/menu-admin-test.md." }, { status: 503 });
  try {
    const body = await request.json();
    if (body.action === "list") return Response.json({ products: await listProducts() });
    if (body.action !== "save" || !Array.isArray(body.values) || body.values.length !== 10) throw new Error("Invalid product.");
    const values = body.values;
    for (const index of [0, 1, 2, 3, 7]) if (typeof values[index] !== "string" || values[index].length > 2000) throw new Error("Invalid text field.");
    if (!values[0].trim() || !values[2].trim()) throw new Error("Category and product name are required.");
    for (const index of [4, 5, 6]) if (values[index] !== "" && (typeof values[index] !== "number" || !Number.isFinite(values[index]) || values[index] < 0 || values[index] > 10000)) throw new Error("Prices must be numbers between 0 and 10000.");
    if (typeof values[8] !== "boolean" || typeof values[9] !== "boolean") throw new Error("Invalid product switches.");
    if (body.row !== undefined && (!Number.isInteger(body.row) || body.row < 2 || typeof body.version !== "string")) throw new Error("Invalid row.");
    await saveProduct({ row: body.row, version: body.version, values });
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save product." }, { status: 400 });
  }
}
