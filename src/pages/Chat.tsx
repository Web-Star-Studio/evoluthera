
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

  return (
    <DashboardLayout userType={profile.user_type} userName={profile.name}>
      <ChatPage currentUserId={user.id} userType={profile.user_type} />
    </DashboardLayout>
  );
};

export default Chat;
