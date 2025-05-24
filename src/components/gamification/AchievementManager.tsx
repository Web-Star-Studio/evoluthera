import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Target, Calendar, BookOpen, Heart } from "lucide-react";

export const AVAILABLE_ACHIEVEMENTS = [
  {
    id: "first_mood_record",
    type: "mood_records",
    title: "Primeiro Registro",
    description: "Complete seu primeiro registro de humor",
    icon: "😊",
    requirement: 1,
    points: 10
  },
  {
    id: "mood_streak_3",
    type: "streak", 
    title: "3 Dias Consecutivos",
    description: "Registre seu humor por 3 dias seguidos",
    icon: "🔥",
    requirement: 3,
    points: 25
  },
  {
    id: "mood_streak_7",
    type: "streak",
    title: "Uma Semana Ativa",
    description: "Registre seu humor por 7 dias seguidos",
    icon: "⭐",
    requirement: 7,
    points: 50
  },
  {
    id: "mood_records_10",
    type: "mood_records",
    title: "10 Registros",
    description: "Complete 10 registros de humor",
    icon: "🎯",
    requirement: 10,
    points: 30
  },
  {
    id: "tasks_completed_5",
    type: "tasks_completed",
    title: "5 Tarefas Concluídas",
    description: "Complete 5 tarefas terapêuticas",
    icon: "✅",
    requirement: 5,
    points: 40
  },
  {
    id: "diary_entries_5",
    type: "diary_entries",
    title: "Escritor Iniciante",
    description: "Escreva 5 entradas no diário",
    icon: "📝",
    requirement: 5,
    points: 35
  }
];

interface AchievementManagerProps {
  patientId: string;
}

const AchievementManager = ({ patientId }: AchievementManagerProps) => {
  const [stats, setStats] = useState<any>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchAchievements();
  }, [patientId]);

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
    }
  };

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

  const checkAndAwardAchievements = async () => {
    if (!stats) return;

    for (const achievement of AVAILABLE_ACHIEVEMENTS) {
      const achievementId = `${achievement.type}_${achievement.title}`;
      const alreadyEarned = earnedAchievements.find(a => `${a.type}_${a.title}` === achievementId);

      if (!alreadyEarned) {
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

        if (currentValue >= achievement.requirement) {
          // Conquista desbloqueada!
          try {
            const { error } = await supabase
              .from('achievements')
              .insert({
                patient_id: patientId,
                title: achievement.title,
                description: achievement.description,
                type: achievement.type,
                icon: achievement.icon,
                points: achievement.points
              });

            if (error) throw error;

            // Atualizar a lista de conquistas obtidas
            fetchAchievements();

            // Dar pontos ao paciente
            await supabase
              .from('patient_stats')
              .update({
                total_points: (stats.total_points || 0) + achievement.points
              })
              .eq('patient_id', patientId);

            // Recarregar estatísticas
            fetchStats();

            alert(`Parabéns! Você desbloqueou a conquista "${achievement.title}" e ganhou ${achievement.points} pontos!`);
          } catch (error) {
            console.error('Erro ao salvar conquista:', error);
          }
        }
      }
    }
  };

  useEffect(() => {
    checkAndAwardAchievements();
  }, [stats, earnedAchievements]);
  

  return (
    <div className="space-y-6">
      {/* Achievement management UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Gerenciador de Conquistas
          </CardTitle>
          <CardDescription>
            Sistema automático de conquistas baseado nas atividades do paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sistema de Conquistas Ativo</h3>
            <p className="text-gray-600">
              As conquistas são verificadas automaticamente quando o paciente completa atividades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementManager;
