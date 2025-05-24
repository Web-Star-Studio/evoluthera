
import { useState, useEffect } from "react";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import MoodTracker from "@/components/patient/MoodTracker";
import TasksList from "@/components/patient/TasksList";
import DiaryEntry from "@/components/patient/DiaryEntry";
import WeeklyProgressChart from "@/components/patient/WeeklyProgressChart";
import GamificationCard from "@/components/patient/GamificationCard";
import CommunicationNotifications from "@/components/notifications/CommunicationNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Target, TrendingUp, Calendar, Users, Zap } from "lucide-react";

const PatientDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    streak_days: 0,
    tasks_completed: 0,
    mood_records_count: 0,
    total_points: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchPatientStats();
    }
  }, [profile?.id]);

  const fetchPatientStats = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_stats')
        .select('*')
        .eq('patient_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching patient stats:', error);
        return;
      }

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <UniversalDashboardLayout userType="patient">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {profile?.name || 'Paciente'}!
            </h1>
            <p className="text-gray-600">Acompanhe seu progresso terapêutico</p>
          </div>
        </div>

        {/* Comunicados */}
        <CommunicationNotifications />

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak_days} dias</div>
              <p className="text-xs text-muted-foreground">
                Mantendo o foco!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Completas</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks_completed}</div>
              <p className="text-xs text-muted-foreground">
                Atividades realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros de Humor</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mood_records_count}</div>
              <p className="text-xs text-muted-foreground">
                Autoconhecimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_points}</div>
              <p className="text-xs text-muted-foreground">
                XP acumulada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gamificação */}
        <div data-section="achievements">
          <GamificationCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rastreador de Humor */}
          <div data-section="mood">
            <MoodTracker />
          </div>

          {/* Tarefas Pendentes */}
          <TasksList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Progresso Semanal */}
          <div data-section="progress">
            <WeeklyProgressChart />
          </div>

          {/* Entrada de Diário */}
          <DiaryEntry />
        </div>
      </div>
    </UniversalDashboardLayout>
  );
};

export default PatientDashboard;
