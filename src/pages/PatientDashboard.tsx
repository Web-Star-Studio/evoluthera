
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PatientDashboard = () => {
  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Progresso</h1>
          <p className="text-gray-600">Acompanhe sua jornada de bem-estar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Humor Geral</CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 mb-2">8.5</div>
              <p className="text-sm text-gray-600">De 10 pontos</p>
              <Progress value={85} className="mt-3" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividades Concluídas</CardTitle>
              <CardDescription>Esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">12/15</div>
              <p className="text-sm text-gray-600">Parabéns pelo progresso!</p>
              <Progress value={80} className="mt-3" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próxima Sessão</CardTitle>
              <CardDescription>Agendamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                15 de Janeiro
              </div>
              <p className="text-sm text-gray-600 mb-3">14:00 - Dr. João Santos</p>
              <Button size="sm" className="w-full">Ver Detalhes</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Diário Emocional</CardTitle>
              <CardDescription>Registre como você se sente hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">😊</span>
                  <span className="text-2xl">😐</span>
                  <span className="text-2xl">😔</span>
                  <span className="text-2xl">😰</span>
                  <span className="text-2xl">😢</span>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Registrar Humor
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Pendentes</CardTitle>
              <CardDescription>Atividades recomendadas pelo seu terapeuta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Exercício de respiração</span>
                  <Button size="sm" variant="outline">Fazer</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Escrever 3 gratidões</span>
                  <Button size="sm" variant="outline">Fazer</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Meditação guiada</span>
                  <Button size="sm" variant="outline">Fazer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
