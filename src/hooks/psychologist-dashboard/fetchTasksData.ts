
import { supabase } from '@/integrations/supabase/client';

export const fetchTasksData = async (patientIds: string[], psychologistId: string) => {
  if (patientIds.length === 0) return [];

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      *,
      profiles!tasks_patient_id_fkey(name)
    `)
    .eq('psychologist_id', psychologistId)
    .in('status', ['pending', 'completed'])
    .order('created_at', { ascending: false });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
    return [];
  }

  return tasks || [];
};
