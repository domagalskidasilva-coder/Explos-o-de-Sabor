import { redirect } from "next/navigation";
import AdminDashboard from "@/src/components/AdminDashboard";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
