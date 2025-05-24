
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BadgeCounts {
  activeTasks: number;
  pendingPatients: number;
  newNotifications: number;
}

export const usePsychologistBadges = (profileId?: string) => {
  const [badges, setBadges] = useState<BadgeCounts>({
    activeTasks: 0,
    pendingPatients: 0,
    newNotifications: 0
  });

  useEffect(() => {
    if (profileId) {
      fetchBadgeCounts();
    }
  }, [profileId]);

  const fetchBadgeCounts = async () => {
    try {
      // Use existing tables to fetch badge counts
      const [tasksResult, patientsResult, notificationsResult] = await Promise.allSettled([
        supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'pending').eq('psychologist_id', profileId),
        supabase.from('patients').select('id', { count: 'exact' }).eq('psychologist_id', profileId).eq('status', 'active'),
        supabase.from('anamnesis_notifications').select('id', { count: 'exact' }).eq('recipient_id', profileId).is('read_at', null)
      ]);

      setBadges({
        activeTasks: tasksResult.status === 'fulfilled' ? (tasksResult.value.count || 0) : 0,
        pendingPatients: patientsResult.status === 'fulfilled' ? (patientsResult.value.count || 0) : 0,
        newNotifications: notificationsResult.status === 'fulfilled' ? (notificationsResult.value.count || 0) : 0
      });
    } catch (error) {
      console.error('Error fetching badge counts:', error);
      setBadges({ activeTasks: 0, pendingPatients: 0, newNotifications: 0 });
    }
  };

  return badges;
};
