
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Activities from "@/pages/Activities";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Chat from "@/pages/Chat";

const SharedRoutes = () => (
  <>
    <Route path="/activities" element={
      <ProtectedRoute allowedUserTypes={['patient', 'psychologist']}>
        <Activities />
      </ProtectedRoute>
    } />
    <Route path="/calendar" element={
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    } />
    <Route path="/chat" element={
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />
  </>
);

export default SharedRoutes;
