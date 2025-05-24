
import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface PsychologistSidebarFooterProps {
  profile?: { name?: string };
  onSignOut: () => Promise<void>;
}

const PsychologistSidebarFooter = ({ profile, onSignOut }: PsychologistSidebarFooterProps) => {
  const { state } = useSidebar();

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SidebarFooter className="border-t p-4">
      <div className="space-y-2">
        {state === "expanded" && (
          <div className="px-2 py-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Dr(a). {profile?.name || 'Psicólogo'}</p>
            <p className="text-xs text-green-700">Acompanhando seus pacientes</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {state === "expanded" && <span>Sair</span>}
        </Button>
      </div>
    </SidebarFooter>
  );
};

export default PsychologistSidebarFooter;
