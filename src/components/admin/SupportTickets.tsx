import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Eye
} from "lucide-react";

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  user_profile: {
    name: string;
    email: string;
    user_type: string;
  } | null;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  responder_profile: {
    name: string;
    user_type: string;
  } | null;
}

const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', searchTerm, statusFilter, priorityFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user_profile:profiles!support_tickets_user_id_fkey (
            name,
            email,
            user_type
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`subject.ilike.%${searchTerm}%, message.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  const { data: responses } = useQuery({
    queryKey: ['ticket-responses', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .select(`
          *,
          responder_profile:profiles!support_ticket_responses_responder_id_fkey (
            name,
            user_type
          )
        `)
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketResponse[];
    },
    enabled: !!selectedTicket?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      if (status === 'resolvido') {
        const { error } = await supabase.rpc('resolve_support_ticket', {
          ticket_id: ticketId
        });
        if (error) throw error;
      } else if (status === 'reaberto') {
        const { error } = await supabase.rpc('reopen_support_ticket', {
          ticket_id: ticketId
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('support_tickets')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', ticketId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Status atualizado",
        description: "O status do ticket foi atualizado com sucesso"
      });
    },
    onError: (error) => {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do ticket",
        variant: "destructive"
      });
    }
  });

  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: string; message: string; isInternal: boolean }) => {
      const { error } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: ticketId,
          responder_id: (await supabase.auth.getUser()).data.user?.id,
          message,
          is_internal: isInternal
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-responses'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setResponseMessage("");
      setIsInternal(false);
      toast({
        title: "Resposta enviada",
        description: "A resposta foi enviada com sucesso"
      });
    },
    onError: (error) => {
      console.error('Error adding response:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: "Não foi possível enviar a resposta",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'novo': { label: 'Novo', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'em_andamento': { label: 'Em Andamento', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'respondido': { label: 'Respondido', variant: 'outline' as const, color: 'bg-green-100 text-green-800' },
      'resolvido': { label: 'Resolvido', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'reaberto': { label: 'Reaberto', variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.novo;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'baixa': { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
      'normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
      'alta': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
      'urgente': { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'geral': MessageSquare,
      'tecnico': AlertTriangle,
      'financeiro': Clock,
      'conta': User,
      'funcionalidade': CheckCircle
    };
    const Icon = icons[category as keyof typeof icons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suporte Interno</h1>
          <p className="text-gray-600">Gerenciamento de tickets de atendimento</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por assunto ou mensagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="respondido">Respondido</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="reaberto">Reaberto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="conta">Conta</SelectItem>
                  <SelectItem value="funcionalidade">Funcionalidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['novo', 'em_andamento', 'respondido', 'resolvido', 'reaberto'].map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </div>
              <div className="text-2xl font-bold">
                {tickets?.filter(ticket => ticket.status === status).length || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        Carregando tickets...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tickets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Nenhum ticket encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{ticket.user_profile?.name || 'Usuário não encontrado'}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ticket.user_profile?.email || 'Email não disponível'}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {ticket.user_profile?.user_type === 'psychologist' ? 'Psicólogo' : 'Paciente'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{ticket.subject}</div>
                          <div className="text-sm text-gray-500 truncate">{ticket.message}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="capitalize">{ticket.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</div>
                          <div className="text-gray-500">
                            {new Date(ticket.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Ticket #{ticket.id.slice(0, 8)}</DialogTitle>
                              </DialogHeader>
                              
                              {selectedTicket && (
                                <div className="space-y-6">
                                  {/* Informações do Ticket */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Informações do Usuário</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Nome:</strong> {selectedTicket.user_profile?.name || 'N/A'}</div>
                                        <div><strong>Email:</strong> {selectedTicket.user_profile?.email || 'N/A'}</div>
                                        <div><strong>Tipo:</strong> {selectedTicket.user_profile?.user_type === 'psychologist' ? 'Psicólogo' : 'Paciente'}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Detalhes do Ticket</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong> {getStatusBadge(selectedTicket.status)}</div>
                                        <div><strong>Prioridade:</strong> {getPriorityBadge(selectedTicket.priority)}</div>
                                        <div><strong>Categoria:</strong> {selectedTicket.category}</div>
                                        <div><strong>Criado em:</strong> {new Date(selectedTicket.created_at).toLocaleString('pt-BR')}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mensagem Original */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Assunto: {selectedTicket.subject}</h4>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                                    </div>
                                  </div>

                                  {/* Histórico de Respostas */}
                                  <div>
                                    <h4 className="font-semibold mb-4">Histórico de Atendimento</h4>
                                    <div className="space-y-4 max-h-60 overflow-y-auto">
                                      {responses?.map((response) => (
                                        <div key={response.id} className={`p-4 rounded-lg ${
                                          response.responder_profile?.user_type === 'admin' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                                        }`}>
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                              <strong className="text-sm">
                                                {response.responder_profile?.name || 'Usuário'} 
                                                {response.responder_profile?.user_type === 'admin' && ' (Admin)'}
                                              </strong>
                                              {response.is_internal && (
                                                <Badge variant="secondary" className="text-xs">Interno</Badge>
                                              )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {new Date(response.created_at).toLocaleString('pt-BR')}
                                            </span>
                                          </div>
                                          <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Nova Resposta */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Adicionar Resposta</h4>
                                    <div className="space-y-4">
                                      <Textarea
                                        placeholder="Digite sua resposta..."
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        rows={4}
                                      />
                                      <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                          />
                                          <span className="text-sm">Nota interna (apenas para admins)</span>
                                        </label>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => addResponseMutation.mutate({
                                            ticketId: selectedTicket.id,
                                            message: responseMessage,
                                            isInternal
                                          })}
                                          disabled={!responseMessage.trim() || addResponseMutation.isPending}
                                        >
                                          Enviar Resposta
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Ações do Ticket */}
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-4">Ações do Ticket</h4>
                                    <div className="flex gap-2">
                                      {selectedTicket.status !== 'resolvido' && (
                                        <Button
                                          onClick={() => updateStatusMutation.mutate({
                                            ticketId: selectedTicket.id,
                                            status: 'resolvido'
                                          })}
                                          disabled={updateStatusMutation.isPending}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Marcar como Resolvido
                                        </Button>
                                      )}

                                      {selectedTicket.status === 'resolvido' && (
                                        <Button
                                          onClick={() => updateStatusMutation.mutate({
                                            ticketId: selectedTicket.id,
                                            status: 'reaberto'
                                          })}
                                          disabled={updateStatusMutation.isPending}
                                          variant="outline"
                                        >
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          Reabrir Ticket
                                        </Button>
                                      )}

                                      {selectedTicket.status === 'novo' && (
                                        <Button
                                          onClick={() => updateStatusMutation.mutate({
                                            ticketId: selectedTicket.id,
                                            status: 'em_andamento'
                                          })}
                                          disabled={updateStatusMutation.isPending}
                                          variant="outline"
                                        >
                                          <Clock className="h-4 w-4 mr-2" />
                                          Colocar em Andamento
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTickets;
