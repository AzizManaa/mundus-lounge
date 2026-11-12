import { adminAuthConfigured, getAdminSession } from "../../../lib/admin-auth";
import { listProducts, type SheetProduct } from "../../../lib/menu-sheet-admin";
import AdminLogin from "./login";
import MenuEditor from "./menu-editor";
import { getMessages } from "../../../i18n";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    const { error } = await searchParams;
    return <AdminLogin configured={adminAuthConfigured()} error={error} />;
  }
  let products: SheetProduct[] = [];
  let error = "";
  try {
    products = await listProducts();
  } catch {
    error =
      "No se pudo cargar la carta. Pulsa Actualizar para volver a intentarlo.";
  }
  return (
    <MenuEditor
      categoryLabels={getMessages("es").menu.categoryLabels}
      initialProducts={products}
      email={session.user!.email!}
      initialError={error}
      showLoyaltyLink={process.env.VERCEL_ENV !== "production"}
    />
  );
}
