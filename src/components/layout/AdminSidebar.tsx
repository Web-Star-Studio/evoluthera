
import {
  Sidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebarHeader from "./admin-sidebar/AdminSidebarHeader";
import AdminSidebarMenu from "./admin-sidebar/AdminSidebarMenu";
import AdminSidebarFooter from "./admin-sidebar/AdminSidebarFooter";

const AdminSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <AdminSidebarHeader />
      <AdminSidebarMenu />
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
