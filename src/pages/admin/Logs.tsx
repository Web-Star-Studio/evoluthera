
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import SystemLogs from "@/components/admin/SystemLogs";
import { FileText } from "lucide-react";

const AdminLogs = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Logs do Sistema</h1>
            <p className="text-gray-600">Monitore atividades e eventos do sistema</p>
          </div>
        </div>

        <SystemLogs />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminLogs;
