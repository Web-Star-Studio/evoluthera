
import EnhancedTasksList from "@/components/patient/EnhancedTasksList";
import DashboardLayout from "@/components/layout/DashboardLayout";

const EnhancedActivities = () => {
  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
};

export default EnhancedActivities;
