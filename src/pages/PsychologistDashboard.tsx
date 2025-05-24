import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Target, Bell, TrendingUp, Trophy, FileText, MessageCircle } from "lucide-react";
import PatientsList from "@/components/psychologist/PatientsList";
import MoodAnalytics from "@/components/psychologist/MoodAnalytics";
import TasksManager from "@/components/psychologist/TasksManager";
import NotificationsCenter from "@/components/psychologist/NotificationsCenter";
import ReportsDashboard from "@/components/psychologist/ReportsDashboard";
import PsychologistGamificationView from "@/components/gamification/PsychologistGamificationView";
import PsychologicalTestsManager from "@/components/psychologist/PsychologicalTestsManager";
import ChatPage from "@/components/chat/ChatPage";

const PsychologistDashboard = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: "Maria Silva", lastSession: "15/01/2024", progress: 75 },
    { id: 2, name: "João Pereira", lastSession: "22/01/2024", progress: 50 },
    { id: 3, name: "Ana Souza", lastSession: "01/02/2024", progress: 90 },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Exercício de Mindfulness", patient: "Maria Silva", dueDate: "28/02/2024", status: "pendente" },
    { id: 2, title: "Registro de Humor Diário", patient: "João Pereira", dueDate: "05/03/2024", status: "concluída" },
    { id: 3, title: "Leitura sobre Ansiedade", patient: "Ana Souza", dueDate: "10/03/2024", status: "pendente" },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Maria Silva concluiu a tarefa 'Registro de Humor Diário'", date: "02/02/2024" },
    { id: 2, message: "João Pereira agendou uma nova sessão para 15/02/2024", date: "05/02/2024" },
  ]);

  const addPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
  };

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const addNotification = (newNotification) => {
    setNotifications([...notifications, newNotification]);
  };

  return (
    <DashboardLayout userType="psychologist" userName="Dr. João Silva">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard do Psicólogo</h1>
          <p className="text-gray-600">Acompanhe o progresso dos seus pacientes</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="mood-analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise de Humor
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Testes
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Gamificação
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="mt-6">
            <PatientsList patients={patients} addPatient={addPatient} />
          </TabsContent>

          <TabsContent value="mood-analytics" className="mt-6">
            <MoodAnalytics />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TasksManager tasks={tasks} addTask={addTask} />
          </TabsContent>

          <TabsContent value="tests" className="mt-6">
            <PsychologicalTestsManager />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatPage currentUserId="temp-psychologist-id" userType="psychologist" />
          </TabsContent>

          <TabsContent value="gamification" className="mt-6">
            <PsychologistGamificationView psychologistId="temp-psychologist-id" />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsCenter notifications={notifications} addNotification={addNotification} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ReportsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PsychologistDashboard;
