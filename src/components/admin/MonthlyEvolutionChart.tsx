
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MonthlyEvolutionChart = () => {
  const { data: evolutionData, isLoading } = useQuery({
    queryKey: ['monthly-evolution'],
    queryFn: async () => {
      const { data } = await supabase
        .from('monthly_evolution')
        .select('*')
        .order('month', { ascending: true });

      // Agrupar dados por mês
      const groupedData = data?.reduce((acc: any, item: any) => {
        const monthKey = format(new Date(item.month), 'yyyy-MM');
        const monthLabel = format(new Date(item.month), 'MMM/yy', { locale: ptBR });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthLabel,
            monthKey,
            psychologists: 0,
            patients: 0
          };
        }
        
        if (item.metric_type === 'psychologists') {
          acc[monthKey].psychologists = item.cumulative_count;
        } else if (item.metric_type === 'patients') {
          acc[monthKey].patients = item.cumulative_count;
        }
        
        return acc;
      }, {});

      return Object.values(groupedData || {}).slice(-12); // Últimos 12 meses
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal da Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Evolução Mensal da Base</span>
          <span className="text-sm font-normal text-gray-500">(Últimos 12 meses)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="psychologists" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Psicólogos"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Pacientes"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyEvolutionChart;
