
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, 
  ClipboardList, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  TrendingUp,
  UserCheck
} from "lucide-react";

interface PsychologistSidebarProps {
  pendingTasks?: number;
  newResponses?: number;
}

const PsychologistSidebar = ({ pendingTasks = 0, newResponses = 0 }: PsychologistSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/psychologist-dashboard",
      badge: null
    },
    {
      icon: Users,
      label: "Pacientes",
      path: "/psychologist-dashboard",
      badge: null
    },
    {
      icon: FileText,
      label: "Prontuários",
      path: "/medical-record",
      badge: null
    },
    {
      icon: UserCheck,
      label: "Anamneses",
      path: "/anamnesis-management",
      badge: null
    },
    {
      icon: ClipboardList,
      label: "Tarefas",
      path: "/activities",
      badge: pendingTasks > 0 ? pendingTasks : null
    },
    {
      icon: Bell,
      label: "Respostas",
      path: "/psychologist-dashboard",
      badge: newResponses > 0 ? newResponses : null
    },
    {
      icon: Calendar,
      label: "Agenda",
      path: "/calendar",
      badge: null
    },
    {
      icon: TrendingUp,
      label: "Relatórios",
      path: "/reports",
      badge: null
    },
    {
      icon: Settings,
      label: "Configurações",
      path: "/settings",
      badge: null
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Implementar logout
    navigate("/login");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <img src="/lovable-uploads/f22ddfd1-16b6-4226-871a-0a3f6b79261c.png" alt="Evolut Logo" className="h-8 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Dashboard Profissional</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActivePath(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActivePath(item.path) 
                  ? "text-white hover:bg-blue-600" 
                  : "hover:bg-gray-100"
              }`}
              style={{ 
                backgroundColor: isActivePath(item.path) ? '#1893f8' : undefined,
                color: isActivePath(item.path) ? 'white' : undefined
              }}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
          w-64
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default PsychologistSidebar;
