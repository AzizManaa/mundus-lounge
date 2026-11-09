import { publicCard } from "../../../../lib/loyalty/store";
import { failure, json, readBody } from "../../../../lib/loyalty/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    return json(await publicCard(body.token));
  } catch (error) {
    return failure(error);
  }
}
