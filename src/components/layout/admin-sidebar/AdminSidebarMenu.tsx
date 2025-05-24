
import { useNavigation } from "@/hooks/useNavigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAdminBadges } from "./useAdminBadges";
import {
  getOverviewItems,
  getUserManagementItems,
  getFinancialItems,
  getCommunicationItems,
  getSystemItems,
} from "./adminMenuItems";

const AdminSidebarMenu = () => {
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();
  const badges = useAdminBadges();

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
    <SidebarContent className="space-y-2">
      {renderMenuGroup("Painel", getOverviewItems(), state === "expanded")}
      {renderMenuGroup("Usuários", getUserManagementItems(), state === "expanded")}
      {renderMenuGroup("Financeiro", getFinancialItems(), state === "expanded")}
      {renderMenuGroup("Comunicação", getCommunicationItems(badges), state === "expanded")}
      {renderMenuGroup("Sistema", getSystemItems(badges), state === "expanded")}
    </SidebarContent>
  );
};

export default AdminSidebarMenu;
