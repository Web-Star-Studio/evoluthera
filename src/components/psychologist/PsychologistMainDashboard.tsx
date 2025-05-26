
import { usePsychologistDashboard } from "@/hooks/usePsychologistDashboard";
import DashboardStats from "./DashboardStats";
import PatientOverviewCards from "./PatientOverviewCards";
import MoodAlertsWidget from "./MoodAlertsWidget";
import PendingTasksWidget from "./PendingTasksWidget";
import EvolutionSummaryChart from "./EvolutionSummaryChart";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PsychologistMainDashboard = () => {
  const { data, loading, error } = usePsychologistDashboard();
  const { toast } = useToast();

  const handlePatientSelect = (patientId: string) => {
    console.log('Selected patient:', patientId);
    // TODO: Navegação para detalhes do paciente
    toast({
      title: "Paciente selecionado",
      description: "Navegação para detalhes será implementada em breve",
    });
  };

  const handleContactPatient = (patientId: string) => {
    console.log('Contact patient:', patientId);
    // TODO: Abrir chat ou modal de contato
    toast({
      title: "Contato com paciente",
      description: "Funcionalidade de chat será implementada em breve",
    });
  };

  const handleReviewTask = (taskId: string) => {
    console.log('Review task:', taskId);
    // TODO: Abrir modal de revisão de tarefa
    toast({
      title: "Revisar tarefa",
      description: "Modal de revisão será implementado em breve",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erro ao carregar dashboard: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <DashboardStats stats={data.stats} />

      {/* Seção de Pacientes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Visão Geral dos Pacientes</h2>
        <PatientOverviewCards 
          patients={data.patients} 
          onPatientSelect={handlePatientSelect}
        />
      </div>

      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Humor */}
        <MoodAlertsWidget 
          alerts={data.moodAlerts}
          onContactPatient={handleContactPatient}
        />

        {/* Tarefas Pendentes */}
        <PendingTasksWidget 
          tasks={data.pendingTasks}
          onReviewTask={handleReviewTask}
        />
      </div>

      {/* Próximas Sessões (Placeholder) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Próximas Sessões</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Integração com agenda será implementada em breve</p>
            <p className="text-sm">Aqui aparecerão as próximas sessões agendadas</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      <EvolutionSummaryChart data={data.evolutionData} />
    </div>
  );
};

export default PsychologistMainDashboard;
