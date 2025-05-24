
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AutoRedirect from "@/components/auth/AutoRedirect";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MedicalRecord from "./pages/MedicalRecord";
import Anamnesis from "./pages/Anamnesis";
import PatientAnamnesis from "./pages/PatientAnamnesis";
import AnamnesisManagement from "./pages/AnamnesisManagement";
import Activities from "./pages/Activities";
import EnhancedActivities from "./pages/EnhancedActivities";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AutoRedirect />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Patient Routes */}
            <Route path="/patient-dashboard" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
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
            <Route path="/activities" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <Activities />
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

            {/* Shared Routes (require authentication) */}
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
