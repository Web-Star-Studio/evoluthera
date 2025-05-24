
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, DollarSign, TrendingUp } from "lucide-react";

const AdminStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      // Buscar métricas principais
      const { data: metrics } = await supabase
        .from('admin_metrics')
        .select('*')
        .single();

      // Calcular receita estimada do mês atual
      const { data: revenue } = await supabase.rpc('calculate_estimated_revenue');

      // Calcular crescimento de pacientes
      const activePatientsCurrent = metrics?.active_patients_current_month || 0;
      const activePatientsLast30Days = metrics?.new_patients_last_30_days || 0;
      const growthPercentage = activePatientsCurrent > 0 
        ? ((activePatientsLast30Days / activePatientsCurrent) * 100).toFixed(1)
        : 0;

      return {
        totalPsychologists: metrics?.total_psychologists || 0,
        activePatients: activePatientsCurrent,
        estimatedRevenue: revenue || 0,
        newPatientsLast30Days: activePatientsLast30Days,
        growthPercentage: Number(growthPercentage)
      };
    }
  });

  const statCards = [
    {
      title: "Total de Psicólogos",
      value: stats?.totalPsychologists || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Cadastrados na plataforma"
    },
    {
      title: "Pacientes Ativos",
      value: stats?.activePatients || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "No mês atual"
    },
    {
      title: "Receita Estimada",
      value: `R$ ${(stats?.estimatedRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Baseada em pacientes ativos"
    },
    {
      title: "Crescimento (30 dias)",
      value: `+${stats?.newPatientsLast30Days || 0}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: `${stats?.growthPercentage || 0}% de crescimento`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </CardTitle>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
