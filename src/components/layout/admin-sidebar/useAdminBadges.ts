
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminBadges = () => {
  const { profile } = useAuth();
  const [badges, setBadges] = useState({
    supportTickets: 0,
    systemAlerts: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchBadgeCounts();
      const interval = setInterval(fetchBadgeCounts, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const fetchBadgeCounts = async () => {
    try {
      // Mock data for admin badges - replace with actual queries
      setBadges({
        supportTickets: Math.floor(Math.random() * 5), // Mock pending support tickets
        systemAlerts: Math.floor(Math.random() * 3), // Mock system alerts
        pendingApprovals: Math.floor(Math.random() * 2), // Mock pending approvals
      });
    } catch (error) {
      console.error('Error fetching admin badge counts:', error);
    }
  };

  return badges;
};
