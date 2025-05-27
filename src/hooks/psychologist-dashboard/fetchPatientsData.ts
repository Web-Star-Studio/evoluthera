
import { supabase } from '@/integrations/supabase/client';

export const fetchPatientsData = async (psychologistId: string) => {
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select(`
      patient_id,
      profiles!patients_patient_id_fkey(id, name, email, avatar_url)
    `)
    .eq('psychologist_id', psychologistId)
    .eq('status', 'active');

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
    throw patientsError;
  }

  // Fetch patient stats separately since there's no direct foreign key relationship
  if (!patientsData || patientsData.length === 0) {
    return [];
  }

  const patientIds = patientsData.map(p => p.patient_id);
  
  const { data: patientStats, error: statsError } = await supabase
    .from('patient_stats')
    .select('*')
    .in('patient_id', patientIds);

  if (statsError) {
    console.error('Error fetching patient stats:', statsError);
    // Continue without stats if there's an error
  }

  // Combine the data
  const combinedData = patientsData.map(patient => ({
    ...patient,
    patient_stats: patientStats?.find(stat => stat.patient_id === patient.patient_id) || null
  }));

  return combinedData;
};
