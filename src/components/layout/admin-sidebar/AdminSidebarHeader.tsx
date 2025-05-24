
import { Shield } from "lucide-react";
import {
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const AdminSidebarHeader = () => {
  const { state } = useSidebar();

  return (
    <SidebarHeader className="border-b p-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Shield className="h-8 w-8 text-red-600" />
        {state === "expanded" && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Controle Total</span>
          </div>
        )}
      </div>
    </SidebarHeader>
  );
};

export default AdminSidebarHeader;
