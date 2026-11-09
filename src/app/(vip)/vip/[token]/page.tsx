import { getAdminSession } from "../../../../lib/admin-auth";
import { publicCard } from "../../../../lib/loyalty/store";
import { LoyaltyError } from "../../../../lib/loyalty/types";
import VipCard from "./vip-card";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getAdminSession();
  let initialCard = null;
  let initialError = "";
  try {
    initialCard = await publicCard(token);
  } catch (e) {
    initialError =
      e instanceof LoyaltyError
        ? e.message
        : "Saldo no disponible. Vuelve a intentarlo.";
  }
  return (
    <VipCard
      key={token}
      token={token}
      staff={!!session}
      initialCard={initialCard}
      initialError={initialError}
    />
  );
}
