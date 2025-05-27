
import { Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import PatientRoutes from "./PatientRoutes";
import PsychologistRoutes from "./PsychologistRoutes";
import AdminRoutes from "./AdminRoutes";
import SharedRoutes from "./SharedRoutes";

const AppRoutes = () => (
  <Routes>
    {PublicRoutes()}
    {PatientRoutes()}
    {PsychologistRoutes()}
    {AdminRoutes()}
    {SharedRoutes()}
  </Routes>
);

export default AppRoutes;
