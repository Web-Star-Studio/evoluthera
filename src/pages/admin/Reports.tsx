
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import ReportExport from "@/components/admin/ReportExport";
import { Download } from "lucide-react";

const AdminReports = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Gere e exporte relatórios do sistema</p>
          </div>
        </div>

        <ReportExport />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminReports;
