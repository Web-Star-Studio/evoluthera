
import ChatPage from "@/components/chat/ChatPage";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Chat = () => {
  // Temporariamente usando IDs fixos - em produção, pegar do contexto de autenticação
  const currentUserId = "temp-user-id";
  const userType = "patient"; // ou "psychologist"

  return (
    <DashboardLayout userType={userType} userName="Usuário Teste">
      <ChatPage currentUserId={currentUserId} userType={userType} />
    </DashboardLayout>
  );
};

export default Chat;
