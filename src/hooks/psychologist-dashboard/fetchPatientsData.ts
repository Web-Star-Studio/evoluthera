
import { supabase } from '@/integrations/supabase/client';

export const fetchPatientsData = async (psychologistId: string) => {
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select(`
      patient_id,
      profiles!patients_patient_id_fkey(id, name, email, avatar_url),
      patient_stats(*)
    `)
    .eq('psychologist_id', psychologistId)
    .eq('status', 'active');

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
    throw patientsError;
  }

  return patientsData;
};
