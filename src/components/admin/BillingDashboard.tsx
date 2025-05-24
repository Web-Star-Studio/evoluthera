
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Download, Send, Receipt, TrendingUp, DollarSign, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BillingChart from "./BillingChart";
import InvoiceExportModal from "./InvoiceExportModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  psychologist_id: string;
  reference_month: string;
  active_patients_count: number;
  amount_per_patient: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  invoice_number: string;
  psychologist: {
    name: string;
    email: string;
  };
}

const BillingDashboard = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: invoices, isLoading: invoicesLoading, refetch } = useQuery({
    queryKey: ['monthly-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_invoices')
        .select(`
          *,
          psychologist:profiles!monthly_invoices_psychologist_id_fkey(name, email)
        `)
        .order('reference_month', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_dashboard_stats')
        .select('*')
        .limit(6);

      if (error) throw error;
      return data;
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

  const markAsPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from('monthly_invoices')
      .update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      })
      .eq('id', invoiceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a fatura como paga",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Fatura marcada como paga"
    });
    refetch();
  };

  const generateInvoices = async () => {
    const { data, error } = await supabase.rpc('generate_monthly_invoices');
    
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar faturas automáticas",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `${data} faturas geradas com sucesso`
    });
    refetch();
  };

  const currentMonthStats = stats?.[0] || {};
  const totalRevenue = invoices?.reduce((sum, invoice) => 
    sum + (invoice.status === 'paid' ? Number(invoice.total_amount) : 0), 0) || 0;
  const pendingRevenue = invoices?.reduce((sum, invoice) => 
    sum + (invoice.status === 'pending' ? Number(invoice.total_amount) : 0), 0) || 0;
  const overdueRevenue = invoices?.reduce((sum, invoice) => 
    sum + (invoice.status === 'overdue' ? Number(invoice.total_amount) : 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <DollarSign className="h-4 w-4" />
              Receita Recebida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Receita Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Receita Vencida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {overdueRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Users className="h-4 w-4" />
              Faturas Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentMonthStats.total_invoices || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de receita */}
      <BillingChart />

      {/* Ações principais */}
      <div className="flex gap-4">
        <Button onClick={generateInvoices} className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Gerar Faturas do Mês
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Tabela de faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número da Fatura</TableHead>
                  <TableHead>Psicólogo</TableHead>
                  <TableHead>Mês Referência</TableHead>
                  <TableHead>Pacientes Ativos</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando faturas...
                    </TableCell>
                  </TableRow>
                ) : invoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Nenhuma fatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices?.map((invoice) => (
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
                      <TableCell className="text-center">
                        {invoice.active_patients_count}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {invoice.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsPaid(invoice.id)}
                            >
                              Marcar como Pago
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex items-center gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Reenviar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoiceExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        invoices={invoices || []}
      />
    </div>
  );
};

export default BillingDashboard;
