
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import AnamnesisCreatorDashboard from "@/components/anamnesis-creator/AnamnesisCreatorDashboard";

const AnamnesisCreator = () => {
  return (
    <UniversalDashboardLayout userType="psychologist">
      <AnamnesisCreatorDashboard />
    </UniversalDashboardLayout>
  );
};

export default AnamnesisCreator;
