
import { useState } from "react";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";
import ChatSettings from "./ChatSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Settings } from "lucide-react";

interface ChatPageProps {
  currentUserId: string;
  userType: 'patient' | 'psychologist';
}

const ChatPage = ({ currentUserId, userType }: ChatPageProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Terapêutico</h1>
        <p className="text-gray-600">
          {userType === 'patient' 
            ? 'Converse com seu psicólogo de forma segura e assíncrona'
            : 'Mantenha contato com seus pacientes'
          }
        </p>
      </div>

      {userType === 'psychologist' ? (
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <div className="flex gap-6">
              <ChatList
                currentUserId={currentUserId}
                userType={userType}
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId || undefined}
              />
              
              {selectedConversationId ? (
                <div className="flex-1">
                  <ChatInterface
                    conversationId={selectedConversationId}
                    currentUserId={currentUserId}
                    otherUserName="Paciente"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <ChatSettings psychologistId={currentUserId} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex gap-6">
          <ChatList
            currentUserId={currentUserId}
            userType={userType}
            onSelectConversation={setSelectedConversationId}
            selectedConversationId={selectedConversationId || undefined}
          />
          
          {selectedConversationId ? (
            <div className="flex-1">
              <ChatInterface
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                otherUserName="Psicólogo"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
