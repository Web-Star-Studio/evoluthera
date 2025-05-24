
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, FileText, Settings, Menu, X } from "lucide-react";

interface PsychologistSidebarProps {
  pendingTasks: number;
  newResponses: number;
}

const PsychologistSidebar = ({ pendingTasks, newResponses }: PsychologistSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { 
      icon: Users, 
      label: "Pacientes", 
      path: "/psychologist-dashboard",
      notifications: 0
    },
    { 
      icon: ClipboardList, 
      label: "Tarefas", 
      path: "/psychologist-tasks",
      notifications: pendingTasks
    },
    { 
      icon: FileText, 
      label: "Prontuários", 
      path: "/medical-record",
      notifications: newResponses
    },
    { 
      icon: Settings, 
      label: "Configurações", 
      path: "/settings",
      notifications: 0
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:inset-auto md:h-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-emerald-600">Evolua Pro</h2>
            <p className="text-sm text-gray-600 mt-1">Dashboard Profissional</p>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.notifications > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {item.notifications}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default PsychologistSidebar;
