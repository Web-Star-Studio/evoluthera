
import { supabase } from "@/integrations/supabase/client";

export const incrementMoodRecord = async (patientId: string) => {
  try {
    // Primeiro, verificar se o paciente já tem estatísticas
    const { data: existingStats } = await supabase
      .from('patient_stats')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (!existingStats) {
      // Criar estatísticas iniciais se não existirem
      await supabase
        .from('patient_stats')
        .insert({
          patient_id: patientId,
          mood_records_count: 1,
          total_points: 5,
          last_activity: new Date().toISOString()
        });
    } else {
      // Atualizar estatísticas existentes
      await supabase
        .from('patient_stats')
        .update({
          mood_records_count: (existingStats.mood_records_count || 0) + 1,
          total_points: (existingStats.total_points || 0) + 5,
          last_activity: new Date().toISOString()
        })
        .eq('patient_id', patientId);
    }

    console.log('Estatísticas de humor atualizadas');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas de humor:', error);
  }
};

export const incrementTaskCompleted = async (patientId: string) => {
  try {
    // Primeiro, verificar se o paciente já tem estatísticas
    const { data: existingStats } = await supabase
      .from('patient_stats')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (!existingStats) {
      // Criar estatísticas iniciais se não existirem
      await supabase
        .from('patient_stats')
        .insert({
          patient_id: patientId,
          tasks_completed: 1,
          total_points: 10,
          last_activity: new Date().toISOString()
        });
    } else {
      // Atualizar estatísticas existentes
      await supabase
        .from('patient_stats')
        .update({
          tasks_completed: (existingStats.tasks_completed || 0) + 1,
          total_points: (existingStats.total_points || 0) + 10,
          last_activity: new Date().toISOString()
        })
        .eq('patient_id', patientId);
    }

    console.log('Estatísticas de tarefas atualizadas');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas de tarefas:', error);
  }
};

export const incrementDiaryEntry = async (patientId: string) => {
  try {
    // Primeiro, verificar se o paciente já tem estatísticas
    const { data: existingStats } = await supabase
      .from('patient_stats')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (!existingStats) {
      // Criar estatísticas iniciais se não existirem
      await supabase
        .from('patient_stats')
        .insert({
          patient_id: patientId,
          diary_entries_count: 1,
          total_points: 5,
          last_activity: new Date().toISOString()
        });
    } else {
      // Atualizar estatísticas existentes
      await supabase
        .from('patient_stats')
        .update({
          diary_entries_count: (existingStats.diary_entries_count || 0) + 1,
          total_points: (existingStats.total_points || 0) + 5,
          last_activity: new Date().toISOString()
        })
        .eq('patient_id', patientId);
    }

    console.log('Estatísticas de diário atualizadas');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas de diário:', error);
  }
};
