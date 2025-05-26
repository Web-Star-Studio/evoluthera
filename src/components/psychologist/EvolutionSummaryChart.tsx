
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, CheckCircle } from "lucide-react";

interface EvolutionData {
  date: string;
  averageMood: number;
  activePatients: number;
  completedTasks: number;
}

interface EvolutionSummaryChartProps {
  data: EvolutionData[];
}

const EvolutionSummaryChart = ({ data }: EvolutionSummaryChartProps) => {
  // Processar dados para exibição mais limpa (agregar por semana)
  const weeklyData = data.reduce((acc, curr, index) => {
    const weekIndex = Math.floor(index / 7);
    if (!acc[weekIndex]) {
      acc[weekIndex] = {
        week: `Sem ${weekIndex + 1}`,
        averageMood: 0,
        activePatients: 0,
        completedTasks: 0,
        count: 0
      };
    }
    
    acc[weekIndex].averageMood += curr.averageMood;
    acc[weekIndex].activePatients += curr.activePatients;
    acc[weekIndex].completedTasks += curr.completedTasks;
    acc[weekIndex].count += 1;
    
    return acc;
  }, [] as any[]);

  // Calcular médias semanais
  const processedData = weeklyData.map(week => ({
    week: week.week,
    averageMood: Number((week.averageMood / week.count).toFixed(1)),
    activePatients: Math.round(week.activePatients / week.count),
    completedTasks: week.completedTasks
  }));

  // Calcular tendências
  const currentWeek = processedData[processedData.length - 1];
  const previousWeek = processedData[processedData.length - 2];
  
  const moodTrend = currentWeek && previousWeek ? 
    currentWeek.averageMood - previousWeek.averageMood : 0;
  
  const activityTrend = currentWeek && previousWeek ?
    currentWeek.completedTasks - previousWeek.completedTasks : 0;

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'averageMood':
        return [`${value}/5`, 'Humor Médio'];
      case 'activePatients':
        return [value, 'Pacientes Ativos'];
      case 'completedTasks':
        return [value, 'Tarefas Concluídas'];
      default:
        return [value, name];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Evolução dos Pacientes (30 dias)
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Humor Médio</span>
            <span className={`ml-1 ${moodTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({moodTrend >= 0 ? '+' : ''}{moodTrend.toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Tarefas</span>
            <span className={`ml-1 ${activityTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({activityTrend >= 0 ? '+' : ''}{activityTrend})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de Humor */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Humor Médio Semanal
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  formatter={(value: number) => [`${value}/5`, 'Humor Médio']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageMood" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Atividade */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Tarefas Concluídas por Semana
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Tarefas Concluídas']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="completedTasks" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionSummaryChart;
