
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardData } from './types';
import { fetchPatientsData } from './fetchPatientsData';
import { fetchMoodData } from './fetchMoodData';
import { fetchTasksData } from './fetchTasksData';
import { processPatients } from './processPatients';
import { processMoodAlerts } from './processMoodAlerts';
import { processPendingTasks } from './processPendingTasks';
import { processEvolutionData } from './processEvolutionData';
import { calculateStats } from './calculateStats';

export const useDashboardData = () => {
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

        // Fetch all required data
        const patientsData = await fetchPatientsData(profile.id);
        const patientIds = patientsData?.map(p => p.patient_id) || [];
        
        const [moodData, tasksData] = await Promise.all([
          fetchMoodData(patientIds),
          fetchTasksData(patientIds, profile.id)
        ]);

        // Process all data
        const patients = processPatients(patientsData || [], moodData);
        const moodAlerts = processMoodAlerts(moodData, patients);
        const pendingTasks = processPendingTasks(tasksData);
        const evolutionData = processEvolutionData(moodData, tasksData);
        const stats = calculateStats(patients, moodAlerts, pendingTasks, moodData);

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
