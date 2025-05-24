
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedPatientsList from "@/components/psychologist/EnhancedPatientsList";
import TasksManager from "@/components/psychologist/TasksManager";
import MoodAnalytics from "@/components/psychologist/MoodAnalytics";
import NotificationsCenter from "@/components/psychologist/NotificationsCenter";
import ReportsDashboard from "@/components/psychologist/ReportsDashboard";
import PsychologicalTestsManager from "@/components/psychologist/PsychologicalTestsManager";
import CommunicationNotifications from "@/components/notifications/CommunicationNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Users, ClipboardList, BarChart3, Bell, FileText, TestTube } from "lucide-react";
import { Link } from "react-router-dom";

const PsychologistDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total_patients: 0,
    active_patients: 0,
    pending_tasks: 0,
    unread_notifications: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchPsychologistStats();
    }
  }, [profile?.id]);

  const fetchPsychologistStats = async () => {
    try {
      // Buscar pacientes
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', profile?.id);

      if (patientsError) throw patientsError;

      // Buscar tarefas pendentes
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('psychologist_id', profile?.id)
        .eq('status', 'pending');

      if (tasksError) throw tasksError;

      // Buscar notificações não lidas
      const { data: notifications, error: notificationsError } = await supabase
        .from('anamnesis_notifications')
        .select('*')
        .eq('recipient_id', profile?.id)
        .is('read_at', null);

      if (notificationsError) throw notificationsError;

      setStats({
        total_patients: patients?.length || 0,
        active_patients: patients?.filter(p => p.status === 'active')?.length || 0,
        pending_tasks: tasks?.length || 0,
        unread_notifications: notifications?.length || 0
      });
    } catch (error) {
      console.error('Error fetching psychologist stats:', error);
    }
  };

  return (
    <DashboardLayout userType="psychologist" userName={profile?.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, Dr(a). {profile?.name || 'Psicólogo'}!
            </h1>
            <p className="text-gray-600">Gerencie seus pacientes e acompanhe o progresso terapêutico</p>
          </div>
        </div>

        {/* Comunicados */}
        <CommunicationNotifications />

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patients}</div>
              <p className="text-xs text-muted-foreground">
                Pacientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_patients}</div>
              <p className="text-xs text-muted-foreground">
                Em acompanhamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
              <ClipboardList className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_tasks}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações</CardTitle>
              <Bell className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread_notifications}</div>
              <p className="text-xs text-muted-foreground">
                Não lidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de acesso rápido */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Ferramentas mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/anamnesis-management">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Anamneses</span>
                </Button>
              </Link>
              <Link to="/medical-record">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <ClipboardList className="h-6 w-6" />
                  <span className="text-xs">Prontuários</span>
                </Button>
              </Link>
              <Link to="/activities">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <TestTube className="h-6 w-6" />
                  <span className="text-xs">Atividades</span>
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                  <Bell className="h-6 w-6" />
                  <span className="text-xs">Chat</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tabs principais */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <EnhancedPatientsList />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksManager />
          </TabsContent>

          <TabsContent value="analytics">
            <MoodAnalytics />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsCenter />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>

          <TabsContent value="tests">
            <PsychologicalTestsManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PsychologistDashboard;
