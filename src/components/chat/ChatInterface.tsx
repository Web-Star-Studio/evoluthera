import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
}

const ChatInterface = ({ conversationId, currentUserId, otherUserName }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      checkDailyLimits();
      subscribeToMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:sender_id (
            name,
            user_type
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transformar dados do Supabase para o tipo ChatMessage
      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        message_content: msg.message_content,
        encrypted_content: msg.encrypted_content,
        message_type: (msg.message_type as 'text' | 'file' | 'image') || 'text',
        attachment_url: msg.attachment_url,
        attachment_name: msg.attachment_name,
        attachment_size: msg.attachment_size,
        is_read: msg.is_read,
        read_at: msg.read_at,
        created_at: msg.created_at,
        edited_at: msg.edited_at
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    }
  };

  const checkDailyLimits = async () => {
    try {
      // Buscar configurações do psicólogo
      const { data: conversation } = await supabase
        .from('conversations')
        .select('psychologist_id')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const { data: settings } = await supabase
          .from('chat_settings')
          .select('daily_message_limit')
          .eq('psychologist_id', conversation.psychologist_id)
          .single();

        setDailyLimit(settings?.daily_message_limit || 10);

        // Buscar uso diário atual
        const { data: usage } = await supabase
          .from('daily_message_usage')
          .select('message_count')
          .eq('patient_id', currentUserId)
          .eq('psychologist_id', conversation.psychologist_id)
          .eq('usage_date', new Date().toISOString().split('T')[0])
          .single();

        setDailyCount(usage?.message_count || 0);
      }
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          const transformedMessage: ChatMessage = {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            sender_id: newMsg.sender_id,
            message_content: newMsg.message_content,
            encrypted_content: newMsg.encrypted_content,
            message_type: (newMsg.message_type as 'text' | 'file' | 'image') || 'text',
            attachment_url: newMsg.attachment_url,
            attachment_name: newMsg.attachment_name,
            attachment_size: newMsg.attachment_size,
            is_read: newMsg.is_read,
            read_at: newMsg.read_at,
            created_at: newMsg.created_at,
            edited_at: newMsg.edited_at
          };
          setMessages(prev => [...prev, transformedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    // Verificar limite diário
    if (dailyLimit && dailyCount >= dailyLimit) {
      toast({
        title: "Limite diário atingido",
        description: `Você atingiu o limite de ${dailyLimit} mensagens por dia`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message_content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      setDailyCount(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <span>Chat com {otherUserName}</span>
          {dailyLimit && (
            <Badge variant="outline">
              {dailyCount}/{dailyLimit} mensagens hoje
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender_id === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message_content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading || (dailyLimit !== null && dailyCount >= dailyLimit)}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading || (dailyLimit !== null && dailyCount >= dailyLimit)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
