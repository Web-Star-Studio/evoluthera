
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Communication {
  id: string;
  title: string;
  message: string;
  message_type: 'text' | 'html';
  created_at: string;
  sender_name: string;
}

const CommunicationNotifications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnreadCommunications();
  }, []);

  const fetchUnreadCommunications = async () => {
    try {
      const { data, error } = await supabase.rpc('get_unread_communications');
      
      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (communicationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_communication_as_read', {
        communication_uuid: communicationId
      });

      if (error) throw error;

      setCommunications(prev => prev.filter(comm => comm.id !== communicationId));
      
      toast({
        title: "Sucesso",
        description: "Comunicado marcado como lido",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar como lido",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = communications.map(comm => 
        supabase.rpc('mark_communication_as_read', {
          communication_uuid: comm.id
        })
      );

      await Promise.all(promises);
      setCommunications([]);
      
      toast({
        title: "Sucesso",
        description: "Todos os comunicados marcados como lidos",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar todos como lidos",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (communications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Comunicados ({communications.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            <Check className="mr-1 h-3 w-3" />
            Marcar todos como lidos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {communications.map((comm) => (
          <div key={comm.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{comm.title}</h4>
                <p className="text-xs text-gray-500">
                  Por {comm.sender_name} • {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(comm.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-700">
              {comm.message_type === 'html' ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: comm.message }} 
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <p className="whitespace-pre-wrap">{comm.message}</p>
              )}
            </div>
            
            <Badge variant="secondary" className="text-xs">
              Novo
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunicationNotifications;
