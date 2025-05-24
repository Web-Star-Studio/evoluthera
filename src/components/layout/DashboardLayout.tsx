
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  userType?: "patient" | "psychologist" | "admin";
  userName?: string;
}

const DashboardLayout = ({ children, userType, userName }: DashboardLayoutProps) => {
  const { signOut, profile } = useAuth();
  
  // Use profile data if available, fallback to props
  const currentUserType = profile?.user_type || userType;
  const currentUserName = profile?.name || userName || 'Usuário';

  const getNavItems = () => {
    switch (currentUserType) {
      case "patient":
        return [
          { label: "Dashboard", path: "/patient-dashboard" },
          { label: "Anamnese", path: "/anamnesis" },
          { label: "Atividades", path: "/activities" },
          { label: "Chat", path: "/chat" },
          { label: "Configurações", path: "/settings" },
        ];
      case "psychologist":
        return [
          { label: "Dashboard", path: "/psychologist-dashboard" },
          { label: "Prontuários", path: "/medical-record" },
          { label: "Anamneses", path: "/anamnesis-management" },
          { label: "Atividades", path: "/activities" },
          { label: "Chat", path: "/chat" },
          { label: "Configurações", path: "/settings" },
        ];
      case "admin":
        return [
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Chat", path: "/chat" },
          { label: "Configurações", path: "/settings" },
        ];
      default:
        return [];
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/2efc273a-5ee9-4b8d-9f84-75c1295f89eb.png" alt="Evoluthera Logo" className="h-8 w-auto" />
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ color: item.path === window.location.pathname ? '#1893f8' : undefined }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {currentUserName}</span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                style={{ color: '#1893f8' }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
