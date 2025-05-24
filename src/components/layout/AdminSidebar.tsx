
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
  LogOut,
  BarChart3,
  AlertTriangle
} from "lucide-react";

const AdminSidebar = () => {
  const { signOut, profile } = useAuth();
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();
  const [badges, setBadges] = useState({
    supportTickets: 0,
    systemAlerts: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeCounts();
      const interval = setInterval(fetchBadgeCounts, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const fetchBadgeCounts = async () => {
    try {
      // Mock data for admin badges - replace with actual queries
      setBadges({
        supportTickets: Math.floor(Math.random() * 5), // Mock pending support tickets
        systemAlerts: Math.floor(Math.random() * 3), // Mock system alerts
        pendingApprovals: Math.floor(Math.random() * 2), // Mock pending approvals
      });
    } catch (error) {
      console.error('Error fetching admin badge counts:', error);
    }
  };

  const overviewItems = [
    {
      title: "Dashboard",
      icon: Shield,
      path: "/admin-dashboard",
    },
    {
      title: "Visão Geral",
      icon: BarChart3,
      path: "/admin-dashboard#overview",
    },
  ];

  const userManagementItems = [
    {
      title: "Usuários",
      icon: Users,
      path: "/admin-dashboard#users",
    },
  ];

  const financialItems = [
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
  ];

  const communicationItems = [
    {
      title: "Suporte",
      icon: MessageSquare,
      path: "/admin-dashboard#support",
      badge: badges.supportTickets > 0 ? badges.supportTickets : undefined,
    },
    {
      title: "Comunicados",
      icon: Megaphone,
      path: "/admin-dashboard#communications",
    },
  ];

  const systemItems = [
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
      badge: badges.systemAlerts > 0 ? badges.systemAlerts : undefined,
    },
    {
      title: "Relatórios",
      icon: Download,
      path: "/admin-dashboard#reports",
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
                className="transition-all duration-200 hover:bg-red-50 hover:text-red-700"
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
          <Shield className="h-8 w-8 text-red-600" />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Controle Total</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2">
        {renderMenuGroup("Painel", overviewItems, state === "expanded")}
        {renderMenuGroup("Usuários", userManagementItems, state === "expanded")}
        {renderMenuGroup("Financeiro", financialItems, state === "expanded")}
        {renderMenuGroup("Comunicação", communicationItems, state === "expanded")}
        {renderMenuGroup("Sistema", systemItems, state === "expanded")}
      </SidebarContent>

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
    </Sidebar>
  );
};

export default AdminSidebar;
