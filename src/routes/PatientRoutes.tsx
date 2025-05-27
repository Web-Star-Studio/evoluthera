
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PatientDashboard from "@/pages/PatientDashboard";
import PatientMood from "@/pages/patient/Mood";
import PatientProgress from "@/pages/patient/Progress";
import PatientAchievements from "@/pages/patient/Achievements";
import Anamnesis from "@/pages/Anamnesis";
import PatientAnamnesis from "@/pages/PatientAnamnesis";
import EnhancedActivities from "@/pages/EnhancedActivities";

const PatientRoutes = () => (
  <>
    <Route path="/patient-dashboard" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <PatientDashboard />
      </ProtectedRoute>
    } />
    <Route path="/patient/mood" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <PatientMood />
      </ProtectedRoute>
    } />
    <Route path="/patient/progress" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <PatientProgress />
      </ProtectedRoute>
    } />
    <Route path="/patient/achievements" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <PatientAchievements />
      </ProtectedRoute>
    } />
    <Route path="/anamnesis" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <Anamnesis />
      </ProtectedRoute>
    } />
    <Route path="/anamnesis/:anamnesisId" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <PatientAnamnesis />
      </ProtectedRoute>
    } />
    <Route path="/enhanced-activities" element={
      <ProtectedRoute allowedUserTypes={['patient']}>
        <EnhancedActivities />
      </ProtectedRoute>
    } />
  </>
);

export default PatientRoutes;
