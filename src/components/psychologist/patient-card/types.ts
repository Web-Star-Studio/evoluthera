export interface PatientData {
  id: string;
  patient_id: string;
  psychologist_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  } | null;
  patient_stats?: {
    tasks_completed: number;
    streak_days: number;
    mood_records_count: number;
    last_activity: string | null;
    total_points: number;
  };
  mood_analytics?: {
    avg_mood: number;
    total_mood_records: number;
    last_mood_entry: string | null;
    mood_trend: 'up' | 'down' | 'stable';
  };
}

export interface PatientCardProps {
  patient: PatientData;
  onResendCredentials?: (patientId: string) => void;
  onViewRecord?: (patientId: string) => void;
  onDeletePatient?: (patientId: string) => void;
  onToggleStatus?: (patientId: string) => void;
}
