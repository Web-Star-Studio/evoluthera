
import ChatPage from "@/components/chat/ChatPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
      <DashboardLayout userType={profile.user_type} userName={profile.name}>
        <div className="text-center py-8">
          <p className="text-gray-600">Chat não disponível para este tipo de usuário.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={profile.user_type} userName={profile.name}>
      <ChatPage currentUserId={user.id} userType={chatUserType} />
    </DashboardLayout>
  );
};

export default Chat;
