
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/hooks/useNavigation";
import { supabase } from "@/integrations/supabase/client";
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
  Users, 
  BarChart3, 
  Bell,
  Settings,
  LogOut,
  Brain
} from "lucide-react";

const PsychologistSidebar = () => {
  const { signOut, profile } = useAuth();
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();
  const [badges, setBadges] = useState({
    activeTasks: 0,
    pendingPatients: 0,
    newNotifications: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeCounts();
    }
  }, [profile?.id]);

  const fetchBadgeCounts = async () => {
    try {
      // Use existing tables to fetch badge counts
      const [tasksResult, patientsResult, notificationsResult] = await Promise.allSettled([
        supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'pending').eq('psychologist_id', profile?.id),
        supabase.from('patients').select('id', { count: 'exact' }).eq('psychologist_id', profile?.id).eq('status', 'active'),
        supabase.from('anamnesis_notifications').select('id', { count: 'exact' }).eq('recipient_id', profile?.id).is('read_at', null)
      ]);

      setBadges({
        activeTasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.count || 0) : 0,
        pendingPatients: patientsResult.status === 'fulfilled' ? (patientsResult.value.count || 0) : 0,
        newNotifications: notificationsResult.status === 'fulfilled' ? (notificationsResult.value.count || 0) : 0
      });
    } catch (error) {
      console.error('Error fetching badge counts:', error);
      setBadges({ activeTasks: 0, pendingPatients: 0, newNotifications: 0 });
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/psychologist-dashboard",
    },
    {
      title: "Pacientes",
      icon: Users,
      path: "/psychologist/patients",
      badge: badges.pendingPatients > 0 ? badges.pendingPatients : undefined,
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      path: "/psychologist/reports",
    },
    {
      title: "Notificações",
      icon: Bell,
      path: "/psychologist/notifications",
      badge: badges.newNotifications > 0 ? badges.newNotifications : undefined,
    },
    {
      title: "Anamnese",
      icon: FileText,
      path: "/anamnesis-management",
    },
    {
      title: "Atividades",
      icon: Activity,
      path: "/activities",
      badge: badges.activeTasks > 0 ? badges.activeTasks : undefined,
    },
    {
      title: "Histórico Médico",
      icon: Heart,
      path: "/medical-record",
    },
    {
      title: "Calendário",
      icon: Calendar,
      path: "/calendar",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/chat",
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar>
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigateToSection(item.path)}
                    isActive={isActivePath(item.path)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                    className="transition-all duration-200 hover:bg-green-50 hover:text-green-700"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && state === "expanded" && (
                      <Badge variant="destructive" className="ml-auto animate-pulse">
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
    </Sidebar>
  );
};

export default PsychologistSidebar;
