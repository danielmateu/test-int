import { getCVs } from "@/app/actions/cv";
// import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const cvs = await getCVs();

  return (
    <DashboardClient
      initialCvs={cvs}
      userName={session.user.name || "Usuario"}
      userImage={session.user.image}
    />
  );
}
