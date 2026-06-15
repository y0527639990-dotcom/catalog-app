import { redirect } from "next/navigation";
import CatalogLoader from "@/components/CatalogLoader";
import { requireStoreSession } from "@/lib/auth";

export default async function CatalogPage() {
  const session = await requireStoreSession();
  if (!session) {
    redirect("/login");
  }

  return <CatalogLoader storeName={session.storeName ?? "חנות"} />;
}
