
import EnhancedTasksList from "@/components/patient/EnhancedTasksList";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";

const EnhancedActivities = () => {
  return (
    <UniversalDashboardLayout userType="patient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Atividades</h1>
            <p className="text-gray-600">
              Complete suas tarefas terapêuticas e acompanhe seu progresso
            </p>
          </div>
          
          <EnhancedTasksList />
        </div>
      </div>
    </UniversalDashboardLayout>
  );
};

export default EnhancedActivities;
