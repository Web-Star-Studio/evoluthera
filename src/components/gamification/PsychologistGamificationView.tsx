
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Target, Flame } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  stats: any;
  recentAchievements: any[];
}

interface PsychologistGamificationViewProps {
  psychologistId: string;
}

const PsychologistGamificationView = ({ psychologistId }: PsychologistGamificationViewProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [psychologistId]);

  const fetchPatients = async () => {
    try {
      // Buscar pacientes do psicólogo
      const { data: patientRelations, error: relationsError } = await supabase
        .from('patients')
        .select(`
          patient_id,
          profiles!patients_patient_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('psychologist_id', psychologistId)
        .eq('status', 'active');

      if (relationsError) throw relationsError;

      const patientsData = await Promise.all(
        patientRelations?.map(async (relation: any) => {
          const patientId = relation.patient_id;
          
          // Buscar estatísticas
          const { data: stats } = await supabase
            .from('patient_stats')
            .select('*')
            .eq('patient_id', patientId)
            .single();

          // Buscar conquistas recentes (últimos 30 dias)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: achievements } = await supabase
            .from('achievements')
            .select('*')
            .eq('patient_id', patientId)
            .gte('earned_at', thirtyDaysAgo.toISOString())
            .order('earned_at', { ascending: false });

          return {
            id: patientId,
            name: relation.profiles.name,
            email: relation.profiles.email,
            stats: stats || {},
            recentAchievements: achievements || []
          };
        }) || []
      );

      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao buscar dados dos pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (dateString: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `${diffDays} dias atrás`;
  };

  const getEngagementLevel = (stats: any) => {
    const points = stats.total_points || 0;
    const streak = stats.streak_days || 0;
    const lastActivity = stats.last_activity;
    
    if (!lastActivity) return { level: 'Inativo', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    
    const daysSinceActivity = Math.floor(
      (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActivity > 7) return { level: 'Baixo', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (points >= 200 && streak >= 7) return { level: 'Alto', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (points >= 100 || streak >= 3) return { level: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Baixo', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dados de gamificação...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Gamificação dos Pacientes
          </CardTitle>
          <CardDescription>
            Acompanhe o engajamento e conquistas dos seus pacientes
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patients.map((patient) => {
          const engagement = getEngagementLevel(patient.stats);
          
          return (
            <Card key={patient.id} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription className="text-sm">{patient.email}</CardDescription>
                  </div>
                  <Badge className={`${engagement.color} ${engagement.bgColor} border-0`}>
                    {engagement.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-800">
                        {patient.stats.total_points || 0} pontos
                      </div>
                      <div className="text-xs text-blue-600">Total acumulado</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <Flame className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-orange-800">
                        {patient.stats.streak_days || 0} dias
                      </div>
                      <div className="text-xs text-orange-600">Sequência ativa</div>
                    </div>
                  </div>
                </div>

                {/* Atividades */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm font-semibold">{patient.stats.mood_records_count || 0}</div>
                    <div className="text-xs text-gray-600">Humores</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm font-semibold">{patient.stats.tasks_completed || 0}</div>
                    <div className="text-xs text-gray-600">Tarefas</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm font-semibold">{patient.stats.diary_entries_count || 0}</div>
                    <div className="text-xs text-gray-600">Diários</div>
                  </div>
                </div>

                {/* Conquistas Recentes */}
                {patient.recentAchievements.length > 0 ? (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Conquistas Recentes:
                    </div>
                    <div className="space-y-1">
                      {patient.recentAchievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-2 text-sm">
                          <span>{achievement.icon}</span>
                          <span className="text-gray-700">{achievement.title}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Nenhuma conquista recente
                  </div>
                )}

                {/* Última Atividade */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Última atividade: {formatLastActivity(patient.stats.last_activity)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {patients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum paciente encontrado
            </h3>
            <p className="text-gray-500">
              Os dados de gamificação aparecerão quando você tiver pacientes ativos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PsychologistGamificationView;
