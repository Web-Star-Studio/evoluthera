
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
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  FileText, 
  Activity, 
  Heart, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Settings,
  LogOut 
} from "lucide-react";

const PatientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/patient-dashboard",
    },
    {
      title: "Anamnese",
      icon: FileText,
      path: "/anamnesis",
    },
    {
      title: "Atividades",
      icon: Activity,
      path: "/activities",
      badge: 3, // Example badge count
    },
    {
      title: "Humor",
      icon: Heart,
      path: "/patient-dashboard#mood",
    },
    {
      title: "Progresso",
      icon: Calendar,
      path: "/patient-dashboard#progress",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/chat",
    },
    {
      title: "Conquistas",
      icon: Trophy,
      path: "/patient-dashboard#achievements",
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleNavigation = (path: string) => {
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      navigate(route);
      setTimeout(() => {
        const element = document.querySelector(`[data-section="${hash}"]`);
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
              <span className="font-semibold text-sm">Meu Espaço</span>
              <span className="text-xs text-muted-foreground">Terapia Digital</span>
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
                    {item.badge && state === "expanded" && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
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
              <p className="text-sm font-medium">Olá, {profile?.name || 'Paciente'}</p>
              <p className="text-xs text-muted-foreground">Continue sua jornada</p>
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

export default PatientSidebar;
