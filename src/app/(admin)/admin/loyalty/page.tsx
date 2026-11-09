import {
  adminAuthConfigured,
  getAdminSession,
} from "../../../../lib/admin-auth";
import { safeReturnPath } from "../../../../lib/loyalty/types";
import AdminLogin from "../login";
import { cardDetail, listCards } from "../../../../lib/loyalty/store";
import { LoyaltyError } from "../../../../lib/loyalty/types";
import LoyaltyEditor from "./loyalty-editor";
export const metadata = { title: "Tarjetas VIP | Mundus Lounge" };
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; card?: string }>;
}) {
  const params = await searchParams;
  const session = await getAdminSession();
  const returnTo = safeReturnPath(
    "/admin/loyalty" +
      (params.token
        ? `?token=${params.token}`
        : params.card
          ? `?card=${params.card}`
          : ""),
  );
  if (!session)
    return (
      <AdminLogin configured={adminAuthConfigured()} returnTo={returnTo} />
    );
  let initial;
  try {
    initial =
      params.token || params.card
        ? await cardDetail(params.card, params.token)
        : await listCards();
  } catch (e) {
    initial = {
      error:
        e instanceof LoyaltyError
          ? e.message
          : "No se pudo cargar la fidelización. Pulsa Actualizar.",
    };
  }
  return <LoyaltyEditor email={session.user!.email!} initial={initial} />;
}
