
import { 
  Shield, 
  Users, 
  DollarSign, 
  Receipt, 
  MessageSquare, 
  Megaphone, 
  Scale, 
  Settings, 
  FileText, 
  Download,
  BarChart3
} from "lucide-react";

export const getOverviewItems = () => [
  {
    title: "Dashboard",
    icon: Shield,
    path: "/admin-dashboard",
  },
  {
    title: "Visão Geral",
    icon: BarChart3,
    path: "/admin/overview",
  },
];

export const getUserManagementItems = () => [
  {
    title: "Usuários",
    icon: Users,
    path: "/admin/users",
  },
];

export const getFinancialItems = () => [
  {
    title: "Cobrança",
    icon: DollarSign,
    path: "/admin/billing",
  },
  {
    title: "Faturamento",
    icon: Receipt,
    path: "/admin/billing-full",
  },
];

export const getCommunicationItems = (badges: any) => [
  {
    title: "Suporte",
    icon: MessageSquare,
    path: "/admin/support",
    badge: badges.supportTickets > 0 ? badges.supportTickets : undefined,
  },
  {
    title: "Comunicados",
    icon: Megaphone,
    path: "/admin/communications",
  },
];

export const getSystemItems = (badges: any) => [
  {
    title: "Documentos",
    icon: Scale,
    path: "/admin/documents",
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/settings",
  },
  {
    title: "Logs",
    icon: FileText,
    path: "/admin/logs",
    badge: badges.systemAlerts > 0 ? badges.systemAlerts : undefined,
  },
  {
    title: "Relatórios",
    icon: Download,
    path: "/admin/reports",
  },
];
