
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import UsersTable from "@/components/admin/UsersTable";
import { Users as UsersIcon } from "lucide-react";

const AdminUsers = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600">Gerencie todos os usuários da plataforma</p>
          </div>
        </div>

        <UsersTable />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminUsers;
