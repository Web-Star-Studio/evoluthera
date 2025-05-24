
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar as CalendarIcon, Clock, Users, Plus } from "lucide-react";

const Calendar = () => {
  const { profile } = useAuth();
  
  const appointments = [
    {
      id: 1,
      patient: "Maria Silva",
      time: "09:00",
      duration: "50 min",
      type: "Consulta Regular",
      status: "confirmed"
    },
    {
      id: 2,
      patient: "João Santos",
      time: "10:30",
      duration: "50 min",
      type: "Primeira Consulta",
      status: "pending"
    },
    {
      id: 3,
      patient: "Ana Costa",
      time: "14:00",
      duration: "50 min",
      type: "Retorno",
      status: "confirmed"
    },
  ];

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <UniversalDashboardLayout userType={profile?.user_type}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              Agenda
            </h1>
            <p className="text-gray-600 capitalize">{today}</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {appointments.filter(a => a.status === 'confirmed').length} confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(appointments.map(a => a.patient)).size}</div>
              <p className="text-xs text-muted-foreground">
                Pacientes únicos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length * 50} min</div>
              <p className="text-xs text-muted-foreground">
                Aproximadamente {Math.round(appointments.length * 50 / 60)}h de consultas
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consultas de Hoje</CardTitle>
            <CardDescription>Agenda do dia atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-lg font-semibold text-purple-600">{appointment.time}</span>
                      <span className="text-xs text-gray-500">{appointment.duration}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.patient}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
              <CardDescription>Consultas agendadas para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Maria Silva</p>
                    <p className="text-sm text-gray-600">Amanhã, 09:00</p>
                  </div>
                  <Badge variant="outline">Retorno</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Carlos Oliveira</p>
                    <p className="text-sm text-gray-600">Sexta, 15:30</p>
                  </div>
                  <Badge variant="outline">Nova Consulta</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Semanal</CardTitle>
              <CardDescription>Estatísticas da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de consultas</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pacientes atendidos</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de comparecimento</span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Horas trabalhadas</span>
                  <span className="font-semibold">12.5h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UniversalDashboardLayout>
  );
};

export default Calendar;
