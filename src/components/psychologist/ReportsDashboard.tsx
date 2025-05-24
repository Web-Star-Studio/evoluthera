
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, TrendingUp, Users, Calendar, Activity } from "lucide-react";

const ReportsDashboard = () => {
  // Dados de exemplo para relatórios
  const monthlyData = [
    { month: "Jan", sessions: 45, tests: 12, patients: 15 },
    { month: "Fev", sessions: 52, tests: 18, patients: 18 },
    { month: "Mar", sessions: 48, tests: 15, patients: 16 },
    { month: "Abr", sessions: 61, tests: 22, patients: 22 },
    { month: "Mai", sessions: 55, tests: 19, patients: 20 },
    { month: "Jun", sessions: 58, tests: 24, patients: 24 }
  ];

  const testResults = [
    { name: "PHQ-9", completed: 28, average: 8.5, improvement: "+15%" },
    { name: "BDI-II", completed: 22, average: 16.2, improvement: "+8%" },
    { name: "BAI", completed: 18, average: 12.8, improvement: "+22%" }
  ];

  const patientProgress = [
    { category: "Melhoria Significativa", value: 35, color: "#22c55e" },
    { category: "Melhoria Moderada", value: 28, color: "#eab308" },
    { category: "Estável", value: 25, color: "#3b82f6" },
    { category: "Declínio", value: 12, color: "#ef4444" }
  ];

  const stats = [
    {
      title: "Sessões Totais",
      value: "319",
      change: "+12%",
      icon: Calendar,
      description: "últimos 6 meses"
    },
    {
      title: "Testes Aplicados",
      value: "118",
      change: "+18%",
      icon: FileText,
      description: "últimos 6 meses"
    },
    {
      title: "Pacientes Ativos",
      value: "24",
      change: "+3",
      icon: Users,
      description: "este mês"
    },
    {
      title: "Taxa de Melhoria",
      value: "78%",
      change: "+5%",
      icon: TrendingUp,
      description: "pacientes com progresso"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <p className="text-gray-600">Visualize estatísticas e métricas dos seus atendimentos</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select defaultValue="last6months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="last3months">Últimos 3 meses</SelectItem>
              <SelectItem value="last6months">Últimos 6 meses</SelectItem>
              <SelectItem value="lastyear">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-600">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600">{stat.change}</span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de Atividade Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Mensal</CardTitle>
          <CardDescription>
            Evolução de sessões, testes aplicados e pacientes atendidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessões" />
              <Line type="monotone" dataKey="tests" stroke="#3b82f6" strokeWidth={2} name="Testes" />
              <Line type="monotone" dataKey="patients" stroke="#f59e0b" strokeWidth={2} name="Pacientes" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resultados dos Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes Psicológicos</CardTitle>
            <CardDescription>
              Performance e melhoria por tipo de teste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-gray-600">{test.completed} aplicações</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{test.average}</div>
                    <Badge className="bg-green-100 text-green-800">
                      {test.improvement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição do Progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Progresso dos Pacientes</CardTitle>
            <CardDescription>
              Classificação baseada na evolução do tratamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientProgress}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Pacientes']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {patientProgress.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>
            Baixe relatórios detalhados para análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Relatório Mensal Completo", description: "Análise completa do mês", icon: FileText },
              { name: "Progresso dos Pacientes", description: "Evolução individual dos pacientes", icon: TrendingUp },
              { name: "Estatísticas de Testes", description: "Resultados e métricas dos testes", icon: Activity },
              { name: "Resumo Financeiro", description: "Faturamento e sessões realizadas", icon: Calendar },
              { name: "Análise de Humor", description: "Tendências de humor dos pacientes", icon: Activity },
              { name: "Relatório de Aderência", description: "Taxa de conclusão de tarefas", icon: Users }
            ].map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-emerald-600">
                          <Download className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;
