
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import CommunicationManager from "@/components/admin/CommunicationManager";
import { Megaphone } from "lucide-react";

const AdminCommunications = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
            <p className="text-gray-600">Gerencie comunicados e anúncios para usuários</p>
          </div>
        </div>

        <CommunicationManager />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminCommunications;
