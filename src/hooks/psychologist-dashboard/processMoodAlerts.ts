
import { MoodAlert, PatientOverview } from './types';

export const processMoodAlerts = (moodData: any[], patients: PatientOverview[]): MoodAlert[] => {
  return moodData
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
};
