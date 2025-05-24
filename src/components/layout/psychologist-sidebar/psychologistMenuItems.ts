
import { 
  Home, 
  FileText, 
  Activity, 
  Heart, 
  Calendar, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Bell,
  Settings,
} from "lucide-react";
import { BadgeCounts } from "./usePsychologistBadges";

export interface MenuItem {
  title: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

export const getPsychologistMenuItems = (badges: BadgeCounts): MenuItem[] => [
  {
    title: "Dashboard",
    icon: Home,
    path: "/psychologist-dashboard",
  },
  {
    title: "Pacientes",
    icon: Users,
    path: "/psychologist/patients",
    badge: badges.pendingPatients > 0 ? badges.pendingPatients : undefined,
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    path: "/psychologist/reports",
  },
  {
    title: "Notificações",
    icon: Bell,
    path: "/psychologist/notifications",
    badge: badges.newNotifications > 0 ? badges.newNotifications : undefined,
  },
  {
    title: "Anamnese",
    icon: FileText,
    path: "/anamnesis-management",
  },
  {
    title: "Atividades",
    icon: Activity,
    path: "/activities",
    badge: badges.activeTasks > 0 ? badges.activeTasks : undefined,
  },
  {
    title: "Histórico Médico",
    icon: Heart,
    path: "/medical-record",
  },
  {
    title: "Calendário",
    icon: Calendar,
    path: "/calendar",
  },
  {
    title: "Chat",
    icon: MessageSquare,
    path: "/chat",
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/settings",
  },
];
