import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import EnhancedPatientsList from "@/components/psychologist/EnhancedPatientsList";
import { Users } from "lucide-react";
import AddPatientForm from "@/components/psychologist/AddPatientForm";

const PsychologistPatients = () => {
  return (
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pacientes</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus pacientes</p>
          </div>
        </div>

        <AddPatientForm />

        <EnhancedPatientsList />
      </div>
    </UniversalDashboardLayout>
  );
};

export default PsychologistPatients;
