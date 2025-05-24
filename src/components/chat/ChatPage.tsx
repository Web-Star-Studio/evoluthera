
import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatInterface from "./ChatInterface";
import ChatSettings from "./ChatSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatPageProps {
  currentUserId: string;
  userType: 'patient' | 'psychologist';
}

const ChatPage = ({ currentUserId, userType }: ChatPageProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeChatData();
  }, [currentUserId, userType]);

  const initializeChatData = async () => {
    try {
      // Verificar se existem conversas para este usuário
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`psychologist_id.eq.${currentUserId},patient_id.eq.${currentUserId}`)
        .limit(1);

      if (error) throw error;

      // Se não há conversas e é um paciente, criar uma conversa demo
      if (conversations.length === 0 && userType === 'patient') {
        await createDemoConversation();
      }
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoConversation = async () => {
    try {
      // Buscar um psicólogo demo para criar conversa
      const { data: psychologist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'psychologist')
        .limit(1)
        .single();

      if (psychologist) {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .insert({
            patient_id: currentUserId,
            psychologist_id: psychologist.id,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        // Criar mensagem de boas-vindas
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: psychologist.id,
            message_content: 'Olá! Seja bem-vindo ao nosso chat terapêutico. Como posso ajudá-lo hoje?',
            message_type: 'text'
          });
      }
    } catch (error) {
      console.error('Erro ao criar conversa demo:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Terapêutico</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ChatList
                  currentUserId={currentUserId}
                  userType={userType}
                  onSelectConversation={setSelectedConversationId}
                  selectedConversationId={selectedConversationId || undefined}
                />
              </div>
              
              <div className="lg:col-span-3">
                {selectedConversationId ? (
                  <ChatInterface
                    conversationId={selectedConversationId}
                    currentUserId={currentUserId}
                    otherUserName="Paciente"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma conversa para começar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <ChatSettings psychologistId={currentUserId} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ChatList
              currentUserId={currentUserId}
              userType={userType}
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>
          
          <div className="lg:col-span-3">
            {selectedConversationId ? (
              <ChatInterface
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                otherUserName="Psicólogo"
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
