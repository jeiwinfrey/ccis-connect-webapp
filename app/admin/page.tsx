import { AdminStoreProvider } from "@/lib/admin-store";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <AdminStoreProvider>
      <AdminDashboard />
    </AdminStoreProvider>
  );
}
