
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useNavigation } from "@/hooks/useNavigation";
import { MenuItem } from "./psychologistMenuItems";

interface PsychologistSidebarMenuProps {
  menuItems: MenuItem[];
}

const PsychologistSidebarMenu = ({ menuItems }: PsychologistSidebarMenuProps) => {
  const { navigateToSection, isActivePath } = useNavigation();
  const { state } = useSidebar();

  return (
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
  );
};

export default PsychologistSidebarMenu;
