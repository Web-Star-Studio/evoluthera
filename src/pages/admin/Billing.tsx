
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import BillingMetrics from "@/components/admin/BillingMetrics";
import { DollarSign } from "lucide-react";

const AdminBilling = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cobrança</h1>
            <p className="text-gray-600">Métricas básicas de faturamento</p>
          </div>
        </div>

        <BillingMetrics />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminBilling;
