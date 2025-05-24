
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import NotificationsCenter from "@/components/psychologist/NotificationsCenter";
import { Bell } from "lucide-react";

const PsychologistNotifications = () => {
  return (
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Notificações</h1>
            <p className="text-gray-600">Acompanhe todas as notificações e alertas</p>
          </div>
        </div>

        <NotificationsCenter />
      </div>
    </UniversalDashboardLayout>
  );
};

export default PsychologistNotifications;
