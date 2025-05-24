
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, DollarSign, Activity } from "lucide-react";

const AdminStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Total de psicólogos
      const { count: psychologistsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'psychologist');

      // Total de pacientes ativos
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Receita estimada (último mês)
      const { data: revenue } = await supabase
        .from('billing_metrics')
        .select('revenue_amount')
        .gte('month_year', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);

      const totalRevenue = revenue?.reduce((sum, record) => sum + (Number(record.revenue_amount) || 0), 0) || 0;

      // Atividade recente (sessões últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return {
        psychologists: psychologistsCount || 0,
        activePatients: patientsCount || 0,
        estimatedRevenue: totalRevenue,
        recentSessions: recentSessions || 0
      };
    }
  });

  const statCards = [
    {
      title: "Total de Psicólogos",
      value: stats?.psychologists || 0,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Pacientes Ativos",
      value: stats?.activePatients || 0,
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Receita Estimada",
      value: `R$ ${(stats?.estimatedRevenue || 0).toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: "text-emerald-600"
    },
    {
      title: "Sessões (7 dias)",
      value: stats?.recentSessions || 0,
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
