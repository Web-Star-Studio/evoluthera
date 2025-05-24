
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalyticsData {
  mood_distribution: Array<{ range: string; count: number; percentage: number }>;
  weekly_average: Array<{ week: string; average: number; trend: 'up' | 'down' | 'stable' }>;
  correlation_data: {
    tasks_vs_mood: number;
    events_impact: Array<{ type: string; mood_change: number }>;
  };
}

interface PatientMoodAnalyticsProps {
  patientId: string;
  patientName: string;
}

const PatientMoodAnalytics = ({ patientId, patientName }: PatientMoodAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'30' | '60' | '90'>('30');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - será substituído por dados reais do Supabase
  const mockData: AnalyticsData = {
    mood_distribution: [
      { range: "1-2 (Muito Baixo)", count: 2, percentage: 8 },
      { range: "3-4 (Baixo)", count: 5, percentage: 20 },
      { range: "5-6 (Moderado)", count: 10, percentage: 40 },
      { range: "7-8 (Bom)", count: 6, percentage: 24 },
      { range: "9-10 (Excelente)", count: 2, percentage: 8 },
    ],
    weekly_average: [
      { week: "Sem 1", average: 6.2, trend: 'up' },
      { week: "Sem 2", average: 5.8, trend: 'down' },
      { week: "Sem 3", average: 6.5, trend: 'up' },
      { week: "Sem 4", average: 7.1, trend: 'up' },
    ],
    correlation_data: {
      tasks_vs_mood: 0.73,
      events_impact: [
        { type: "Crise", mood_change: -2.3 },
        { type: "Insônia", mood_change: -1.5 },
        { type: "Mudança", mood_change: 0.5 },
        { type: "Positivo", mood_change: 1.8 },
      ]
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 500);
  }, [patientId, period]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const COLORS = ['#ef4444', '#f59e0b', '#6b7280', '#3b82f6', '#10b981'];

  const chartConfig = {
    count: {
      label: "Registros",
      color: "#3b82f6",
    },
    average: {
      label: "Média Semanal",
      color: "#10b981",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análise Detalhada - {patientName}</h3>
          <p className="text-sm text-gray-600">Insights e correlações dos últimos {period} dias</p>
        </div>
        <Select value={period} onValueChange={(value: '30' | '60' | '90') => setPeriod(value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30d</SelectItem>
            <SelectItem value="60">60d</SelectItem>
            <SelectItem value="90">90d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Humor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Humor</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.mood_distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {data.mood_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{data.range}</p>
                          <p className="text-sm">{data.count} registros ({data.percentage}%)</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-1">
              {data.mood_distribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.range}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendência Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly_average}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 12 }} />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">Média: {data.average}</p>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(data.trend)}
                            <span className="text-xs capitalize">{data.trend}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="average" 
                    fill={(entry: any) => getTrendColor(entry.trend)}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Correlação Tarefas vs Humor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Correlação Tarefas vs Humor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.round(data.correlation_data.tasks_vs_mood * 100)}%
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Correlação positiva entre tarefas concluídas e melhora do humor
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${data.correlation_data.tasks_vs_mood * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {data.correlation_data.tasks_vs_mood >= 0.7 ? 'Correlação forte' : 
                 data.correlation_data.tasks_vs_mood >= 0.5 ? 'Correlação moderada' : 'Correlação fraca'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impacto de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impacto de Eventos no Humor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.correlation_data.events_impact.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{event.type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      event.mood_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {event.mood_change > 0 ? '+' : ''}{event.mood_change}
                    </span>
                    {event.mood_change > 0 ? 
                      <TrendingUp className="h-4 w-4 text-green-500" /> : 
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientMoodAnalytics;
