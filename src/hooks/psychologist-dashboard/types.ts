
export interface PatientOverview {
  id: string;
  name: string;
  email: string;
  lastMoodScore: number;
  lastActivity: string;
  moodTrend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  avatar_url?: string;
}

export interface MoodAlert {
  id: string;
  patientId: string;
  patientName: string;
  moodScore: number;
  severity: 'low' | 'critical';
  timestamp: string;
  notes?: string;
}

export interface PendingTask {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  priority: 'low' | 'normal' | 'high';
  dueDate?: string;
  status: string;
}

export interface EvolutionData {
  date: string;
  averageMood: number;
  activePatients: number;
  completedTasks: number;
}

export interface DashboardStats {
  totalPatients: number;
  activePatientsToday: number;
  pendingTasksCount: number;
  criticalAlertsCount: number;
}

export interface DashboardData {
  patients: PatientOverview[];
  moodAlerts: MoodAlert[];
  pendingTasks: PendingTask[];
  evolutionData: EvolutionData[];
  stats: DashboardStats;
}
