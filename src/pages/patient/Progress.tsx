
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import WeeklyProgressChart from "@/components/patient/WeeklyProgressChart";
import { Calendar, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PatientProgress = () => {
  return (
    <UniversalDashboardLayout userType="patient">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Progresso</h1>
            <p className="text-gray-600">Acompanhe sua evolução terapêutica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                17 de 20 atividades concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendência</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">↗ Positiva</div>
              <p className="text-xs text-muted-foreground">
                Melhoria constante nas últimas semanas
              </p>
            </CardContent>
          </Card>
        </div>

        <WeeklyProgressChart />
      </div>
    </UniversalDashboardLayout>
  );
};

export default PatientProgress;
