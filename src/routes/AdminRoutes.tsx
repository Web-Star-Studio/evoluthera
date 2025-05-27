
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminBilling from "@/pages/admin/Billing";
import AdminBillingFull from "@/pages/admin/BillingFull";
import AdminSupport from "@/pages/admin/Support";
import AdminCommunications from "@/pages/admin/Communications";
import AdminDocuments from "@/pages/admin/Documents";
import AdminLogs from "@/pages/admin/Logs";
import AdminReports from "@/pages/admin/Reports";

const AdminRoutes = () => (
  <>
    <Route path="/admin-dashboard" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/overview" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminOverview />
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    } />
    <Route path="/admin/billing" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminBilling />
      </ProtectedRoute>
    } />
    <Route path="/admin/billing-full" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminBillingFull />
      </ProtectedRoute>
    } />
    <Route path="/admin/support" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminSupport />
      </ProtectedRoute>
    } />
    <Route path="/admin/communications" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminCommunications />
      </ProtectedRoute>
    } />
    <Route path="/admin/documents" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminDocuments />
      </ProtectedRoute>
    } />
    <Route path="/admin/logs" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminLogs />
      </ProtectedRoute>
    } />
    <Route path="/admin/reports" element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminReports />
      </ProtectedRoute>
    } />
  </>
);

export default AdminRoutes;
