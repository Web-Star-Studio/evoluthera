
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodData {
  date: string;
  mood: number;
}

interface MoodChartProps {
  patientName: string;
  data: MoodData[];
}

const MoodChart = ({ patientName, data }: MoodChartProps) => {
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

  const getLineColor = () => {
    const avgMood = data.reduce((sum, item) => sum + item.mood, 0) / data.length;
    if (avgMood <= 4) return '#ef4444';
    if (avgMood <= 6) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Gráfico de Humor - {patientName}
        </CardTitle>
        <p className="text-sm text-gray-600">Últimos 30 dias</p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value: number) => [getMoodLabel(value), 'Humor']}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke={getLineColor()}
                strokeWidth={2}
                dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhum registro de humor encontrado nos últimos 30 dias</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodChart;
