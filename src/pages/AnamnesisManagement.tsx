
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import AnamnesisManager from "@/components/anamnesis/AnamnesisManager";

const AnamnesisManagement = () => {
  return (
    <UniversalDashboardLayout userType="psychologist">
      <AnamnesisManager />
    </UniversalDashboardLayout>
  );
};

export default AnamnesisManagement;
