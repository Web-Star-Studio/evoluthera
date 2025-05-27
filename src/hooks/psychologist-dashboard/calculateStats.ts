
import { DashboardStats, PatientOverview, MoodAlert, PendingTask } from './types';

export const calculateStats = (
  patients: PatientOverview[], 
  moodAlerts: MoodAlert[], 
  pendingTasks: PendingTask[], 
  moodData: any[]
): DashboardStats => {
  const today = new Date().toISOString().split('T')[0];
  const activePatientsToday = new Set(
    moodData
      .filter(mood => mood.created_at.startsWith(today))
      .map(mood => mood.patient_id)
  ).size;

  return {
    totalPatients: patients.length,
    activePatientsToday,
    pendingTasksCount: pendingTasks.length,
    criticalAlertsCount: moodAlerts.filter(alert => alert.severity === 'critical').length
  };
};
