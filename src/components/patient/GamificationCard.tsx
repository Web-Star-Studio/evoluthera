
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Award, Target, Heart, BookOpen, Flame, Star, Trophy } from "lucide-react";

const GamificationCard = () => {
  const [stats, setStats] = useState({
    streak_days: 7,
    total_points: 320,
    tasks_completed: 12,
    diary_entries_count: 8,
    mood_records_count: 15,
  });

  const [achievements, setAchievements] = useState([
    { id: 1, type: "streak", title: "Primeira Semana", description: "7 dias seguidos ativos", icon: "🔥", earned_at: "2024-01-20" },
    { id: 2, type: "mood_tracker", title: "Autoconhecimento", description: "10 registros de humor", icon: "❤️", earned_at: "2024-01-18" },
    { id: 3, type: "task_completion", title: "Dedicado", description: "5 tarefas completadas", icon: "🎯", earned_at: "2024-01-17" },
  ]);

  const getNextLevel = (points: number) => {
    const levels = [0, 100, 250, 500, 1000, 2000];
    const currentLevel = levels.findIndex(level => points < level);
    return currentLevel === -1 ? levels.length : currentLevel;
  };

  const getPointsForNextLevel = (points: number) => {
    const levels = [0, 100, 250, 500, 1000, 2000];
    const currentLevel = getNextLevel(points);
    return currentLevel < levels.length ? levels[currentLevel] : levels[levels.length - 1];
  };

  const currentLevel = getNextLevel(stats.total_points);
  const nextLevelPoints = getPointsForNextLevel(stats.total_points);
  const progressToNextLevel = ((stats.total_points % nextLevelPoints) / nextLevelPoints) * 100;

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

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Conquistas Desbloqueadas
          </CardTitle>
          <CardDescription>Parabéns por estes marcos importantes!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {new Date(achievement.earned_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-gray-400" />
            Próximas Conquistas
          </CardTitle>
          <CardDescription>Continue assim para desbloquear mais marcos!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg opacity-60">
              <div className="text-2xl">🌟</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700">Mestre do Humor</div>
                <div className="text-sm text-gray-500">Registre humor por 30 dias (15/30)</div>
              </div>
              <Progress value={50} className="w-16 h-2" />
            </div>
            
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg opacity-60">
              <div className="text-2xl">📚</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-700">Escritor Reflexivo</div>
                <div className="text-sm text-gray-500">Escreva 20 entradas no diário (8/20)</div>
              </div>
              <Progress value={40} className="w-16 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationCard;
