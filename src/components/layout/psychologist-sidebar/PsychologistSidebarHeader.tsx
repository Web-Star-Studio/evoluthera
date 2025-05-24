
import { SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Brain } from "lucide-react";

const PsychologistSidebarHeader = () => {
  const { state } = useSidebar();

  return (
    <SidebarHeader className="border-b p-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Brain className="h-8 w-8 text-green-600" />
        {state === "expanded" && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Psicólogo</span>
            <span className="text-xs text-muted-foreground">Painel Profissional</span>
          </div>
        )}
      </div>
    </SidebarHeader>
  );
};

export default PsychologistSidebarHeader;
