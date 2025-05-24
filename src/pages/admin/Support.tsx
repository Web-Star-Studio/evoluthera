
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import SupportTickets from "@/components/admin/SupportTickets";
import { MessageSquare } from "lucide-react";

const AdminSupport = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suporte</h1>
            <p className="text-gray-600">Gerencie tickets de suporte e atendimento</p>
          </div>
        </div>

        <SupportTickets />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminSupport;
