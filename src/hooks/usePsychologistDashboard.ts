
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatientOverview {
  id: string;
  name: string;
  email: string;
  lastMoodScore: number;
  lastActivity: string;
  moodTrend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  avatar_url?: string;
}

interface MoodAlert {
  id: string;
  patientId: string;
  patientName: string;
  moodScore: number;
  severity: 'low' | 'critical';
  timestamp: string;
  notes?: string;
}

interface PendingTask {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  priority: 'low' | 'normal' | 'high';
  dueDate?: string;
  status: string;
}

interface EvolutionData {
  date: string;
  averageMood: number;
  activePatients: number;
  completedTasks: number;
}

interface DashboardData {
  patients: PatientOverview[];
  moodAlerts: MoodAlert[];
  pendingTasks: PendingTask[];
  evolutionData: EvolutionData[];
  stats: {
    totalPatients: number;
    activePatientsToday: number;
    pendingTasksCount: number;
    criticalAlertsCount: number;
  };
}

export const usePsychologistDashboard = () => {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    patients: [],
    moodAlerts: [],
    pendingTasks: [],
    evolutionData: [],
    stats: {
      totalPatients: 0,
      activePatientsToday: 0,
      pendingTasksCount: 0,
      criticalAlertsCount: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data for psychologist:', profile.id);

        // Buscar pacientes com dados recentes
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select(`
            patient_id,
            profiles!patients_patient_id_fkey(id, name, email, avatar_url),
            patient_stats(*)
          `)
          .eq('psychologist_id', profile.id)
          .eq('status', 'active');

        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
          throw patientsError;
        }

        // Buscar registros de humor recentes
        const patientIds = patientsData?.map(p => p.patient_id) || [];
        
        let moodData = [];
        if (patientIds.length > 0) {
          const { data: moodRecords, error: moodError } = await supabase
            .from('mood_records')
            .select('*')
            .in('patient_id', patientIds)
            .order('created_at', { ascending: false });

          if (moodError) {
            console.error('Error fetching mood records:', moodError);
          } else {
            moodData = moodRecords || [];
          }
        }

        // Buscar tarefas pendentes
        let tasksData = [];
        if (patientIds.length > 0) {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select(`
              *,
              profiles!tasks_patient_id_fkey(name)
            `)
            .eq('psychologist_id', profile.id)
            .in('status', ['pending', 'completed'])
            .order('created_at', { ascending: false });

          if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
          } else {
            tasksData = tasks || [];
          }
        }

        // Processar dados dos pacientes
        const patients: PatientOverview[] = (patientsData || []).map(patient => {
          const patientMoods = moodData.filter(mood => mood.patient_id === patient.patient_id);
          const latestMood = patientMoods[0];
          const previousMood = patientMoods[1];
          
          let moodTrend: 'up' | 'down' | 'stable' = 'stable';
          if (latestMood && previousMood) {
            if (latestMood.mood_score > previousMood.mood_score) moodTrend = 'up';
            else if (latestMood.mood_score < previousMood.mood_score) moodTrend = 'down';
          }

          const lastMoodScore = latestMood?.mood_score || 3;
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          
          if (lastMoodScore <= 1) riskLevel = 'critical';
          else if (lastMoodScore <= 2) riskLevel = 'high';
          else if (lastMoodScore <= 3) riskLevel = 'medium';

          return {
            id: patient.patient_id,
            name: patient.profiles?.name || 'Paciente',
            email: patient.profiles?.email || '',
            lastMoodScore,
            lastActivity: patient.patient_stats?.[0]?.last_activity || new Date().toISOString(),
            moodTrend,
            riskLevel,
            avatar_url: patient.profiles?.avatar_url
          };
        });

        // Processar alertas de humor
        const moodAlerts: MoodAlert[] = moodData
          .filter(mood => mood.mood_score <= 2)
          .slice(0, 10)
          .map(mood => {
            const patient = patients.find(p => p.id === mood.patient_id);
            return {
              id: mood.id,
              patientId: mood.patient_id,
              patientName: patient?.name || 'Paciente',
              moodScore: mood.mood_score,
              severity: mood.mood_score <= 1 ? 'critical' : 'low',
              timestamp: mood.created_at,
              notes: mood.notes
            };
          });

        // Processar tarefas pendentes
        const pendingTasks: PendingTask[] = tasksData
          .filter(task => task.status === 'completed' && !task.psychologist_comment)
          .slice(0, 10)
          .map(task => ({
            id: task.id,
            title: task.title,
            patientName: task.profiles?.name || 'Paciente',
            patientId: task.patient_id,
            priority: task.priority || 'normal',
            dueDate: task.due_date,
            status: task.status
          }));

        // Gerar dados de evolução dos últimos 30 dias
        const evolutionData: EvolutionData[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayMoods = moodData.filter(mood => 
            mood.created_at.startsWith(dateStr)
          );
          
          const averageMood = dayMoods.length > 0 
            ? dayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / dayMoods.length
            : 0;
          
          const dayTasks = tasksData.filter(task => 
            task.completed_at && task.completed_at.startsWith(dateStr)
          );

          evolutionData.push({
            date: dateStr,
            averageMood: Number(averageMood.toFixed(1)),
            activePatients: dayMoods.length > 0 ? new Set(dayMoods.map(m => m.patient_id)).size : 0,
            completedTasks: dayTasks.length
          });
        }

        // Calcular estatísticas
        const today = new Date().toISOString().split('T')[0];
        const activePatientsToday = new Set(
          moodData
            .filter(mood => mood.created_at.startsWith(today))
            .map(mood => mood.patient_id)
        ).size;

        const stats = {
          totalPatients: patients.length,
          activePatientsToday,
          pendingTasksCount: pendingTasks.length,
          criticalAlertsCount: moodAlerts.filter(alert => alert.severity === 'critical').length
        };

        setData({
          patients,
          moodAlerts,
          pendingTasks,
          evolutionData,
          stats
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  return { data, loading, error };
};
