
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const BillingMetrics = () => {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_metrics')
        .select(`
          *,
          profiles!billing_metrics_psychologist_id_fkey(name, email)
        `)
        .order('month_year', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processed: 'default',
      paid: 'default'
    } as const;
    
    const labels = {
      pending: 'Pendente',
      processed: 'Processado',
      paid: 'Pago'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const totalRevenue = billingData?.reduce((sum, record) => sum + (Number(record.revenue_amount) || 0), 0) || 0;
  const totalCommission = billingData?.reduce((sum, record) => sum + (Number(record.commission_amount) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comissão Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totalCommission.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Psicólogos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(billingData?.map(record => record.psychologist_id)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de Cobrança por Psicólogo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Psicólogo</TableHead>
                  <TableHead>Mês/Ano</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Taxa (%)</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando métricas...
                    </TableCell>
                  </TableRow>
                ) : billingData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhuma métrica encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  billingData?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.profiles?.name}</div>
                          <div className="text-sm text-gray-500">{record.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(record.month_year).toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>{record.sessions_count}</TableCell>
                      <TableCell>R$ {Number(record.revenue_amount).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{record.commission_rate}%</TableCell>
                      <TableCell>R$ {Number(record.commission_amount).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(record.status || 'pending')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingMetrics;
