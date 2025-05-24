
import { LogOut, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const AdminSidebarFooter = () => {
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SidebarFooter className="border-t p-4">
      <div className="space-y-2">
        {state === "expanded" && (
          <div className="px-2 py-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
            <p className="text-sm font-medium text-red-900">Olá, {profile?.name || 'Admin'}</p>
            <p className="text-xs text-red-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Acesso Total
            </p>
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

export default AdminSidebarFooter;
