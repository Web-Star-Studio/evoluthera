
import { PatientOverview } from './types';

export const processPatients = (patientsData: any[], moodData: any[]): PatientOverview[] => {
  return (patientsData || []).map(patient => {
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

    // Handle patient_stats as a single object now
    const patientStats = patient.patient_stats;
    const lastActivity = patientStats?.last_activity || new Date().toISOString();

    return {
      id: patient.patient_id,
      name: patient.profiles?.name || 'Paciente',
      email: patient.profiles?.email || '',
      lastMoodScore,
      lastActivity,
      moodTrend,
      riskLevel,
      avatar_url: patient.profiles?.avatar_url
    };
  });
};
