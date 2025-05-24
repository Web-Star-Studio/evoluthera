
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/ui/sidebar";
import { usePsychologistBadges } from "./psychologist-sidebar/usePsychologistBadges";
import { getPsychologistMenuItems } from "./psychologist-sidebar/psychologistMenuItems";
import PsychologistSidebarHeader from "./psychologist-sidebar/PsychologistSidebarHeader";
import PsychologistSidebarMenu from "./psychologist-sidebar/PsychologistSidebarMenu";
import PsychologistSidebarFooter from "./psychologist-sidebar/PsychologistSidebarFooter";

const PsychologistSidebar = () => {
  const { signOut, profile } = useAuth();
  const badges = usePsychologistBadges(profile?.id);
  const menuItems = getPsychologistMenuItems(badges);

  return (
    <Sidebar>
      <PsychologistSidebarHeader />
      <PsychologistSidebarMenu menuItems={menuItems} />
      <PsychologistSidebarFooter profile={profile} onSignOut={signOut} />
    </Sidebar>
  );
};

export default PsychologistSidebar;
