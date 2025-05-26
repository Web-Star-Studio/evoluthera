
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, AlertTriangle, CheckCircle } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalPatients: number;
    activePatientsToday: number;
    pendingTasksCount: number;
    criticalAlertsCount: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statsData = [
    {
      title: "Total de Pacientes",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Pacientes ativos"
    },
    {
      title: "Ativos Hoje",
      value: stats.activePatientsToday,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Registraram humor hoje"
    },
    {
      title: "Tarefas p/ Revisar",
      value: stats.pendingTasksCount,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Aguardando feedback"
    },
    {
      title: "Alertas Críticos",
      value: stats.criticalAlertsCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Requerem atenção"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
