
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PsychologistDashboard from "@/pages/PsychologistDashboard";
import PsychologistPatients from "@/pages/psychologist/Patients";
import PsychologistReports from "@/pages/psychologist/Reports";
import PsychologistNotifications from "@/pages/psychologist/Notifications";
import MedicalRecord from "@/pages/MedicalRecord";
import AnamnesisManagement from "@/pages/AnamnesisManagement";

const PsychologistRoutes = () => (
  <>
    <Route path="/psychologist-dashboard" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <PsychologistDashboard />
      </ProtectedRoute>
    } />
    <Route path="/psychologist/patients" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <PsychologistPatients />
      </ProtectedRoute>
    } />
    <Route path="/psychologist/reports" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <PsychologistReports />
      </ProtectedRoute>
    } />
    <Route path="/psychologist/notifications" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <PsychologistNotifications />
      </ProtectedRoute>
    } />
    <Route path="/medical-record" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <MedicalRecord />
      </ProtectedRoute>
    } />
    <Route path="/anamnesis-management" element={
      <ProtectedRoute allowedUserTypes={['psychologist']}>
        <AnamnesisManagement />
      </ProtectedRoute>
    } />
  </>
);

export default PsychologistRoutes;
