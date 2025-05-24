
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import MoodTracker from "@/components/patient/MoodTracker";
import MoodHistory from "@/components/patient/MoodHistory";
import { Heart } from "lucide-react";

const PatientMood = () => {
  return (
    <UniversalDashboardLayout userType="patient">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rastreamento de Humor</h1>
            <p className="text-gray-600">Acompanhe seu humor e bem-estar emocional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodTracker />
          <MoodHistory />
        </div>
      </div>
    </UniversalDashboardLayout>
  );
};

export default PatientMood;
