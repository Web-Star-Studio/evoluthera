
import ChatPage from "@/components/chat/ChatPage";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Handle admin users - they should be treated as psychologists for chat purposes
  const chatUserType = profile.user_type === 'admin' ? 'psychologist' : profile.user_type;

  // Ensure the user type is valid for chat
  if (chatUserType !== 'patient' && chatUserType !== 'psychologist') {
    return (
      <UniversalDashboardLayout userType={profile.user_type}>
        <div className="text-center py-8">
          <p className="text-gray-600">Chat não disponível para este tipo de usuário.</p>
        </div>
      </UniversalDashboardLayout>
    );
  }

  return (
    <UniversalDashboardLayout userType={profile.user_type}>
      <ChatPage currentUserId={user.id} userType={chatUserType} />
    </UniversalDashboardLayout>
  );
};

export default Chat;
