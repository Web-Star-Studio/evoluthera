
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, File } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  psychologist_id: string;
  reference_month: string;
  active_patients_count: number;
  amount_per_patient: number;
  total_amount: number;
  status: string;
  due_date: string;
  paid_at?: string;
  invoice_number: string;
  psychologist: {
    name: string;
    email: string;
  };
}

interface InvoiceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

const InvoiceExportModal = ({ isOpen, onClose, invoices }: InvoiceExportModalProps) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'paid', 'overdue']);
  const [includeDetails, setIncludeDetails] = useState(true);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'overdue', label: 'Vencido' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filtrar por data
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.reference_month);
        return invoiceDate >= dateRange.from! && invoiceDate <= dateRange.to!;
      });
    }

    // Filtrar por status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(invoice => selectedStatuses.includes(invoice.status));
    }

    return filtered;
  };

  const exportToCSV = () => {
    const filteredInvoices = getFilteredInvoices();
    
    const headers = [
      'Número da Fatura',
      'Psicólogo',
      'Email',
      'Mês Referência', 
      'Pacientes Ativos',
      'Valor por Paciente',
      'Valor Total',
      'Status',
      'Data de Vencimento',
      'Data de Pagamento'
    ];

    const rows = filteredInvoices.map(invoice => [
      invoice.invoice_number,
      invoice.psychologist?.name || '',
      invoice.psychologist?.email || '',
      format(new Date(invoice.reference_month), 'MMMM yyyy', { locale: ptBR }),
      invoice.active_patients_count.toString(),
      `R$ ${Number(invoice.amount_per_patient).toFixed(2)}`,
      `R$ ${Number(invoice.total_amount).toFixed(2)}`,
      invoice.status,
      format(new Date(invoice.due_date), 'dd/MM/yyyy'),
      invoice.paid_at ? format(new Date(invoice.paid_at), 'dd/MM/yyyy') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `faturas-evoluthera-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: `${filteredInvoices.length} faturas exportadas em CSV`
    });
  };

  const exportToPDF = () => {
    // Para simplificar, vamos usar a mesma funcionalidade do CSV
    // Em um ambiente real, você usaria uma biblioteca como jsPDF ou react-pdf
    toast({
      title: "Em desenvolvimento",
      description: "Exportação em PDF será implementada em breve",
      variant: "destructive"
    });
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
    onClose();
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dados de Faturamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Formato de exportação */}
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  CSV (Excel)
                </SelectItem>
                <SelectItem value="pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por período */}
          <div className="space-y-2">
            <Label>Período (opcional)</Label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              placeholder="Selecione o período"
            />
          </div>

          {/* Filtro por status */}
          <div className="space-y-2">
            <Label>Status das Faturas</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.value}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={(checked) => handleStatusChange(status.value, checked as boolean)}
                  />
                  <Label htmlFor={status.value} className="text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Opções adicionais */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={includeDetails}
              onCheckedChange={setIncludeDetails}
            />
            <Label htmlFor="includeDetails" className="text-sm">
              Incluir detalhes dos psicólogos
            </Label>
          </div>

          {/* Resumo */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{getFilteredInvoices().length}</strong> faturas serão exportadas
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceExportModal;
