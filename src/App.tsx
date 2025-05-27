
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AutoRedirect from "@/components/auth/AutoRedirect";

// Main pages
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Dashboard pages
import PatientDashboard from "./pages/PatientDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Patient pages
import MedicalRecord from "./pages/MedicalRecord";
import Anamnesis from "./pages/Anamnesis";
import PatientAnamnesis from "./pages/PatientAnamnesis";
import Activities from "./pages/Activities";
import EnhancedActivities from "./pages/EnhancedActivities";

// Patient-specific pages
import PatientMood from "./pages/patient/Mood";
import PatientProgress from "./pages/patient/Progress";
import PatientAchievements from "./pages/patient/Achievements";

// Psychologist pages
import AnamnesisManagement from "./pages/AnamnesisManagement";

// Psychologist-specific pages
import PsychologistPatients from "./pages/psychologist/Patients";
import PsychologistReports from "./pages/psychologist/Reports";
import PsychologistNotifications from "./pages/psychologist/Notifications";

// Admin-specific pages
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminBilling from "./pages/admin/Billing";
import AdminBillingFull from "./pages/admin/BillingFull";
import AdminSupport from "./pages/admin/Support";
import AdminCommunications from "./pages/admin/Communications";
import AdminDocuments from "./pages/admin/Documents";
import AdminLogs from "./pages/admin/Logs";
import AdminReports from "./pages/admin/Reports";

// Shared pages
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Index />} />
            <Route path="/dashboard" element={<AutoRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Patient Routes */}
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

            {/* Psychologist Routes */}
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

            {/* Admin Routes */}
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

            {/* Shared Routes (require authentication) - Activities accessible by patients and psychologists */}
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
