
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Heart, Target } from "lucide-react";

interface SimpleMoodData {
  date: string;
  mood: number;
  tasks: number;
}

const SimplifiedMoodChart = () => {
  const [weeklyData, setWeeklyData] = useState<SimpleMoodData[]>([]);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - será substituído por dados reais do Supabase
  const mockData: SimpleMoodData[] = [
    { date: "2024-01-15", mood: 6, tasks: 2 },
    { date: "2024-01-16", mood: 7, tasks: 3 },
    { date: "2024-01-17", mood: 5, tasks: 1 },
    { date: "2024-01-18", mood: 8, tasks: 4 },
    { date: "2024-01-19", mood: 7, tasks: 2 },
    { date: "2024-01-20", mood: 9, tasks: 3 },
    { date: "2024-01-21", mood: 8, tasks: 2 },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setWeeklyData(mockData);
      const average = mockData.reduce((sum, item) => sum + item.mood, 0) / mockData.length;
      setMonthlyAverage(average);
      
      // Calcular tendência
      const firstHalf = mockData.slice(0, Math.floor(mockData.length / 2));
      const secondHalf = mockData.slice(Math.floor(mockData.length / 2));
      const firstAvg = firstHalf.reduce((sum, item) => sum + item.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, item) => sum + item.mood, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) setTrend('up');
      else if (secondAvg < firstAvg - 0.5) setTrend('down');
      else setTrend('stable');
      
      setIsLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getTrendMessage = () => {
    switch (trend) {
      case 'up': return { text: 'Seu humor está melhorando! 🌟', color: 'text-green-600' };
      case 'down': return { text: 'Vamos trabalhar juntos para melhorar', color: 'text-orange-600' };
      default: return { text: 'Humor estável nesta semana', color: 'text-blue-600' };
    }
  };

  const chartConfig = {
    mood: {
      label: "Humor",
      color: "#10b981",
    },
    tasks: {
      label: "Tarefas",
      color: "#3b82f6",
    },
  };

  const trendMessage = getTrendMessage();

  return (
    <div className="space-y-6">
      {/* Card de visão geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Humor Médio Mensal</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {monthlyAverage.toFixed(1)}
                </p>
                <p className={`text-sm ${trendMessage.color}`}>
                  {trendMessage.text}
                </p>
              </div>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-emerald-600" />
                {trend === 'up' && <TrendingUp className="h-6 w-6 text-green-500 ml-1" />}
                {trend === 'down' && <TrendingDown className="h-6 w-6 text-orange-500 ml-1" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tarefas Esta Semana</p>
                <p className="text-3xl font-bold text-blue-700">
                  {weeklyData.reduce((sum, item) => sum + item.tasks, 0)}
                </p>
                <p className="text-blue-600 text-sm">
                  Média: {(weeklyData.reduce((sum, item) => sum + item.tasks, 0) / weeklyData.length || 0).toFixed(1)} por dia
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de área do humor */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Jornada Emocional</CardTitle>
          <p className="text-sm text-gray-600">Últimos 7 dias</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando seus dados...</div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[1, 10]}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{formatDate(label)}</p>
                          <p className="text-emerald-600">Humor: {data.mood}/10</p>
                          <p className="text-blue-600">Tarefas: {data.tasks}</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Mini insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>💪 Progresso:</strong> Você completou tarefas em {weeklyData.filter(d => d.tasks > 0).length} dos últimos 7 dias!
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>📈 Descoberta:</strong> Nos dias que você completa mais tarefas, seu humor tende a ser melhor.
              </p>
            </div>
            
            {trend === 'up' && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>🌟 Parabéns:</strong> Seu humor está em uma tendência positiva! Continue assim!
                </p>
              </div>
            )}
            
            {weeklyData.some(d => d.mood >= 8) && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <strong>✨ Momento especial:</strong> Você teve dias com humor excelente esta semana!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedMoodChart;
