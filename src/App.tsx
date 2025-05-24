
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PsychologistDashboard from './pages/PsychologistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from './components/ui/sonner';
import AnamnesisManagement from './pages/AnamnesisManagement';
import AnamnesisCreator from "./pages/AnamnesisCreator";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/psychologist-dashboard" element={<PsychologistDashboard />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/anamnesis-management" element={<AnamnesisManagement />} />
                
                <Route path="/anamnesis-creator" element={<AnamnesisCreator />} />
                
                {/* Add more protected routes here */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
