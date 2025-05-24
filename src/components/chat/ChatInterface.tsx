
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Send, Paperclip, Smile, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, Conversation, ChatSettings } from "@/types/chat";

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  userType: 'patient' | 'psychologist';
}

const ChatInterface = ({ conversationId, currentUserId, userType }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    fetchChatSettings();
    fetchDailyUsage();
    subscribeToMessages();
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
          profiles:sender_id (name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    }
  };

  const fetchChatSettings = async () => {
    if (userType === 'patient') {
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('psychologist_id')
          .eq('id', conversationId)
          .single();

        if (conversation) {
          const { data: settings } = await supabase
            .from('chat_settings')
            .select('*')
            .eq('psychologist_id', conversation.psychologist_id)
            .single();

          setChatSettings(settings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do chat:', error);
      }
    }
  };

  const fetchDailyUsage = async () => {
    if (userType === 'patient') {
      try {
        const { data } = await supabase
          .from('daily_message_usage')
          .select('message_count')
          .eq('patient_id', currentUserId)
          .eq('usage_date', new Date().toISOString().split('T')[0])
          .single();

        setDailyMessageCount(data?.message_count || 0);
      } catch (error) {
        console.error('Erro ao carregar uso diário:', error);
      }
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
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const canSendMessage = () => {
    if (userType === 'psychologist') return true;
    
    const limit = chatSettings?.daily_message_limit || 10;
    return dailyMessageCount < limit;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const messageLength = newMessage.length;
    const maxLength = chatSettings?.max_message_length || 1000;

    if (messageLength > maxLength) {
      toast({
        title: "Mensagem muito longa",
        description: `A mensagem deve ter no máximo ${maxLength} caracteres`,
        variant: "destructive",
      });
      return;
    }

    if (!canSendMessage()) {
      toast({
        title: "Limite diário atingido",
        description: "Você atingiu o limite de mensagens para hoje",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message_content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      if (userType === 'patient') {
        setDailyMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const isMyMessage = (senderId: string) => senderId === currentUserId;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat Terapêutico
          {userType === 'patient' && chatSettings && (
            <Badge variant="outline" className="ml-auto">
              {dailyMessageCount}/{chatSettings.daily_message_limit} mensagens hoje
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Comece a conversa!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isMyMessage(message.sender_id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message_content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    isMyMessage(message.sender_id) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {chatSettings && !chatSettings.chat_enabled ? (
            <div className="text-center text-gray-500 py-4">
              <p>O chat está desativado pelo psicólogo</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    canSendMessage() 
                      ? "Digite sua mensagem..." 
                      : "Limite diário de mensagens atingido"
                  }
                  disabled={!canSendMessage() || loading}
                  rows={2}
                  className="resize-none"
                />
                {chatSettings && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      {newMessage.length}/{chatSettings.max_message_length} caracteres
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  disabled
                  title="Anexos (em breve)"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  disabled
                  title="Emojis (em breve)"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !canSendMessage() || loading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
