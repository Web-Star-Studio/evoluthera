
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Send, MessageSquare, Lock, Unlock, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnamnesisApplication {
  id: string;
  status: 'sent' | 'in_progress' | 'completed' | 'locked';
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  started_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
    description: string;
  };
  responses: Record<string, any>;
  psychologist_notes: Record<string, string>;
}

interface AnamnesisApplicationsListProps {
  searchTerm: string;
}

const AnamnesisApplicationsList = ({ searchTerm }: AnamnesisApplicationsListProps) => {
  const [applications, setApplications] = useState<AnamnesisApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<AnamnesisApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, applications, statusFilter]);

  const loadApplications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('anamnesis_applications')
        .select(`
          *,
          patient:profiles!anamnesis_applications_patient_id_fkey(name, email),
          template:anamnesis_templates(name, description)
        `)
        .eq('psychologist_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedApplications: AnamnesisApplication[] = (data || []).map(app => ({
        id: app.id,
        status: app.status as AnamnesisApplication['status'],
        created_at: app.created_at,
        sent_at: app.sent_at,
        completed_at: app.completed_at,
        locked_at: app.locked_at,
        started_at: app.started_at,
        patient: {
          name: app.patient?.name || 'Paciente não encontrado',
          email: app.patient?.email || ''
        },
        template: {
          name: app.template?.name || 'Template não encontrado',
          description: app.template?.description || ''
        },
        responses: app.responses || {},
        psychologist_notes: app.psychologist_notes || {}
      }));
      
      setApplications(typedApplications);
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aplicações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.template.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'locked') {
        updateData.locked_at = new Date().toISOString();
      } else if (newStatus === 'completed' && !applications.find(a => a.id === applicationId)?.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('anamnesis_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      await loadApplications();
      toast({
        title: "Sucesso",
        description: `Status alterado para ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      sent: { label: "Enviado", variant: "default" as const },
      in_progress: { label: "Em Andamento", variant: "default" as const },
      completed: { label: "Concluído", variant: "default" as const },
      locked: { label: "Bloqueado", variant: "destructive" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.sent;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      sent: "Enviado",
      in_progress: "Em Andamento", 
      completed: "Concluído",
      locked: "Bloqueado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getCompletionPercentage = (responses: Record<string, any>) => {
    // Simple calculation - can be improved based on actual template structure
    const totalResponses = Object.keys(responses).length;
    const filledResponses = Object.values(responses).filter(value => 
      value && value !== '' && value !== null && value !== undefined
    ).length;
    
    if (totalResponses === 0) return 0;
    return Math.round((filledResponses / totalResponses) * 100);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando aplicações...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Aplicações de Anamnese
            </CardTitle>
            <CardDescription>
              {filteredApplications.length} aplicações encontradas
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="locked">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border-l-4 border-l-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-semibold">{application.patient.name}</span>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{application.patient.email}</p>
                      <p className="text-sm font-medium">{application.template.name}</p>
                      {application.template.description && (
                        <p className="text-xs text-gray-500 mt-1">{application.template.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Criado: {formatDate(application.created_at)}</span>
                      </div>
                      {application.completed_at && (
                        <div>Concluído: {formatDate(application.completed_at)}</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Enviado:</span><br />
                      {formatDate(application.sent_at)}
                    </div>
                    <div>
                      <span className="font-medium">Iniciado:</span><br />
                      {formatDate(application.started_at)}
                    </div>
                    <div>
                      <span className="font-medium">Concluído:</span><br />
                      {formatDate(application.completed_at)}
                    </div>
                    <div>
                      <span className="font-medium">Progresso:</span><br />
                      {getCompletionPercentage(application.responses)}%
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    
                    {application.status === 'completed' && !application.locked_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(application.id, 'locked')}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Bloquear
                      </Button>
                    )}

                    {application.status === 'locked' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(application.id, 'completed')}
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Desbloquear
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Adicionar Nota
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma aplicação encontrada</p>
            <p className="text-sm">Crie templates e aplique-os aos pacientes para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnamnesisApplicationsList;
