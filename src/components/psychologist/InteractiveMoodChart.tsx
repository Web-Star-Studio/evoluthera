
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";

interface MoodData {
  date: string;
  mood: number;
  tasks_completed: number;
  events?: Array<{
    type: 'crisis' | 'insomnia' | 'change' | 'positive';
    description: string;
  }>;
}

interface InteractiveMoodChartProps {
  patientId: string;
  patientName: string;
}

const InteractiveMoodChart = ({ patientId, patientName }: InteractiveMoodChartProps) => {
  const [data, setData] = useState<MoodData[]>([]);
  const [period, setPeriod] = useState<'30' | '60' | '90'>('30');
  const [showEvents, setShowEvents] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - será substituído por dados reais do Supabase
  const mockData: MoodData[] = [
    { 
      date: "2024-01-01", 
      mood: 7, 
      tasks_completed: 2,
      events: [{ type: 'positive', description: 'Início do tratamento' }]
    },
    { date: "2024-01-02", mood: 6, tasks_completed: 1 },
    { 
      date: "2024-01-03", 
      mood: 4, 
      tasks_completed: 0,
      events: [{ type: 'crisis', description: 'Crise de ansiedade' }]
    },
    { date: "2024-01-04", mood: 5, tasks_completed: 1 },
    { date: "2024-01-05", mood: 6, tasks_completed: 3 },
    { date: "2024-01-06", mood: 8, tasks_completed: 2 },
    { 
      date: "2024-01-07", 
      mood: 7, 
      tasks_completed: 2,
      events: [{ type: 'change', description: 'Mudança de medicação' }]
    },
    { date: "2024-01-08", mood: 8, tasks_completed: 3 },
    { date: "2024-01-09", mood: 9, tasks_completed: 2 },
    { date: "2024-01-10", mood: 8, tasks_completed: 1 },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 500);
  }, [patientId, period]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getMoodLabel = (mood: number) => {
    if (mood <= 3) return 'Muito Baixo';
    if (mood <= 5) return 'Baixo';
    if (mood <= 7) return 'Moderado';
    if (mood <= 8) return 'Bom';
    return 'Excelente';
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'crisis': return '#ef4444';
      case 'insomnia': return '#f59e0b';
      case 'change': return '#3b82f6';
      case 'positive': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'crisis': return <AlertTriangle className="h-3 w-3" />;
      case 'insomnia': return <Calendar className="h-3 w-3" />;
      case 'change': return <TrendingUp className="h-3 w-3" />;
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      default: return null;
    }
  };

  const averageMood = data.reduce((sum, item) => sum + item.mood, 0) / data.length || 0;
  const totalTasks = data.reduce((sum, item) => sum + item.tasks_completed, 0);
  const eventsCount = data.reduce((sum, item) => sum + (item.events?.length || 0), 0);

  const chartConfig = {
    mood: {
      label: "Humor",
      color: "#10b981",
    },
    tasks_completed: {
      label: "Tarefas Concluídas",
      color: "#3b82f6",
    },
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!showEvents || !payload.events?.length) return null;

    return payload.events.map((event: any, index: number) => (
      <Dot
        key={index}
        cx={cx}
        cy={cy - 10}
        r={4}
        fill={getEventColor(event.type)}
        stroke="#fff"
        strokeWidth={2}
      />
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Evolução do Humor - {patientName}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Análise detalhada dos últimos {period} dias
            </p>
          </div>
          <div className="flex gap-2">
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
        </div>

        {/* Controles de visualização */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={showEvents ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEvents(!showEvents)}
          >
            Eventos
          </Button>
          <Button
            variant={showTasks ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTasks(!showTasks)}
          >
            Tarefas
          </Button>
        </div>

        {/* Estatísticas resumidas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {averageMood.toFixed(1)}
            </div>
            <div className="text-sm text-emerald-600">Humor Médio</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-sm text-blue-600">Tarefas Concluídas</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{eventsCount}</div>
            <div className="text-sm text-orange-600">Eventos Marcantes</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                        <p className="text-emerald-600">
                          Humor: {getMoodLabel(data.mood)} ({data.mood})
                        </p>
                        {showTasks && (
                          <p className="text-blue-600">
                            Tarefas: {data.tasks_completed}
                          </p>
                        )}
                        {showEvents && data.events?.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-sm">Eventos:</p>
                            {data.events.map((event: any, index: number) => (
                              <div key={index} className="flex items-center gap-1 text-xs">
                                {getEventIcon(event.type)}
                                <span>{event.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                
                {/* Linha de referência para humor médio */}
                <ReferenceLine 
                  y={averageMood} 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  label="Média"
                />
                
                {/* Linha principal do humor */}
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={<CustomDot />}
                />
                
                {/* Linha das tarefas (se habilitada) */}
                {showTasks && (
                  <Line 
                    type="monotone" 
                    dataKey="tasks_completed" 
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    yAxisId="right"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhum registro de humor encontrado para este período</p>
          </div>
        )}

        {/* Legenda de eventos */}
        {showEvents && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Legenda de Eventos:</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Crise</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Insônia</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Mudança</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Positivo</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveMoodChart;
