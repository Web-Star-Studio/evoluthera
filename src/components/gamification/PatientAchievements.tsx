
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Target } from "lucide-react";
import { AVAILABLE_ACHIEVEMENTS } from "./AchievementManager";

interface PatientAchievementsProps {
  patientId: string;
  showProgress?: boolean;
}

const PatientAchievements = ({ patientId, showProgress = true }: PatientAchievementsProps) => {
  const [earnedAchievements, setEarnedAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    fetchStats();
  }, [patientId]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('patient_id', patientId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setEarnedAchievements(data || []);
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_stats')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressForAchievement = (achievement: any) => {
    if (!stats) return 0;
    
    let currentValue = 0;
    switch (achievement.type) {
      case 'streak':
        currentValue = stats.streak_days || 0;
        break;
      case 'mood_records':
        currentValue = stats.mood_records_count || 0;
        break;
      case 'tasks_completed':
        currentValue = stats.tasks_completed || 0;
        break;
      case 'diary_entries':
        currentValue = stats.diary_entries_count || 0;
        break;
    }
    
    return Math.min((currentValue / achievement.requirement) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando conquistas...</div>
        </CardContent>
      </Card>
    );
  }

  const earnedIds = new Set(earnedAchievements.map(a => `${a.type}_${a.title}`));
  const pendingAchievements = AVAILABLE_ACHIEVEMENTS.filter(
    a => !earnedIds.has(`${a.type}_${a.title}`)
  );

  return (
    <div className="space-y-6">
      {/* Conquistas Obtidas */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Conquistas Desbloqueadas
            </CardTitle>
            <CardDescription>
              Parabéns por estes marcos importantes!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Conquistado em {formatDate(achievement.earned_at)}
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    Obtida
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Conquistas */}
      {showProgress && pendingAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Próximas Conquistas
            </CardTitle>
            <CardDescription>
              Continue assim para desbloquear mais marcos!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAchievements.slice(0, 4).map((achievement) => {
                const progress = getProgressForAchievement(achievement);
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl opacity-60">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-700">{achievement.title}</div>
                      <div className="text-sm text-gray-500">{achievement.description}</div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sem conquistas ainda */}
      {earnedAchievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Suas conquistas aparecerão aqui
            </h3>
            <p className="text-gray-500">
              Continue registrando seu humor, completando tarefas e fazendo anotações para desbloquear suas primeiras conquistas!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAchievements;
