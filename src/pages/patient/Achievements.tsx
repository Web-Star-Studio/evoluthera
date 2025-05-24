
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import GamificationCard from "@/components/patient/GamificationCard";
import PatientAchievements from "@/components/gamification/PatientAchievements";
import { Trophy } from "lucide-react";

const PatientAchievements = () => {
  return (
    <UniversalDashboardLayout userType="patient">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Conquistas</h1>
            <p className="text-gray-600">Celebre seus marcos e conquistas na terapia</p>
          </div>
        </div>

        <GamificationCard />
        <PatientAchievements />
      </div>
    </UniversalDashboardLayout>
  );
};

export default PatientAchievements;
