
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  points: number;
}

export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_week",
    type: "streak",
    title: "Primeira Semana",
    description: "7 dias seguidos ativos",
    icon: "🔥",
    requirement: 7,
    points: 50
  },
  {
    id: "mood_tracker_master",
    type: "mood_records",
    title: "Mestre do Humor",
    description: "10 registros de humor",
    icon: "❤️",
    requirement: 10,
    points: 30
  },
  {
    id: "task_completionist",
    type: "tasks_completed",
    title: "Dedicado",
    description: "5 tarefas completadas",
    icon: "🎯",
    requirement: 5,
    points: 40
  },
  {
    id: "diary_writer",
    type: "diary_entries",
    title: "Escritor Reflexivo",
    description: "10 entradas no diário",
    icon: "📚",
    requirement: 10,
    points: 35
  },
  {
    id: "consistency_champion",
    type: "streak",
    title: "Campeão da Consistência",
    description: "30 dias seguidos ativos",
    icon: "🌟",
    requirement: 30,
    points: 100
  },
  {
    id: "mood_explorer",
    type: "mood_records",
    title: "Explorador Emocional",
    description: "30 registros de humor",
    icon: "🌈",
    requirement: 30,
    points: 60
  }
];

export const useAchievementManager = (patientId: string) => {
  const { toast } = useToast();

  const checkAndAwardAchievements = async () => {
    try {
      // Buscar estatísticas atuais
      const { data: stats } = await supabase
        .from('patient_stats')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (!stats) return;

      // Buscar conquistas já obtidas
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('type, title')
        .eq('patient_id', patientId);

      const achievedTypes = new Set(existingAchievements?.map(a => `${a.type}_${a.title}`) || []);

      // Verificar cada conquista disponível
      for (const achievement of AVAILABLE_ACHIEVEMENTS) {
        const achievementKey = `${achievement.type}_${achievement.title}`;
        
        if (achievedTypes.has(achievementKey)) continue;

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

        // Se atingiu o requisito, conceder a conquista
        if (currentValue >= achievement.requirement) {
          await awardAchievement(patientId, achievement);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  };

  const awardAchievement = async (patientId: string, achievement: Achievement) => {
    try {
      // Inserir conquista
      await supabase
        .from('achievements')
        .insert({
          patient_id: patientId,
          type: achievement.type,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });

      // Atualizar pontos totais
      await supabase
        .from('patient_stats')
        .update({
          total_points: supabase.sql`total_points + ${achievement.points}`
        })
        .eq('patient_id', patientId);

      // Mostrar notificação
      toast({
        title: "🏆 Nova Conquista!",
        description: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao conceder conquista:', error);
    }
  };

  const awardPoints = async (patientId: string, points: number, activity: string) => {
    try {
      await supabase
        .from('patient_stats')
        .update({
          total_points: supabase.sql`total_points + ${points}`,
          last_activity: new Date().toISOString()
        })
        .eq('patient_id', patientId);

      console.log(`Concedido ${points} pontos para ${activity}`);
    } catch (error) {
      console.error('Erro ao conceder pontos:', error);
    }
  };

  const updateStreak = async (patientId: string) => {
    try {
      const { data: stats } = await supabase
        .from('patient_stats')
        .select('last_activity, streak_days')
        .eq('patient_id', patientId)
        .single();

      const today = new Date();
      const lastActivity = stats?.last_activity ? new Date(stats.last_activity) : null;
      
      let newStreakDays = stats?.streak_days || 0;

      if (lastActivity) {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Atividade no dia seguinte - continua o streak
          newStreakDays += 1;
        } else if (daysDiff > 1) {
          // Quebrou o streak
          newStreakDays = 1;
        }
        // Se daysDiff === 0, mantém o streak atual (mesmo dia)
      } else {
        // Primeira atividade
        newStreakDays = 1;
      }

      await supabase
        .from('patient_stats')
        .update({
          streak_days: newStreakDays,
          last_activity: today.toISOString()
        })
        .eq('patient_id', patientId);

      return newStreakDays;
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
      return 0;
    }
  };

  return {
    checkAndAwardAchievements,
    awardPoints,
    updateStreak
  };
};
