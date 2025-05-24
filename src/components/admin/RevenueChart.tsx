
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const RevenueChart = () => {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-evolution'],
    queryFn: async () => {
      const months = [];
      const currentDate = new Date();
      
      // Gerar dados dos últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(currentDate, i);
        const monthLabel = format(targetMonth, 'MMM/yy', { locale: ptBR });
        
        const { data: revenue } = await supabase.rpc('calculate_estimated_revenue', {
          target_month: targetMonth.toISOString().split('T')[0]
        });
        
        months.push({
          month: monthLabel,
          revenue: revenue || 0
        });
      }
      
      return months;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Evolução da Receita</span>
          <span className="text-sm font-normal text-gray-500">(Últimos 6 meses)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Receita'
                ]}
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
