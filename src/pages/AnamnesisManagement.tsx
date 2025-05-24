
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnamnesisManager from "@/components/anamnesis/AnamnesisManager";

const AnamnesisManagement = () => {
  return (
    <DashboardLayout userType="psychologist" userName="Dr. João Santos">
      <AnamnesisManager />
    </DashboardLayout>
  );
};

export default AnamnesisManagement;
