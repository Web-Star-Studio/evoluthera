
import { supabase } from '@/integrations/supabase/client';

export const fetchMoodData = async (patientIds: string[]) => {
  if (patientIds.length === 0) return [];

  const { data: moodRecords, error: moodError } = await supabase
    .from('mood_records')
    .select('*')
    .in('patient_id', patientIds)
    .order('created_at', { ascending: false });

  if (moodError) {
    console.error('Error fetching mood records:', moodError);
    return [];
  }

  return moodRecords || [];
};
