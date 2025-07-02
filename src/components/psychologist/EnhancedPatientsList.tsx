import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users, Filter, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PatientCard from "./PatientCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PatientData {
  id: string;
  patient_id: string;
  psychologist_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  } | null;
  patient_stats?: {
    tasks_completed: number;
    streak_days: number;
    mood_records_count: number;
    last_activity: string | null;
    total_points: number;
  };
  mood_analytics?: {
    avg_mood: number;
    total_mood_records: number;
    last_mood_entry: string | null;
    mood_trend: 'up' | 'down' | 'stable';
  };
}

const EnhancedPatientsList = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; patientId: string; patientName: string }>({
    open: false,
    patientId: '',
    patientName: ''
  });
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      loadPatients();
    }
  }, [profile?.id]);

  const loadPatients = async (showRefreshNotification = false) => {
    try {
      if (showRefreshNotification) setIsRefreshing(true);
      
      // Fazer uma única consulta JOIN para evitar problemas de RLS
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          profiles!patients_patient_id_fkey (
            id,
            name,
            email,
            created_at
          )
        `)
        .eq('psychologist_id', profile?.id)
        .in('status', ['active', 'inactive']);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      if (!patientsData || patientsData.length === 0) {
        setPatients([]);
        if (showRefreshNotification) {
          toast({
            title: "Dados atualizados",
            description: "0 pacientes carregados",
          });
        }
        return;
      }

      // Get patient stats and mood analytics for each patient
      const patientsWithStats = await Promise.all(
        patientsData.map(async (patient) => {
          if (!patient.profiles) {
            console.warn(`No profile found for patient: ${patient.patient_id}`);
            return patient;
          }

          // Get patient stats
          const { data: stats, error: statsError } = await supabase
            .from('patient_stats')
            .select('*')
            .eq('patient_id', patient.patient_id)
            .single();

          if (statsError && statsError.code !== 'PGRST116') {
            console.warn('Error fetching stats for patient:', patient.patient_id, statsError);
          }

          // Get mood analytics
          const { data: moodData, error: moodError } = await supabase
            .from('mood_records')
            .select('mood_score, created_at')
            .eq('patient_id', patient.patient_id)
            .order('created_at', { ascending: false });

          if (moodError) {
            console.warn('Error fetching mood data for patient:', patient.patient_id, moodError);
          }

          let mood_analytics = undefined;
          if (moodData && moodData.length > 0) {
            const avgMood = moodData.reduce((sum, record) => sum + record.mood_score, 0) / moodData.length;
            const recent = moodData.slice(0, 5);
            const older = moodData.slice(5, 10);
            
            let mood_trend: 'up' | 'down' | 'stable' = 'stable';
            if (recent.length >= 3 && older.length >= 3) {
              const recentAvg = recent.reduce((sum, r) => sum + r.mood_score, 0) / recent.length;
              const olderAvg = older.reduce((sum, r) => sum + r.mood_score, 0) / older.length;
              
              if (recentAvg > olderAvg + 0.3) mood_trend = 'up';
              else if (recentAvg < olderAvg - 0.3) mood_trend = 'down';
            }

            mood_analytics = {
              avg_mood: avgMood,
              total_mood_records: moodData.length,
              last_mood_entry: moodData[0]?.created_at || null,
              mood_trend
            };
          }

          return {
            ...patient,
            patient_stats: stats || undefined,
            mood_analytics
          };
        })
      );
      
      // Incluir todos os pacientes, mesmo aqueles sem perfis completos
      const allPatients = patientsWithStats.map(patient => {
        if (!patient.profiles) {
          // Criar um perfil básico para pacientes sem perfil
          return {
            ...patient,
            profiles: {
              id: patient.patient_id,
              name: `Paciente ${patient.patient_id.slice(0, 8)}...`,
              email: 'email@naoconfigurado.com',
              created_at: patient.created_at
            }
          };
        }
        return patient;
      });
      
      setPatients(allPatients);
      
      if (showRefreshNotification) {
        toast({
          title: "Dados atualizados",
          description: `${allPatients.length} paciente(s) carregado(s)`,
        });
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleResendCredentials = async (patientId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // Call resend credentials function
      const res = await fetch("https://phjpyojetgxfsmqhhjfa.supabase.co/functions/v1/resend-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          patientId,
          tempPassword: `temp${Math.random().toString(36).slice(2, 8)}` // Generate temp password
        }),
      });

      const response = await res.json();
      
      if (!res.ok) {
        throw new Error(response.error || "Erro ao reenviar credenciais.");
      }

      toast({
        title: "Credenciais reenviadas",
        description: response.message,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao reenviar credenciais",
        description: errorMessage || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewRecord = (patientId: string) => {
    // TODO: Implement view patient record functionality
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A visualização do prontuário será implementada em breve.",
    });
  };

  const handleDeletePatient = async (patientId: string) => {
    const patient = patients.find(p => p.patient_id === patientId);
    if (!patient) return;

    setDeleteDialog({
      open: true,
      patientId,
      patientName: patient.profiles?.name || 'Paciente'
    });
  };

  const confirmDeletePatient = async () => {
    try {
      const { patientId } = deleteDialog;
      
      console.log(`Starting permanent deletion of patient: ${patientId}`);
      
      // Executar exclusão em cascata - ordem é importante para respeitar foreign keys
      
      // 1. Deletar notificações e logs relacionados
      await supabase.from('appointment_notifications').delete().eq('recipient_id', patientId);
      await supabase.from('task_notifications').delete().eq('recipient_id', patientId);
      await supabase.from('anamnesis_notifications').delete().eq('recipient_id', patientId);
      
      // 2. Deletar mensagens e conversas
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', patientId);
      
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        await supabase.from('chat_messages').delete().in('conversation_id', conversationIds);
        await supabase.from('conversations').delete().eq('patient_id', patientId);
      }
      
      // 3. Deletar agendamentos
      await supabase.from('appointments').delete().eq('patient_id', patientId);
      
      
      // 4. Deletar histórico de anamnese
      const { data: anamnesisApps } = await supabase
        .from('anamnesis_applications')
        .select('id')
        .eq('patient_id', patientId);
      
      if (anamnesisApps && anamnesisApps.length > 0) {
        const appIds = anamnesisApps.map(a => a.id);
        await supabase.from('anamnesis_response_history').delete().in('application_id', appIds);
        await supabase.from('anamnesis_applications').delete().eq('patient_id', patientId);
      }
      
      // 7. Deletar anamnese principal
      await supabase.from('anamnesis').delete().eq('patient_id', patientId);
      
      // 8. Deletar testes psicológicos
      const { data: testApps } = await supabase
        .from('test_applications')
        .select('id')
        .eq('patient_id', patientId);
      
      if (testApps && testApps.length > 0) {
        const testAppIds = testApps.map(t => t.id);
        await supabase.from('test_results_history').delete().in('application_id', testAppIds);
        await supabase.from('test_applications').delete().eq('patient_id', patientId);
      }
      
      // 9. Deletar tarefas e respostas
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('patient_id', patientId);
      
      if (tasks && tasks.length > 0) {
        const taskIds = tasks.map(t => t.id);
        await supabase.from('task_responses').delete().in('task_id', taskIds);
        await supabase.from('tasks').delete().eq('patient_id', patientId);
      }
      
      // 10. Deletar dados pessoais e atividades
      await supabase.from('mood_records').delete().eq('patient_id', patientId);
      await supabase.from('diary_entries').delete().eq('patient_id', patientId);
      await supabase.from('sessions').delete().eq('patient_id', patientId);
      await supabase.from('achievements').delete().eq('patient_id', patientId);
      await supabase.from('patient_stats').delete().eq('patient_id', patientId);
      
      // 11. Deletar dados de pagamento e ativação
      const { data: activations } = await supabase
        .from('patient_activations')
        .select('id')
        .eq('patient_id', patientId);
      
      if (activations && activations.length > 0) {
        const activationIds = activations.map(a => a.id);
        await supabase.from('payment_transactions').delete().in('activation_id', activationIds);
        await supabase.from('patient_activations').delete().eq('patient_id', patientId);
      }
      
      await supabase.from('payment_transactions').delete().eq('patient_id', patientId);
      await supabase.from('daily_message_usage').delete().eq('patient_id', patientId);
      
      // 12. Deletar relação psicólogo-paciente
      await supabase.from('patients').delete().eq('patient_id', patientId).eq('psychologist_id', profile?.id);
      
      // 13. Por último, deletar o perfil do usuário (se não for usado por outros psicólogos)
      // Verificar se existem outros vínculos com outros psicólogos
      const { data: otherPatientRecords } = await supabase
        .from('patients')
        .select('id')
        .eq('patient_id', patientId)
        .neq('psychologist_id', profile?.id);
      
      if (!otherPatientRecords || otherPatientRecords.length === 0) {
        // Não há outros vínculos, podemos deletar o perfil e o usuário
        await supabase.from('profiles').delete().eq('id', patientId);
        
        // Deletar da tabela auth.users através de uma function (se necessário)
        // Note: Deletar da auth.users pode requerer privilégios especiais ou uma function
      }

      // Remover o paciente da lista local
      setPatients(prev => prev.filter(p => p.patient_id !== patientId));

      toast({
        title: "Paciente deletado permanentemente",
        description: `${deleteDialog.patientName} e todos os seus dados foram removidos permanentemente do sistema.`,
      });

      setDeleteDialog({ open: false, patientId: '', patientName: '' });
      
      console.log(`Patient ${patientId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Erro ao deletar paciente",
        description: "Não foi possível deletar o paciente permanentemente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    loadPatients(true);
  };

  const handleTogglePatientStatus = async (patientId: string) => {
    const patient = patients.find(p => p.patient_id === patientId);
    if (!patient) return;

    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'ativado' : 'desativado';

    try {
      const { error } = await supabase
        .from('patients')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('patient_id', patientId)
        .eq('psychologist_id', profile?.id);

      if (error) {
        throw error;
      }

      // Atualizar o paciente na lista local
      setPatients(prev => prev.map(p => 
        p.patient_id === patientId 
          ? { ...p, status: newStatus }
          : p
      ));

      toast({
        title: `Paciente ${action}`,
        description: `${patient.profiles?.name} foi ${action} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling patient status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Filtrar pacientes baseado no filtro selecionado
  const filteredPatients = patients.filter(patient => {
    if (statusFilter === 'all') return true;
    return patient.status === statusFilter;
  });

  const getFilterBadgeText = () => {
    const activeCount = patients.filter(p => p.status === 'active').length;
    const inactiveCount = patients.filter(p => p.status === 'inactive').length;
    
    switch (statusFilter) {
      case 'active': return `${activeCount} ativo${activeCount !== 1 ? 's' : ''}`;
      case 'inactive': return `${inactiveCount} inativo${inactiveCount !== 1 ? 's' : ''}`;
      default: return `${patients.length} total (${activeCount} ativo${activeCount !== 1 ? 's' : ''}, ${inactiveCount} inativo${inactiveCount !== 1 ? 's' : ''})`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-900">Carregando pacientes...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-900">
              Meus Pacientes
            </span>
            <Badge variant="secondary">
              {getFilterBadgeText()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => setStatusFilter('all')}
                >
                  Todos os pacientes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'active'}
                  onCheckedChange={() => setStatusFilter('active')}
                >
                  Apenas ativos
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'inactive'}
                  onCheckedChange={() => setStatusFilter('inactive')}
                >
                  Apenas inativos
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' 
                  ? "Nenhum paciente encontrado"
                  : statusFilter === 'active'
                  ? "Nenhum paciente ativo"
                  : "Nenhum paciente inativo"
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' 
                  ? "Você ainda não possui pacientes cadastrados. Adicione um novo paciente para começar."
                  : statusFilter === 'active'
                  ? "Todos os seus pacientes estão inativos no momento."
                  : "Todos os seus pacientes estão ativos no momento."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onResendCredentials={handleResendCredentials}
                onViewRecord={handleViewRecord}
                onDeletePatient={handleDeletePatient}
                onToggleStatus={handleTogglePatientStatus}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Deletar paciente permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja <strong>deletar permanentemente</strong> <strong>{deleteDialog.patientName}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">⚠️ Esta ação é IRREVERSÍVEL!</span>
              <br /><br />
              Todos os dados do paciente serão removidos permanentemente, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Perfil e informações pessoais</li>
                <li>Registros de humor e atividades</li>
                <li>Tarefas e respostas</li>
                <li>Anamneses e testes psicológicos</li>
                <li>Sessões e documentos clínicos</li>
                <li>Conversas e mensagens</li>
                <li>Agendamentos e notificações</li>
                <li>Todas as estatísticas e conquistas</li>
              </ul>
              <br />
              <strong>O paciente não poderá mais acessar a plataforma e todos os dados serão perdidos definitivamente.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePatient}
              className="bg-red-600 hover:bg-red-700"
            >
              ⚠️ Deletar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnhancedPatientsList;
