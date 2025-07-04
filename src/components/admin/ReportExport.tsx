
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

interface ExportRow {
  [key: string]: string | number | null;
}

const ReportExport = () => {
  const [reportType, setReportType] = useState("");
  const [format, setFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = (data: ExportRow[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let value = row[header];
          if (value === null || value === undefined) value = '';
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const handleExport = async () => {
    if (!reportType) {
      toast({
        title: "Selecione um tipo de relatório",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      let data: ExportRow[] = [];
      let filename: string = '';

      switch (reportType) {
        case 'users':
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, name, email, user_type, created_at');
          
          const { data: accountControls } = await supabase
            .from('account_controls')
            .select('user_id, status');
          
          data = (usersData || []).map(user => {
            const control = accountControls?.find(ac => ac.user_id === user.id);
            return {
              Nome: user.name || '',
              Email: user.email || '',
              Tipo: user.user_type || '',
              Status: control?.status || 'active',
              'Data de Criação': new Date(user.created_at).toLocaleDateString('pt-BR')
            };
          });
          filename = 'relatorio_usuarios';
          break;

        case 'billing':
          const { data: billingData } = await supabase
            .from('billing_metrics')
            .select('*');
          
          const { data: psychologists } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('user_type', 'psychologist');
          
          data = (billingData || []).map(record => {
            const psychologist = psychologists?.find(p => p.id === record.psychologist_id);
            return {
              Psicólogo: psychologist?.name || '',
              Email: psychologist?.email || '',
              'Mês/Ano': new Date(record.month_year).toLocaleDateString('pt-BR'),
              Sessões: record.sessions_count || 0,
              Receita: record.revenue_amount || 0,
              'Taxa (%)': record.commission_rate || 0,
              Comissão: record.commission_amount || 0,
              Status: record.status || 'pending'
            };
          });
          filename = 'relatorio_cobranca';
          break;

        case 'sessions':
          const { data: sessionsData } = await supabase
            .from('sessions')
            .select('date, duration, mood_assessment, created_at, psychologist_id, patient_id');
          
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id, name');
          
          data = (sessionsData || []).map(session => {
            const psychologist = allProfiles?.find(p => p.id === session.psychologist_id);
            const patient = allProfiles?.find(p => p.id === session.patient_id);
            return {
              Data: new Date(session.date).toLocaleDateString('pt-BR'),
              Duração: session.duration || 0,
              'Avaliação de Humor': session.mood_assessment || 0,
              Psicólogo: psychologist?.name || '',
              Paciente: patient?.name || '',
              'Criado em': new Date(session.created_at).toLocaleDateString('pt-BR')
            };
          });
          filename = 'relatorio_sessoes';
          break;

        case 'logs':
          const { data: logsData } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);
          
          data = (logsData || []).map(log => ({
            Ação: log.action || '',
            'ID do Usuário': log.user_id || '',
            'Endereço IP': log.ip_address ? log.ip_address.toString() : '',
            'User Agent': log.user_agent || '',
            'Data/Hora': new Date(log.created_at).toLocaleString('pt-BR')
          }));
          filename = 'relatorio_logs';
          break;

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      if (data && data.length > 0) {
        exportToCSV(data, filename);
        toast({
          title: "Relatório exportado",
          description: `O relatório foi baixado com sucesso.`,
        });
      } else {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há dados disponíveis para exportação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportação de Relatórios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">Relatório de Usuários</SelectItem>
                <SelectItem value="billing">Relatório de Cobrança</SelectItem>
                <SelectItem value="sessions">Relatório de Sessões</SelectItem>
                <SelectItem value="logs">Relatório de Logs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Formato</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={!reportType || isExporting}
          className="w-full"
        >
          {isExporting ? (
            "Exportando..."
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </>
          )}
        </Button>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Relatórios Disponíveis:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span><strong>Usuários:</strong> Lista completa de usuários com status e tipo</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span><strong>Cobrança:</strong> Métricas financeiras por psicólogo</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span><strong>Sessões:</strong> Histórico de sessões realizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span><strong>Logs:</strong> Registro de atividades do sistema</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExport;
