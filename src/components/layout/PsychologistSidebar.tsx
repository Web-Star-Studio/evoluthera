
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
  SidebarGroupLabel,
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
  BarChart3, 
  Users, 
  FileText, 
  UserCheck, 
  ClipboardList, 
  Bell, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  LogOut,
  Brain
} from "lucide-react";

const PsychologistSidebar = () => {
  const { signOut, profile } = useAuth();
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();
  const [badges, setBadges] = useState({
    pendingTasks: 0,
    unreadNotifications: 0,
    activePatients: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeCounts();
      const interval = setInterval(fetchBadgeCounts, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const fetchBadgeCounts = async () => {
    try {
      const [tasksResult, notificationsResult, patientsResult, messagesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('psychologist_id', profile?.id)
          .eq('status', 'pending'),
        
        supabase
          .from('anamnesis_notifications')
          .select('*')
          .eq('recipient_id', profile?.id)
          .is('read_at', null),
        
        supabase
          .from('patients')
          .select('*')
          .eq('psychologist_id', profile?.id)
          .eq('status', 'active'),
        
        supabase
          .from('chat_messages')
          .select('*')
          .eq('recipient_id', profile?.id)
          .eq('is_read', false)
      ]);

      setBadges({
        pendingTasks: tasksResult.data?.length || 0,
        unreadNotifications: notificationsResult.data?.length || 0,
        activePatients: patientsResult.data?.length || 0,
        unreadMessages: messagesResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching badge counts:', error);
    }
  };

  const patientManagementItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      path: "/psychologist-dashboard",
    },
    {
      title: "Pacientes",
      icon: Users,
      path: "/psychologist-dashboard#patients",
      badge: badges.activePatients,
    },
    {
      title: "Prontuários",
      icon: FileText,
      path: "/medical-record",
    }
  ];

  const toolsItems = [
    {
      title: "Anamneses",
      icon: UserCheck,
      path: "/anamnesis-management",
    },
    {
      title: "Tarefas",
      icon: ClipboardList,
      path: "/activities",
      badge: badges.pendingTasks > 0 ? badges.pendingTasks : undefined,
    },
    {
      title: "Relatórios",
      icon: TrendingUp,
      path: "/psychologist-dashboard#reports",
    },
  ];

  const communicationItems = [
    {
      title: "Notificações",
      icon: Bell,
      path: "/psychologist-dashboard#notifications",
      badge: badges.unreadNotifications > 0 ? badges.unreadNotifications : undefined,
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/chat",
      badge: badges.unreadMessages > 0 ? badges.unreadMessages : undefined,
    },
    {
      title: "Agenda",
      icon: Calendar,
      path: "/calendar",
    },
  ];

  const systemItems = [
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

  const renderMenuGroup = (title: string, items: any[], isExpanded: boolean = true) => (
    <SidebarGroup>
      {isExpanded && <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigateToSection(item.path)}
                isActive={isActivePath(item.path)}
                tooltip={state === "collapsed" ? item.title : undefined}
                className="transition-all duration-200 hover:bg-purple-50 hover:text-purple-700"
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
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <Brain className="h-8 w-8 text-purple-600" />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Painel Profissional</span>
              <span className="text-xs text-muted-foreground">Psicologia Digital</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2">
        {renderMenuGroup("Pacientes", patientManagementItems, state === "expanded")}
        {renderMenuGroup("Ferramentas", toolsItems, state === "expanded")}
        {renderMenuGroup("Comunicação", communicationItems, state === "expanded")}
        {renderMenuGroup("Sistema", systemItems, state === "expanded")}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-2">
          {state === "expanded" && (
            <div className="px-2 py-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Dr(a). {profile?.name || 'Psicólogo'}</p>
              <p className="text-xs text-purple-700">CRP: 06/123456</p>
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
