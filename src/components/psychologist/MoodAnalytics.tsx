
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";

const MoodAnalytics = () => {
  // Dados de exemplo para análise de humor
  const moodData = [
    { date: "01/02", average: 3.2, patients: 15 },
    { date: "02/02", average: 3.5, patients: 18 },
    { date: "03/02", average: 2.8, patients: 12 },
    { date: "04/02", average: 4.1, patients: 20 },
    { date: "05/02", average: 3.8, patients: 16 },
    { date: "06/02", average: 4.2, patients: 22 },
    { date: "07/02", average: 3.9, patients: 19 }
  ];

  const categoryData = [
    { category: "Muito Baixo (1)", count: 8, color: "#ef4444" },
    { category: "Baixo (2)", count: 15, color: "#f97316" },
    { category: "Neutro (3)", count: 32, color: "#eab308" },
    { category: "Bom (4)", count: 28, color: "#22c55e" },
    { category: "Excelente (5)", count: 12, color: "#16a34a" }
  ];

  const stats = [
    {
      title: "Média Geral",
      value: "3.6",
      change: "+0.3",
      trend: "up",
      icon: Activity,
      description: "nos últimos 7 dias"
    },
    {
      title: "Registros Diários",
      value: "18",
      change: "+2",
      trend: "up", 
      icon: Calendar,
      description: "média por dia"
    },
    {
      title: "Tendência",
      value: "Positiva",
      change: "+12%",
      trend: "up",
      icon: TrendingUp,
      description: "melhoria geral"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Análise de Humor</h2>
        <p className="text-gray-600">Acompanhe o humor geral dos seus pacientes</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de Linha - Média de Humor */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Média de Humor</CardTitle>
          <CardDescription>
            Média diária de humor de todos os pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip 
                formatter={(value: any) => [`${value}`, 'Média de Humor']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Humor por Categoria</CardTitle>
          <CardDescription>
            Quantidade de registros por nível de humor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodAnalytics;
