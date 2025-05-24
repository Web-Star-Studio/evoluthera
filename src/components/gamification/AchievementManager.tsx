
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Calendar, Flame, Heart } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  earned_at: string;
}

interface AchievementManagerProps {
  patientId: string;
}

const AchievementManager = ({ patientId }: AchievementManagerProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    streak_days: 0,
    total_points: 0,
    tasks_completed: 0,
    diary_entries_count: 0,
    mood_records_count: 0,
  });

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
      setAchievements(data || []);
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

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const checkAchievements = async () => {
    try {
      // Verificar conquista de primeira semana ativa
      if (stats.streak_days >= 7) {
        await createAchievement("primeira_semana", "Primeira Semana Ativa", "Manteve atividade por 7 dias consecutivos", "streak");
      }

      // Verificar conquista de 10 registros consecutivos
      if (stats.mood_records_count >= 10) {
        await createAchievement("dez_registros", "10 Registros de Humor", "Registrou seu humor 10 vezes", "mood");
      }

      // Verificar conquista de 5 tarefas concluídas
      if (stats.tasks_completed >= 5) {
        await createAchievement("cinco_tarefas", "5 Tarefas Concluídas", "Completou 5 tarefas terapêuticas", "tasks");
      }

      // Verificar conquista de primeiro diário
      if (stats.diary_entries_count >= 1) {
        await createAchievement("primeiro_diario", "Primeira Reflexão", "Escreveu sua primeira entrada no diário", "diary");
      }

    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  };

  const createAchievement = async (type: string, title: string, description: string, category: string) => {
    try {
      // Verificar se a conquista já existe
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('patient_id', patientId)
        .eq('type', type)
        .single();

      if (existing) return; // Conquista já existe

      const { error } = await supabase
        .from('achievements')
        .insert({
          patient_id: patientId,
          title,
          description,
          type,
          icon: getIconForCategory(category)
        });

      if (error) throw error;
      
      fetchAchievements(); // Recarregar conquistas
    } catch (error) {
      console.error('Erro ao criar conquista:', error);
    }
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "streak": return "🔥";
      case "mood": return "❤️";
      case "tasks": return "🎯";
      case "diary": return "📝";
      default: return "⭐";
    }
  };

  const getAchievementIcon = (iconString: string) => {
    switch (iconString) {
      case "🔥": return <Flame className="h-6 w-6 text-orange-500" />;
      case "❤️": return <Heart className="h-6 w-6 text-red-500" />;
      case "🎯": return <Target className="h-6 w-6 text-blue-500" />;
      case "📝": return <Calendar className="h-6 w-6 text-purple-500" />;
      default: return <Star className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Conquistas
          </h3>
          <p className="text-gray-600">Suas realizações e marcos importantes</p>
        </div>
        
        <Button onClick={checkAchievements} variant="outline" size="sm">
          Verificar Novas Conquistas
        </Button>
      </div>

      {/* Lista de Conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Conquistada
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conquista ainda</h3>
            <p className="text-gray-600 mb-4">
              Continue se envolvendo com suas atividades terapêuticas para desbloquear conquistas!
            </p>
            <Button onClick={checkAchievements} className="bg-emerald-600 hover:bg-emerald-700">
              Verificar Conquistas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conquistas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Conquistas</CardTitle>
          <CardDescription>
            Continue progredindo para desbloquear estas conquistas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <Flame className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">Primeira Semana Ativa</p>
                  <p className="text-sm text-gray-500">Mantenha atividade por 7 dias consecutivos</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{stats.streak_days}/7 dias</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">10 Registros de Humor</p>
                  <p className="text-sm text-gray-500">Registre seu humor 10 vezes</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{stats.mood_records_count}/10 registros</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">5 Tarefas Concluídas</p>
                  <p className="text-sm text-gray-500">Complete 5 tarefas terapêuticas</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{stats.tasks_completed}/5 tarefas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementManager;
