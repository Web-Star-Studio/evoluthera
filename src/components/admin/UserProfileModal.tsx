
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Calendar, Activity, MessageSquare, FileText } from "lucide-react";

interface UserProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

interface PatientStats {
  user_type: 'patient';
  tasks_completed?: number;
  mood_records_count?: number;
  diary_entries_count?: number;
  total_points?: number;
  mood_records_total?: number;
  tasks_total?: number;
  [key: string]: any;
}

interface PsychologistStats {
  user_type: 'psychologist';
  patients_count: number;
  sessions_count: number;
  templates_count: number;
}

type UserStats = PatientStats | PsychologistStats | null;

const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user.id],
    queryFn: async (): Promise<UserStats> => {
      if (user.user_type === 'patient') {
        // Buscar estatísticas do paciente
        const { data: stats } = await supabase
          .from('patient_stats')
          .select('*')
          .eq('patient_id', user.id)
          .single();

        const { data: moodCount } = await supabase
          .from('mood_records')
          .select('id', { count: 'exact' })
          .eq('patient_id', user.id);

        const { data: taskCount } = await supabase
          .from('tasks')
          .select('id', { count: 'exact' })
          .eq('patient_id', user.id);

        return {
          ...stats,
          mood_records_total: moodCount?.length || 0,
          tasks_total: taskCount?.length || 0,
          user_type: 'patient'
        } as PatientStats;
      } else if (user.user_type === 'psychologist') {
        // Buscar estatísticas do psicólogo
        const { data: patientsCount } = await supabase
          .from('patients')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', user.id);

        const { data: sessionsCount } = await supabase
          .from('sessions')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', user.id);

        const { data: templatesCount } = await supabase
          .from('anamnesis_templates')
          .select('id', { count: 'exact' })
          .eq('psychologist_id', user.id);

        return {
          patients_count: patientsCount?.length || 0,
          sessions_count: sessionsCount?.length || 0,
          templates_count: templatesCount?.length || 0,
          user_type: 'psychologist'
        } as PsychologistStats;
      }
      return null;
    },
    enabled: isOpen && !!user
  });

  const getUserTypeLabel = (userType: string) => {
    const labels = {
      admin: 'Administrador',
      psychologist: 'Psicólogo',
      patient: 'Paciente'
    };
    return labels[userType as keyof typeof labels] || userType;
  };

  const getStatusBadge = () => {
    const status = Array.isArray(user.account_controls) && user.account_controls.length > 0 
      ? user.account_controls[0].status 
      : 'active';
    const variant = status === 'active' ? 'default' : status === 'suspended' ? 'destructive' : 'secondary';
    const label = status === 'active' ? 'Ativo' : status === 'suspended' ? 'Suspenso' : 'Inativo';
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Usuário</label>
                  <p className="text-lg">{getUserTypeLabel(user.user_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Cadastro</label>
                <p className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Uso */}
          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.user_type === 'patient' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{(userStats as PatientStats).tasks_completed || 0}</div>
                      <div className="text-sm text-blue-800">Tarefas Concluídas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{(userStats as PatientStats).mood_records_count || 0}</div>
                      <div className="text-sm text-green-800">Registros de Humor</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{(userStats as PatientStats).diary_entries_count || 0}</div>
                      <div className="text-sm text-purple-800">Entradas no Diário</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{(userStats as PatientStats).total_points || 0}</div>
                      <div className="text-sm text-orange-800">Total de Pontos</div>
                    </div>
                  </div>
                ) : userStats.user_type === 'psychologist' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{(userStats as PsychologistStats).patients_count}</div>
                      <div className="text-sm text-blue-800">Pacientes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{(userStats as PsychologistStats).sessions_count}</div>
                      <div className="text-sm text-green-800">Sessões Registradas</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{(userStats as PsychologistStats).templates_count}</div>
                      <div className="text-sm text-purple-800">Templates de Anamnese</div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Informações de Suspensão (se aplicável) */}
          {user.account_controls && user.account_controls.length > 0 && user.account_controls[0].status === 'suspended' && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Informações de Suspensão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Motivo</label>
                    <p>{user.account_controls[0].suspension_reason || 'Não informado'}</p>
                  </div>
                  {user.account_controls[0].suspended_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data da Suspensão</label>
                      <p>{new Date(user.account_controls[0].suspended_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
