
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Users, Eye, Clock, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Communication {
  id: string;
  title: string;
  message: string;
  message_type: string;
  target_type: string;
  target_users: string[] | null;
  send_email: boolean;
  status: string;
  sent_at: string | null;
  created_at: string;
  created_by: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  user_type: string;
}

type MessageType = 'text' | 'html';
type TargetType = 'all_psychologists' | 'all_patients' | 'specific_users';

const CommunicationManager = () => {
  const { profile } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    message_type: 'text' as MessageType,
    target_type: 'all_psychologists' as TargetType,
    target_users: [] as string[],
    send_email: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunications();
    fetchUsers();
  }, []);

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar comunicados",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, user_type')
        .in('user_type', ['psychologist', 'patient']);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('admin_communications')
        .insert({
          title: formData.title,
          message: formData.message,
          message_type: formData.message_type,
          target_type: formData.target_type,
          target_users: formData.target_type === 'specific_users' ? formData.target_users : null,
          send_email: formData.send_email,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      // Criar registros para recipients específicos se necessário
      if (formData.target_type === 'specific_users' && formData.target_users.length > 0) {
        const recipients = formData.target_users.map(userId => ({
          communication_id: data.id,
          user_id: userId
        }));

        await supabase
          .from('communication_recipients')
          .insert(recipients);
      }

      toast({
        title: "Sucesso",
        description: "Comunicado enviado com sucesso!",
        variant: "default"
      });

      setFormData({
        title: '',
        message: '',
        message_type: 'text',
        target_type: 'all_psychologists',
        target_users: [],
        send_email: false
      });

      fetchCommunications();
    } catch (error) {
      console.error('Error sending communication:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar comunicado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTargetDescription = (comm: Communication) => {
    switch (comm.target_type) {
      case 'all_psychologists':
        return 'Todos os psicólogos';
      case 'all_patients':
        return 'Todos os pacientes';
      case 'specific_users':
        return `${comm.target_users?.length || 0} usuários específicos`;
      default:
        return 'Não definido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    if (formData.target_type === 'all_psychologists') return user.user_type === 'psychologist';
    if (formData.target_type === 'all_patients') return user.user_type === 'patient';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-gray-600">Gerencie comunicados para usuários da plataforma</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">Novo Comunicado</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Comunicado</CardTitle>
              <CardDescription>Envie comunicados para usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título do comunicado"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message_type">Tipo de Mensagem</Label>
                    <Select
                      value={formData.message_type}
                      onValueChange={(value: MessageType) => 
                        setFormData({ ...formData, message_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Simples</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conteúdo do comunicado"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_type">Destinatários</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value: TargetType) => 
                        setFormData({ ...formData, target_type: value, target_users: [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_psychologists">Todos os Psicólogos</SelectItem>
                        <SelectItem value="all_patients">Todos os Pacientes</SelectItem>
                        <SelectItem value="specific_users">Usuários Específicos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.target_type === 'specific_users' && (
                    <div className="space-y-2">
                      <Label>Selecionar Usuários</Label>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                        {filteredUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={user.id}
                              checked={formData.target_users.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    target_users: [...formData.target_users, user.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    target_users: formData.target_users.filter(id => id !== user.id)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={user.id} className="text-sm">
                              {user.name} ({user.email}) - {user.user_type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_email"
                    checked={formData.send_email}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_email: checked })}
                  />
                  <Label htmlFor="send_email">Enviar também por e-mail</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Comunicado
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Comunicados</CardTitle>
              <CardDescription>Visualize todos os comunicados enviados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{comm.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {comm.message.substring(0, 100)}
                          {comm.message.length > 100 && '...'}
                        </p>
                      </div>
                      <Badge className={`ml-4 ${getStatusColor(comm.status)}`}>
                        {comm.status === 'sent' ? 'Enviado' : comm.status === 'draft' ? 'Rascunho' : 'Agendado'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {getTargetDescription(comm)}
                      </div>
                      {comm.send_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          E-mail enviado
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(comm.sent_at || comm.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{comm.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <strong>Destinatários:</strong> {getTargetDescription(comm)}
                          </div>
                          <div>
                            <strong>Tipo:</strong> {comm.message_type === 'html' ? 'HTML' : 'Texto Simples'}
                          </div>
                          <div>
                            <strong>Mensagem:</strong>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              {comm.message_type === 'html' ? (
                                <div dangerouslySetInnerHTML={{ __html: comm.message }} />
                              ) : (
                                <p className="whitespace-pre-wrap">{comm.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}

                {communications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum comunicado encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationManager;
