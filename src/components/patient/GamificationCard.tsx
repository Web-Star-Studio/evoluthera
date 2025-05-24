
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Award, Target, Heart, BookOpen, Flame, Star, Trophy } from "lucide-react";
import PatientAchievements from "../gamification/PatientAchievements";

const GamificationCard = () => {
  const [stats, setStats] = useState({
    streak_days: 0,
    total_points: 0,
    tasks_completed: 0,
    diary_entries_count: 0,
    mood_records_count: 0,
  });

  const patientId = "temp-user-id"; // Substituir por auth.uid()

  useEffect(() => {
    fetchStats();
  }, []);

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
      } else {
        // Criar registro se não existir
        await supabase
          .from('patient_stats')
          .insert({ patient_id: patientId });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const getLevel = (points: number) => {
    if (points >= 1000) return 6;
    if (points >= 500) return 5;
    if (points >= 250) return 4;
    if (points >= 100) return 3;
    if (points >= 50) return 2;
    return 1;
  };

  const getPointsForNextLevel = (points: number) => {
    const levels = [0, 50, 100, 250, 500, 1000];
    const currentLevel = getLevel(points);
    return currentLevel < levels.length ? levels[currentLevel] : levels[levels.length - 1];
  };

  const currentLevel = getLevel(stats.total_points);
  const nextLevelPoints = getPointsForNextLevel(stats.total_points);
  const pointsInLevel = currentLevel > 1 ? stats.total_points - getPointsForNextLevel(stats.total_points - 1) : stats.total_points;
  const levelRange = currentLevel > 1 ? nextLevelPoints - getPointsForNextLevel(stats.total_points - 1) : nextLevelPoints;
  const progressToNextLevel = currentLevel < 6 ? (pointsInLevel / levelRange) * 100 : 100;

  const milestones = [
    { 
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: "Sequência Ativa",
      value: stats.streak_days,
      description: "dias seguidos",
      color: "from-orange-50 to-orange-100 border-orange-200"
    },
    { 
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Registros de Humor",
      value: stats.mood_records_count,
      description: "registros feitos",
      color: "from-red-50 to-red-100 border-red-200"
    },
    { 
      icon: <Target className="h-6 w-6 text-blue-500" />,
      title: "Tarefas Completadas",
      value: stats.tasks_completed,
      description: "atividades realizadas",
      color: "from-blue-50 to-blue-100 border-blue-200"
    },
    { 
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      title: "Entradas no Diário",
      value: stats.diary_entries_count,
      description: "reflexões escritas",
      color: "from-purple-50 to-purple-100 border-purple-200"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Level and Points */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-emerald-600" />
            Nível {currentLevel}
          </CardTitle>
          <CardDescription>Você tem {stats.total_points} pontos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.total_points}</div>
            <div className="text-sm text-gray-600">pontos totais</div>
          </div>
          
          {currentLevel < 6 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o nível {currentLevel + 1}</span>
                <span>{nextLevelPoints - stats.total_points} pontos restantes</span>
              </div>
              <Progress value={progressToNextLevel} className="h-3" />
            </div>
          )}

          {currentLevel === 6 && (
            <div className="text-center">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="h-4 w-4 mr-1" />
                Nível Máximo Atingido!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {milestones.map((milestone, index) => (
          <Card key={index} className={`bg-gradient-to-r ${milestone.color}`}>
            <CardContent className="p-4 text-center">
              <div className="mb-2">{milestone.icon}</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{milestone.value}</div>
              <div className="text-xs text-gray-600 font-medium">{milestone.title}</div>
              <div className="text-xs text-gray-500">{milestone.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Component */}
      <PatientAchievements patientId={patientId} />
    </div>
  );
};

export default GamificationCard;
