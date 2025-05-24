
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import BillingDashboard from "@/components/admin/BillingDashboard";
import { Receipt } from "lucide-react";

const AdminBillingFull = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Receipt className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faturamento Completo</h1>
            <p className="text-gray-600">Dashboard completo de faturamento e relatórios</p>
          </div>
        </div>

        <BillingDashboard />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminBillingFull;
