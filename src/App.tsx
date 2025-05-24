
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/index" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/psychologist-dashboard" element={<PsychologistDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/medical-record" element={<MedicalRecord />} />
          <Route path="/anamnesis" element={<Anamnesis />} />
          <Route path="/anamnesis/:anamnesisId" element={<PatientAnamnesis />} />
          <Route path="/anamnesis-management" element={<AnamnesisManagement />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/enhanced-activities" element={<EnhancedActivities />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
