import { LoyaltyError } from "./types";
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: privateHeaders });
}
export function failure(error: unknown) {
  return error instanceof LoyaltyError
    ? json({ error: error.message }, error.status)
    : json(
        { error: "No se pudo confirmar la operación. Vuelve a intentarlo." },
        503,
      );
}
export async function readBody(request: Request) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new LoyaltyError(415, "Formato no válido.");
  // Bound the stream as well as Content-Length, which may be absent or inaccurate.
  const reader = request.body?.getReader();
  if (!reader) throw new LoyaltyError(400, "Solicitud vacía.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new LoyaltyError(413, "Solicitud demasiado grande.");
    }
    chunks.push(value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new LoyaltyError(400, "Solicitud no válida.");
  }
}
