import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { adminAuthConfigured, authOptions } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
const handler = NextAuth(authOptions);

type Context = { params: Promise<{ nextauth: string[] }> };
async function auth(request: NextRequest, context: Context) {
  if (!adminAuthConfigured()) {
    return Response.json({ error: "El acceso con Google aún no está configurado." }, { status: 503 });
  }
  return handler(request, context);
}
export { auth as GET, auth as POST };
