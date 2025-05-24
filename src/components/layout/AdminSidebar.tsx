
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  DollarSign, 
  Receipt, 
  MessageSquare, 
  Megaphone, 
  Scale, 
  Settings, 
  FileText, 
  Download,
  LogOut 
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Shield,
      path: "/admin-dashboard",
    },
    {
      title: "Usuários",
      icon: Users,
      path: "/admin-dashboard#users",
    },
    {
      title: "Cobrança",
      icon: DollarSign,
      path: "/admin-dashboard#billing",
    },
    {
      title: "Faturamento",
      icon: Receipt,
      path: "/admin-dashboard#billing-full",
    },
    {
      title: "Suporte",
      icon: MessageSquare,
      path: "/admin-dashboard#support",
    },
    {
      title: "Comunicados",
      icon: Megaphone,
      path: "/admin-dashboard#communications",
    },
    {
      title: "Documentos",
      icon: Scale,
      path: "/admin-dashboard#documents",
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/settings",
    },
    {
      title: "Logs",
      icon: FileText,
      path: "/admin-dashboard#logs",
    },
    {
      title: "Relatórios",
      icon: Download,
      path: "/admin-dashboard#reports",
    },
  ];

  const handleNavigation = (path: string) => {
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      navigate(route);
      // Use setTimeout to ensure the page has loaded before scrolling
      setTimeout(() => {
        const element = document.querySelector(`[data-tab="${hash}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      navigate(path);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActivePath = (path: string) => {
    if (path.includes("#")) {
      const route = path.split("#")[0];
      return location.pathname === route;
    }
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <img 
            src="/lovable-uploads/2efc273a-5ee9-4b8d-9f84-75c1295f89eb.png" 
            alt="Evoluthera Logo" 
            className={`transition-all ${state === "collapsed" ? "h-8 w-8" : "h-8 w-auto"}`}
          />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Evoluthera</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActivePath(item.path)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          {state === "expanded" && (
            <div className="px-2 py-1">
              <p className="text-sm font-medium">Olá, {profile?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {state === "expanded" && <span>Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
