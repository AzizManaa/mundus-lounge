import { getAdminSession } from "../../../../lib/admin-auth";
import {
  cardDetail,
  listCards,
  mutateCard,
} from "../../../../lib/loyalty/store";
import { failure, json, readBody } from "../../../../lib/loyalty/http";
import { LoyaltyError, type Command } from "../../../../lib/loyalty/types";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session)
      return json({ error: "Tu sesión ha caducado o no tienes acceso." }, 401);
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return json({ error: "Origen no válido." }, 403);
    const body = await readBody(request);
    if (body.action === "list")
      return json(await listCards(body.search, body.cursor));
    if (body.action === "detail")
      return json(await cardDetail(body.id, body.token));
    if (typeof body.action !== "string")
      throw new LoyaltyError(400, "Operación no válida.");
    return json(await mutateCard(body as Command, session.user!.email!));
  } catch (error) {
    return failure(error);
  }
}
