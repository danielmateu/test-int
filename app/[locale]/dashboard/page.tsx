import { getCVs } from "@/app/actions/cv";
// import { DashboardClient } from "./DashboardClient";
import { redirect } from "@/i18n/routing";
import { auth } from "@/auth";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const cvs = await getCVs();

  return (
    <DashboardClient
      initialCvs={cvs}
      userName={session?.user?.name || "Usuario"}
      userImage={session?.user?.image}
    />
  );
}
