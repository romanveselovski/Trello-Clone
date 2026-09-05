import { PlanProvider } from "@/features/dashboard/contexts/PlanContext";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { has } = await auth();
  const user = await currentUser();
  const metaPlan = user?.publicMetadata?.plan;
  const isAdmin = user?.publicMetadata?.role === "admin";

  const hasProPlan =
    isAdmin ||
    metaPlan === "pro_user" ||
    has({ plan: "pro_user" });
  const hasEnterprisePlan =
    isAdmin ||
    metaPlan === "enterprise_user" ||
    has({ plan: "enterprise_user" });

  return (
    <PlanProvider hasProPlan={hasProPlan} hasEnterprisePlan={hasEnterprisePlan}>
      {children}
    </PlanProvider>
  );
}
