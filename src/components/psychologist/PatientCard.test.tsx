import React from 'react';
import PatientCard from './PatientCard';

// Mock data for testing
const mockPatient = {
  id: '1',
  patient_id: 'patient-1',
  psychologist_id: 'psycho-1',
  status: 'active',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  profiles: {
    id: 'profile-1',
    name: 'João Silva',
    email: 'joao@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  patient_stats: {
    tasks_completed: 15,
    streak_days: 7,
    mood_records_count: 20,
    last_activity: '2024-01-15T10:30:00.000Z',
    total_points: 350,
  },
  mood_analytics: {
    avg_mood: 3.8,
    total_mood_records: 20,
    last_mood_entry: '2024-01-15T08:00:00.000Z',
    mood_trend: 'up' as const,
  },
};

const PatientCardTest = () => {
  const handleResendCredentials = (patientId: string) => {
    console.log('Reenviar credenciais para:', patientId);
  };

  const handleViewRecord = (patientId: string) => {
    console.log('Ver prontuário de:', patientId);
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Teste do PatientCard</h2>
      <PatientCard
        patient={mockPatient}
        onResendCredentials={handleResendCredentials}
        onViewRecord={handleViewRecord}
      />
    </div>
  );
};

export default PatientCardTest; 