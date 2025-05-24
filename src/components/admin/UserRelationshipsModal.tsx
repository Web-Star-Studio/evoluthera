
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Users, User, Calendar, Activity } from "lucide-react";

interface UserRelationshipsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const UserRelationshipsModal = ({ user, isOpen, onClose }: UserRelationshipsModalProps) => {
  const { data: relationships, isLoading } = useQuery({
    queryKey: ['user-relationships', user.id],
    queryFn: async () => {
      if (user.user_type === 'psychologist') {
        // Buscar pacientes do psicólogo
        const { data: patients } = await supabase
          .from('patients')
          .select(`
            *,
            patient:profiles!patients_patient_id_fkey(name, email, created_at),
            patient_activations(status, activated_at, deactivated_at)
          `)
          .eq('psychologist_id', user.id);

        // Buscar estatísticas de cada paciente
        const patientsWithStats = await Promise.all(
          (patients || []).map(async (patient) => {
            const { data: stats } = await supabase
              .from('patient_stats')
              .select('*')
              .eq('patient_id', patient.patient_id)
              .single();

            const { data: lastActivity } = await supabase
              .from('mood_records')
              .select('created_at')
              .eq('patient_id', patient.patient_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...patient,
              stats,
              last_activity: lastActivity?.created_at || null
            };
          })
        );

        return patientsWithStats;
      }
      return [];
    },
    enabled: isOpen && user.user_type === 'psychologist'
  });

  const getActivationStatus = (activations: any[]) => {
    if (!activations || activations.length === 0) return { status: 'inactive', label: 'Inativo' };
    
    const activeActivation = activations.find(a => a.status === 'active' && !a.deactivated_at);
    if (activeActivation) return { status: 'active', label: 'Ativo' };
    
    return { status: 'inactive', label: 'Inativo' };
  };

  if (user.user_type !== 'psychologist') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pacientes de {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {relationships?.length || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total de Pacientes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {relationships?.filter(r => getActivationStatus(r.patient_activations).status === 'active').length || 0}
                  </div>
                  <div className="text-sm text-green-800">Pacientes Ativos</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {relationships?.filter(r => {
                      const lastActivity = r.last_activity;
                      if (!lastActivity) return false;
                      const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceActivity <= 7;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-orange-800">Ativos (últimos 7 dias)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pacientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando pacientes...</div>
              ) : relationships?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum paciente encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Tarefas Concluídas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relationships?.map((relationship) => {
                        const activationStatus = getActivationStatus(relationship.patient_activations);
                        const lastActivity = relationship.last_activity 
                          ? new Date(relationship.last_activity)
                          : null;
                        const daysSinceActivity = lastActivity 
                          ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
                          : null;

                        return (
                          <TableRow key={relationship.id}>
                            <TableCell className="font-medium">
                              {relationship.patient?.name || 'Nome não disponível'}
                            </TableCell>
                            <TableCell>
                              {relationship.patient?.email || 'Email não disponível'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={activationStatus.status === 'active' ? 'default' : 'secondary'}
                              >
                                {activationStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {lastActivity ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className={daysSinceActivity && daysSinceActivity > 7 ? 'text-red-600' : 'text-green-600'}>
                                    {daysSinceActivity === 0 ? 'Hoje' : 
                                     daysSinceActivity === 1 ? 'Ontem' : 
                                     `${daysSinceActivity} dias atrás`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Nunca</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-purple-600">
                                {relationship.stats?.total_points || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-blue-600">
                                {relationship.stats?.tasks_completed || 0}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRelationshipsModal;
