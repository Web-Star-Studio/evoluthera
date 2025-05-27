
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import AutoRedirect from "@/components/auth/AutoRedirect";

const PublicRoutes = () => (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/home" element={<Index />} />
    <Route path="/dashboard" element={<AutoRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default PublicRoutes;
