
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PsychologistSidebar from "@/components/layout/PsychologistSidebar";
import PatientCard from "@/components/psychologist/PatientCard";
import MoodChart from "@/components/psychologist/MoodChart";
import InteractiveMoodChart from "@/components/psychologist/InteractiveMoodChart";
import PatientMoodAnalytics from "@/components/psychologist/PatientMoodAnalytics";
import NotificationCard from "@/components/psychologist/NotificationCard";
import EnhancedSendTaskModal from "@/components/psychologist/EnhancedSendTaskModal";
import TaskResponsesModal from "@/components/psychologist/TaskResponsesModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ClipboardList, AlertTriangle, TrendingUp, Search, BarChart3, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientForTask, setSelectedPatientForTask] = useState<string | null>(null);
  const [selectedPatientForMood, setSelectedPatientForMood] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isResponsesModalOpen, setIsResponsesModalOpen] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("chart");

  // ... keep existing code (mock data for patients and notifications)
  const [patients] = useState([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      status: 'active' as const,
      lastSession: "10/01/2024",
      moodTrend: 'improving' as const,
      pendingTasks: 2,
      alertLevel: 'none' as const
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@email.com",
      status: 'active' as const,
      lastSession: "08/01/2024",
      moodTrend: 'stable' as const,
      pendingTasks: 0,
      alertLevel: 'none' as const
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@email.com",
      status: 'active' as const,
      lastSession: "05/01/2024",
      moodTrend: 'declining' as const,
      pendingTasks: 1,
      alertLevel: 'high' as const
    }
  ]);

  const [notifications] = useState([
    {
      id: "1",
      type: 'mood_alert' as const,
      title: "Alerta de Humor Baixo",
      message: "Ana Costa registrou humor muito baixo nos últimos 3 dias",
      patientName: "Ana Costa",
      time: "2 min atrás",
      priority: 'high' as const,
      actionLabel: "Ver Gráfico",
      onAction: () => handleViewMoodChart("3")
    },
    {
      id: "2",
      type: 'new_response' as const,
      title: "Nova Resposta de Tarefa",
      message: "Maria Silva completou o exercício de respiração",
      patientName: "Maria Silva",
      time: "1 hora atrás",
      priority: 'medium' as const,
      actionLabel: "Ver Resposta",
      onAction: () => setIsResponsesModalOpen(true)
    },
    {
      id: "3",
      type: 'session_reminder' as const,
      title: "Sessão Agendada",
      message: "Sessão com João Santos em 30 minutos",
      patientName: "João Santos",
      time: "30 min",
      priority: 'medium' as const
    }
  ]);

  const moodData = [
    { date: "2024-01-01", mood: 7 },
    { date: "2024-01-02", mood: 6 },
    { date: "2024-01-03", mood: 8 },
    { date: "2024-01-04", mood: 5 },
    { date: "2024-01-05", mood: 7 },
    { date: "2024-01-06", mood: 9 },
    { date: "2024-01-07", mood: 8 },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... keep existing code (all handler functions)
  const handleStatusChange = async (patientId: string, newStatus: 'active' | 'inactive') => {
    console.log(`Alterando status do paciente ${patientId} para ${newStatus}`);
    // Implementar lógica do Supabase
  };

  const handleViewRecord = (patientId: string) => {
    navigate(`/medical-record?patient=${patientId}`);
  };

  const handleSendTask = (patientId: string) => {
    setSelectedPatientForTask(patientId);
    setIsTaskModalOpen(true);
  };

  const handleViewMoodChart = (patientId: string) => {
    setSelectedPatientForMood(patientId);
    setIsMoodModalOpen(true);
  };

  const handleSendTaskSubmit = async (taskData: any) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      // Criar notificação para o paciente
      await supabase
        .from('task_notifications')
        .insert({
          task_id: taskData.id, // Será preenchido pelo banco
          recipient_id: taskData.patient_id,
          type: 'new_task',
          message: `Nova tarefa disponível: "${taskData.title}"`
        });

      console.log('Tarefa enviada com sucesso:', taskData);
    } catch (error) {
      console.error('Erro ao enviar tarefa:', error);
      throw error;
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    console.log('Marcando notificação como lida:', notificationId);
    // Implementar lógica do Supabase
  };

  const totalPendingTasks = patients.reduce((total, patient) => total + patient.pendingTasks, 0);
  const newResponses = notifications.filter(n => n.type === 'new_response').length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const alertPatients = patients.filter(p => p.alertLevel === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PsychologistSidebar 
        pendingTasks={totalPendingTasks}
        newResponses={newResponses}
      />
      
      <div className="flex-1 md:ml-0">
        <main className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Profissional</h1>
              <p className="text-gray-600">Gerencie seus pacientes e acompanhe o progresso</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Pacientes Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{activePatients}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Tarefas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{totalPendingTasks}</div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsResponsesModalOpen(true)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Novas Respostas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{newResponses}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{alertPatients}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patients List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Pacientes</CardTitle>
                    <CardDescription>Gerencie seus pacientes ativos</CardDescription>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar pacientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredPatients.map((patient) => (
                        <PatientCard
                          key={patient.id}
                          patient={patient}
                          onStatusChange={handleStatusChange}
                          onViewRecord={handleViewRecord}
                          onSendTask={handleSendTask}
                          onViewMoodChart={handleViewMoodChart}
                        />
                      ))}
                      {filteredPatients.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhum paciente encontrado</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Notifications */}
              <div>
                <NotificationCard 
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Send Task Modal */}
      <EnhancedSendTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        patientId={selectedPatientForTask || ""}
        patientName={patients.find(p => p.id === selectedPatientForTask)?.name || ""}
        onSendTask={handleSendTaskSubmit}
      />

      {/* Task Responses Modal */}
      <TaskResponsesModal
        isOpen={isResponsesModalOpen}
        onClose={() => setIsResponsesModalOpen(false)}
      />

      {/* Enhanced Mood Chart Modal */}
      <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise Completa do Humor
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Gráfico Interativo</TabsTrigger>
              <TabsTrigger value="analytics">Análise Detalhada</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="mt-6">
              <InteractiveMoodChart
                patientId={selectedPatientForMood || ""}
                patientName={patients.find(p => p.id === selectedPatientForMood)?.name || ""}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <PatientMoodAnalytics
                patientId={selectedPatientForMood || ""}
                patientName={patients.find(p => p.id === selectedPatientForMood)?.name || ""}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PsychologistDashboard;
