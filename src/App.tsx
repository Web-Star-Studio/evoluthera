
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Anamnesis from "./pages/Anamnesis";
import MedicalRecord from "./pages/MedicalRecord";
import Activities from "./pages/Activities";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/psychologist-dashboard" element={<PsychologistDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/anamnesis" element={<Anamnesis />} />
          <Route path="/medical-record" element={<MedicalRecord />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
