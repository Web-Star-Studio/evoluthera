
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MoodRecord {
  id: string;
  mood_score: number;
  notes: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // Changed from union type to string to match database
  due_date: string;
  created_at: string;
  completed_at?: string;
  updated_at?: string;
}

interface PatientStats {
  averageMood: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  nextSession?: string;
  recentActivity: Array<{
    type: 'mood' | 'task' | 'message';
    description: string;
    timestamp: string;
    value?: string;
  }>;
}

export const usePatientData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PatientStats>({
    averageMood: 0,
    streakDays: 0,
    completedTasks: 0,
    totalTasks: 0,
    recentActivity: []
  });
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        console.log('Fetching patient data for user:', user.id);

        // Fetch mood records from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: moodData, error: moodError } = await supabase
          .from('mood_records')
          .select('*')
          .eq('patient_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (moodError) {
          console.error('Error fetching mood data:', moodError);
        }

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
        }

        // Calculate statistics
        const moods = moodData || [];
        const tasks = tasksData || [];
        
        const averageMood = moods.length > 0 
          ? moods.reduce((sum, record) => sum + record.mood_score, 0) / moods.length
          : 0;

        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasksList = tasks.filter(task => task.status === 'pending');

        // Calculate streak (consecutive days with mood records)
        let streakDays = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dayStart = new Date(checkDate.setHours(0, 0, 0, 0));
          const dayEnd = new Date(checkDate.setHours(23, 59, 59, 999));
          
          const hasRecord = moods.some(mood => {
            const moodDate = new Date(mood.created_at);
            return moodDate >= dayStart && moodDate <= dayEnd;
          });
          
          if (hasRecord) {
            streakDays++;
          } else if (i > 0) { // Don't break on today if no record yet
            break;
          }
        }

        // Create recent activity
        const recentActivity = [];
        
        // Add recent mood records
        moods.slice(0, 3).forEach(mood => {
          recentActivity.push({
            type: 'mood' as const,
            description: 'Registro de humor concluído',
            timestamp: mood.created_at,
            value: `${mood.mood_score}/5`
          });
        });

        // Add recent completed tasks
        tasks.filter(task => task.status === 'completed')
          .slice(0, 2)
          .forEach(task => {
            recentActivity.push({
              type: 'task' as const,
              description: `Tarefa "${task.title}" concluída`,
              timestamp: task.completed_at || task.updated_at || task.created_at,
              value: 'Concluída'
            });
          });

        // Sort by timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setStats({
          averageMood: Number(averageMood.toFixed(1)),
          streakDays,
          completedTasks,
          totalTasks: tasks.length,
          nextSession: '2 dias', // This would come from sessions table
          recentActivity: recentActivity.slice(0, 3)
        });

        setPendingTasks(pendingTasksList.slice(0, 2));

      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Erro ao carregar dados do paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

  return { stats, pendingTasks, loading, error };
};
