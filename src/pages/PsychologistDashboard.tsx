
import { useState, useEffect } from "react";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
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

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('psychologist_id', profile?.id)
        .eq('status', 'pending');

      if (tasksError) throw tasksError;

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
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        {/* Header limpo */}
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
          <Card className="hover:shadow-md transition-shadow">
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

          <Card className="hover:shadow-md transition-shadow">
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

          <Card className="hover:shadow-md transition-shadow">
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

          <Card className="hover:shadow-md transition-shadow">
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

        {/* Seção de acesso rápido melhorada */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5" />
              Ferramentas Profissionais
            </CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/anamnesis-management">
                <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-purple-50 border-purple-200">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-medium">Anamneses</span>
                </Button>
              </Link>
              <Link to="/medical-record">
                <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-blue-50 border-blue-200">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-medium">Prontuários</span>
                </Button>
              </Link>
              <Link to="/activities">
                <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-green-50 border-green-200">
                  <TestTube className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Atividades</span>
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-orange-50 border-orange-200">
                  <Bell className="h-6 w-6 text-orange-600" />
                  <span className="text-xs font-medium">Chat</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tabs simplificados - removido sistema de navegação duplicado */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
            <TabsTrigger value="patients" data-tab="patients" className="data-[state=active]:bg-purple-100">Pacientes</TabsTrigger>
            <TabsTrigger value="tasks" data-tab="tasks" className="data-[state=active]:bg-blue-100">Tarefas</TabsTrigger>
            <TabsTrigger value="analytics" data-tab="analytics" className="data-[state=active]:bg-green-100">Análises</TabsTrigger>
            <TabsTrigger value="notifications" data-tab="notifications" className="data-[state=active]:bg-yellow-100">Notificações</TabsTrigger>
            <TabsTrigger value="reports" data-tab="reports" className="data-[state=active]:bg-orange-100">Relatórios</TabsTrigger>
            <TabsTrigger value="tests" data-tab="tests" className="data-[state=active]:bg-indigo-100">Testes</TabsTrigger>
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
    </UniversalDashboardLayout>
  );
};

export default PsychologistDashboard;
