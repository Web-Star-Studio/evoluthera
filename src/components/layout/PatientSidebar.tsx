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
  Trophy, 
  Settings,
  LogOut,
  Brain
} from "lucide-react";

const PatientSidebar = () => {
  const { signOut, profile } = useAuth();
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();
  const [badges, setBadges] = useState({
    pendingTasks: 0,
    newAchievements: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeCounts();
    }
  }, [profile?.id]);

  const fetchBadgeCounts = async () => {
    try {
      // Fetch pending tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('patient_id', profile?.id)
        .eq('status', 'pending');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Fetch recent achievements (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id')
        .eq('patient_id', profile?.id)
        .gte('earned_at', sevenDaysAgo);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
      }

      // Fetch unread messages - simplified query
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('is_read', false);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      setBadges({
        pendingTasks: tasks?.length || 0,
        newAchievements: achievements?.length || 0,
        unreadMessages: messages?.length || 0
      });
    } catch (error) {
      console.error('Error fetching badge counts:', error);
    }
  };

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
      path: "/enhanced-activities",
      badge: badges.pendingTasks > 0 ? badges.pendingTasks : undefined,
    },
    {
      title: "Humor",
      icon: Heart,
      path: "/patient/mood",
    },
    {
      title: "Progresso",
      icon: Calendar,
      path: "/patient/progress",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/chat",
      badge: badges.unreadMessages > 0 ? badges.unreadMessages : undefined,
    },
    {
      title: "Conquistas",
      icon: Trophy,
      path: "/patient/achievements",
      badge: badges.newAchievements > 0 ? badges.newAchievements : undefined,
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
          <Brain className="h-8 w-8 text-blue-600" />
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
                    onClick={() => navigateToSection(item.path)}
                    isActive={isActivePath(item.path)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                    className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
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
            <div className="px-2 py-1 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Olá, {profile?.name || 'Paciente'}</p>
              <p className="text-xs text-blue-700">Continue sua jornada de crescimento</p>
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

export default PatientSidebar;
