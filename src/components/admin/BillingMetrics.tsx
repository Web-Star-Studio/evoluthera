
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import BillingDashboard from "./BillingDashboard";

const BillingMetrics = () => {
  const [showFullDashboard, setShowFullDashboard] = useState(false);

  const { data: recentInvoices, isLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_invoices')
        .select(`
          *,
          psychologist:profiles!monthly_invoices_psychologist_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_dashboard_stats')
        .select('*')
        .limit(1);

      if (error) throw error;
      return data?.[0];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline'
    } as const;
    
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (showFullDashboard) {
    return <BillingDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Resumo executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total Recebida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {Number(summary?.total_received || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Faturas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary?.pending_invoices || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pacientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.total_active_patients || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão para dashboard completo */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowFullDashboard(true)}
          className="flex items-center gap-2"
        >
          Ver Dashboard Completo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Faturas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Psicólogo</TableHead>
                  <TableHead>Mês Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando faturas...
                    </TableCell>
                  </TableRow>
                ) : recentInvoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma fatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInvoices?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.psychologist?.name}</div>
                          <div className="text-sm text-gray-500">{invoice.psychologist?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.reference_month), 'MMMM yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status || 'pending')}
                      </TableCell>
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
