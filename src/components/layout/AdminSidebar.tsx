
import {
  Sidebar,
} from "@/components/ui/sidebar";
import AdminSidebarHeader from "./admin-sidebar/AdminSidebarHeader";
import AdminSidebarMenu from "./admin-sidebar/AdminSidebarMenu";
import AdminSidebarFooter from "./admin-sidebar/AdminSidebarFooter";

const AdminSidebar = () => {
  return (
    <Sidebar>
      <AdminSidebarHeader />
      <AdminSidebarMenu />
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
