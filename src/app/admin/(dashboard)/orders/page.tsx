import { redirect } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/auth";
import OrdersPageClient from "./OrdersPageClient";

export default async function OrdersPage() {
  const session = await requireSuperAdminSession();
  if (!session) {
    redirect("/admin");
  }

  return <OrdersPageClient />;
}
