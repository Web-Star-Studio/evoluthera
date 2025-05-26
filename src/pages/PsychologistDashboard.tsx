
import { useAuth } from "@/contexts/AuthContext";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PsychologistMainDashboard from "@/components/psychologist/PsychologistMainDashboard";
import EnhancedPatientsList from "@/components/psychologist/EnhancedPatientsList";
import NotificationsCenter from "@/components/psychologist/NotificationsCenter";
import ReportsDashboard from "@/components/psychologist/ReportsDashboard";
import AIInsightsDashboard from "@/components/psychologist/AIInsightsDashboard";
import { Brain, Users, Bell, BarChart3, Home } from "lucide-react";

const PsychologistDashboard = () => {
  const { profile } = useAuth();

  return (
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, Dr(a). {profile?.name}
            </h1>
            <p className="text-gray-600">
              Painel profissional com insights de IA
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA & Insights
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PsychologistMainDashboard />
          </TabsContent>

          <TabsContent value="ai">
            <AIInsightsDashboard />
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Pacientes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedPatientsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Central de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationsCenter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard de Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UniversalDashboardLayout>
  );
};

export default PsychologistDashboard;
