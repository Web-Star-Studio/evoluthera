import {
  Home,
  User,
  Heart,
  Brain,
  Shield,
  FileText,
  Clipboard,
  Settings,
  Activity,
  Zap,
  MessageCircle,
  Cog,
} from "lucide-react";

interface NavItem {
  title: string;
  to: string;
  icon: keyof typeof icons;
  variant: "default" | "ghost";
}

const icons = {
  home: Home,
  user: User,
  heart: Heart,
  brain: Brain,
  shield: Shield,
  "file-text": FileText,
  clipboard: Clipboard,
  settings: Settings,
  activity: Activity,
  zap: Zap,
  "message-circle": MessageCircle,
  cog: Cog,
};

export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: "home",
    variant: "default",
  },
  {
    title: "Login",
    to: "/login",
    icon: "user",
    variant: "ghost",
  },
  {
    title: "Dashboard Paciente",
    to: "/patient-dashboard",
    icon: "heart",
    variant: "ghost",
  },
  {
    title: "Dashboard Psicólogo",
    to: "/psychologist-dashboard",
    icon: "brain",
    variant: "ghost",
  },
  {
    title: "Dashboard Admin",
    to: "/admin-dashboard",
    icon: "shield",
    variant: "ghost",
  },
  {
    title: "Prontuário",
    to: "/medical-record",
    icon: "file-text",
    variant: "ghost",
  },
  {
    title: "Anamnese",
    to: "/anamnesis",
    icon: "clipboard",
    variant: "ghost",
  },
  {
    title: "Gerenciar Anamnese",
    to: "/anamnesis-management",
    icon: "settings",
    variant: "ghost",
  },
  {
    title: "Atividades",
    to: "/activities",
    icon: "activity",
    variant: "ghost",
  },
  {
    title: "Atividades Avançadas",
    to: "/enhanced-activities",
    icon: "zap",
    variant: "ghost",
  },
  {
    title: "Chat",
    to: "/chat",
    icon: "message-circle",
    variant: "ghost",
  },
  {
    title: "Configurações",
    to: "/settings",
    icon: "cog",
    variant: "ghost",
  },
];
