
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Plus, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatListProps {
  currentUserId: string;
  userType: 'patient' | 'psychologist';
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ChatList = ({ currentUserId, userType, onSelectConversation, selectedConversationId }: ChatListProps) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
    subscribeToConversations();
  }, [currentUserId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          psychologist:profiles!conversations_psychologist_id_fkey (name, avatar_url),
          patient:profiles!conversations_patient_id_fkey (name, avatar_url)
        `)
        .or(`psychologist_id.eq.${currentUserId},patient_id.eq.${currentUserId}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      // Buscar última mensagem para cada conversa
      const conversationsWithLastMessage = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message_content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            last_message: lastMessage
          };
        })
      );

      setConversations(conversationsWithLastMessage);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getOtherUser = (conversation: any) => {
    if (userType === 'psychologist') {
      return conversation.patient;
    } else {
      return conversation.psychologist;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="h-[600px] w-full lg:w-80">
        <CardHeader className="pb-3">
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] w-full lg:w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas
          </div>
          {userType === 'psychologist' && (
            <Button size="sm" variant="outline" disabled>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1 max-h-[520px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8 px-4">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              {userType === 'patient' && (
                <p className="text-xs mt-2">
                  Aguarde seu psicólogo iniciar o chat
                </p>
              )}
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">
                      {otherUser?.name || 'Usuário'}
                    </h3>
                    <div className="flex items-center gap-1">
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastMessageTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {conversation.last_message ? (
                    <p className="text-xs text-gray-600">
                      {conversation.last_message.sender_id === currentUserId ? 'Você: ' : ''}
                      {truncateMessage(conversation.last_message.message_content)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Conversa iniciada
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatList;
