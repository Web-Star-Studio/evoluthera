
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import ReportsDashboard from "@/components/psychologist/ReportsDashboard";
import { TrendingUp } from "lucide-react";

const PsychologistReports = () => {
  return (
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análises e relatórios dos pacientes</p>
          </div>
        </div>

        <ReportsDashboard />
      </div>
    </UniversalDashboardLayout>
  );
};

export default PsychologistReports;
