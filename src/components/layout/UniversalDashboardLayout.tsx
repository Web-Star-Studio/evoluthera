
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import PatientSidebar from "./PatientSidebar";
import PsychologistSidebar from "./PsychologistSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface UniversalDashboardLayoutProps {
  children: ReactNode;
  userType?: "patient" | "psychologist" | "admin";
}

const UniversalDashboardLayout = ({ children, userType }: UniversalDashboardLayoutProps) => {
  const { profile } = useAuth();
  
  const currentUserType = profile?.user_type || userType;

  const getSidebar = () => {
    switch (currentUserType) {
      case "admin":
        return <AdminSidebar />;
      case "psychologist":
        return <PsychologistSidebar />;
      case "patient":
        return <PatientSidebar />;
      default:
        return <AdminSidebar />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        {getSidebar()}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UniversalDashboardLayout;
