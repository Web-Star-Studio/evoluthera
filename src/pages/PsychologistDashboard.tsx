
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PsychologistDashboard = () => {
  const patients = [
    { id: 1, name: "Maria Silva", status: "Ativo", lastSession: "10/01/2024", progress: "Bom" },
    { id: 2, name: "João Santos", status: "Ativo", lastSession: "08/01/2024", progress: "Excelente" },
    { id: 3, name: "Ana Costa", status: "Pendente", lastSession: "05/01/2024", progress: "Regular" },
  ];

  return (
    <DashboardLayout userType="psychologist" userName="Dr. João Santos">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Profissional</h1>
          <p className="text-gray-600">Gerencie seus pacientes e acompanhe o progresso</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">24</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessões Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">18</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">5</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">87%</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes Recentes</CardTitle>
              <CardDescription>Últimas atualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">Última sessão: {patient.lastSession}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={patient.status === "Ativo" ? "default" : "secondary"}>
                        {patient.status}
                      </Badge>
                      <Button size="sm" variant="outline">Ver</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Alertas e lembretes importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Lembrete</p>
                  <p className="text-sm text-yellow-700">Sessão com Maria Silva em 30 minutos</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Nova Resposta</p>
                  <p className="text-sm text-blue-700">João Santos completou a atividade de respiração</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Progresso</p>
                  <p className="text-sm text-green-700">Ana Costa melhorou sua pontuação de humor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PsychologistDashboard;
