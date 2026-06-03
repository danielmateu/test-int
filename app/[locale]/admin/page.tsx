import { checkAdminOrRedirect } from "@/lib/admin";
import { getAdminStats, getAdminUsers } from "@/app/actions/admin";
import { AdminClient } from "./AdminClient";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // checkAdminOrRedirect redirigirá al usuario a /[locale]/dashboard si no es admin
  const session = await checkAdminOrRedirect(locale);

  // Obtener estadísticas y listado inicial
  const stats = await getAdminStats();
  const initialUsers = await getAdminUsers();

  return (
    <AdminClient
      initialStats={stats}
      initialUsers={initialUsers}
      adminName={session?.user?.name || "Administrador"}
      adminImage={session?.user?.image}
    />
  );
}
