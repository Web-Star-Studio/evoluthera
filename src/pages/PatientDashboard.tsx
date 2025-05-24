
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Clock, Heart, Trophy, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientData } from "@/hooks/usePatientData";

const PatientDashboard = () => {
  const { profile } = useAuth();
  const { stats, pendingTasks, loading, error } = usePatientData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" style={{ color: '#1893f8', borderColor: '#1893f8' }}>
            Paciente Ativo
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humor Médio</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {stats.averageMood > 0 ? stats.averageMood : '--'}
              </div>
              <p className="text-xs text-gray-600">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.streakDays} dias</div>
              <p className="text-xs text-gray-600">Registro diário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
              <CheckCircle className="h-4 w-4" style={{ color: '#1893f8' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#1893f8' }}>
                {stats.completedTasks}/{stats.totalTasks}
              </div>
              <p className="text-xs text-gray-600">Concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
              <Calendar className="h-4 w-4" style={{ color: '#1893f8' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#1893f8' }}>
                {stats.nextSession || '--'}
              </div>
              <p className="text-xs text-gray-600">Agendada</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" style={{ color: '#1893f8' }} />
                Progresso Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Registro de Humor</span>
                  <span>{stats.streakDays}/7 dias</span>
                </div>
                <Progress value={Math.min((stats.streakDays / 7) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Atividades Concluídas</span>
                  <span>{stats.completedTasks}/{stats.totalTasks} tarefas</span>
                </div>
                <Progress 
                  value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engajamento Geral</span>
                  <span>{Math.round((stats.averageMood / 5) * 100)}%</span>
                </div>
                <Progress value={(stats.averageMood / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" style={{ color: '#1893f8' }} />
                Atividades Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma tarefa pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">{task.title}</p>
                        <p className="text-sm text-blue-600">
                          {task.due_date ? `Vence ${formatDate(task.due_date)}` : 'Sem prazo definido'}
                        </p>
                      </div>
                      <Badge variant="secondary">Pendente</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Comece registrando seu humor ou completando uma tarefa!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1893f8' }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                    {activity.value && (
                      <Badge variant="outline" className="border-blue-200" style={{ color: '#1893f8', borderColor: '#1893f8' }}>
                        {activity.value}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
