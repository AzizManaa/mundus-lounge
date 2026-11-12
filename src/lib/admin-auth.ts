import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function isAdminEmail(email: unknown): email is string {
  if (typeof email !== "string" || !email.trim()) return false;
  const allowed = (process.env.MENU_ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function adminAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.NEXTAUTH_URL && (process.env.NEXTAUTH_SECRET?.length ?? 0) >= 32 &&
    process.env.MENU_ADMIN_ALLOWED_EMAILS?.split(",").some(email => email.trim()),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    authorization: { params: { prompt: "select_account" } },
  })],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin", error: "/admin" },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "google" && !!profile &&
        "email_verified" in profile && profile.email_verified === true && isAdminEmail(profile.email);
    },
  },
};

export async function getAdminSession() {
  if (!adminAuthConfigured()) return null;
  const session = await getServerSession(authOptions);
  // Recheck approval on every request, including sessions issued before an account was removed.
  return isAdminEmail(session?.user?.email) ? session : null;
}
