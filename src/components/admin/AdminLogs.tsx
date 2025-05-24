
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar,
  User,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

interface LogEntry {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['admin-logs', searchTerm, actionFilter, userFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (searchTerm) {
        query = query.ilike('action', `%${searchTerm}%`);
      }

      if (actionFilter !== 'all') {
        query = query.ilike('action', `%${actionFilter}%`);
      }

      if (userFilter) {
        query = query.ilike('user_id', `%${userFilter}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00`);
      }

      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LogEntry[];
    }
  });

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('delete') || actionLower.includes('suspend')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (actionLower.includes('create') || actionLower.includes('insert')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <User className="h-4 w-4 text-blue-500" />;
    } else if (actionLower.includes('payment') || actionLower.includes('billing')) {
      return <Activity className="h-4 w-4 text-purple-500" />;
    } else if (actionLower.includes('alert') || actionLower.includes('warning')) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    } else if (actionLower.includes('admin') || actionLower.includes('security')) {
      return <Shield className="h-4 w-4 text-red-600" />;
    } else {
      return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('delete') || actionLower.includes('suspend')) {
      return <Badge variant="destructive">CRÍTICO</Badge>;
    } else if (actionLower.includes('create') || actionLower.includes('insert')) {
      return <Badge className="bg-green-100 text-green-800">CRIAÇÃO</Badge>;
    } else if (actionLower.includes('update') || actionLower.includes('modify')) {
      return <Badge className="bg-yellow-100 text-yellow-800">MODIFICAÇÃO</Badge>;
    } else if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <Badge className="bg-blue-100 text-blue-800">AUTENTICAÇÃO</Badge>;
    } else if (actionLower.includes('payment') || actionLower.includes('billing')) {
      return <Badge className="bg-purple-100 text-purple-800">FINANCEIRO</Badge>;
    } else if (actionLower.includes('admin') || actionLower.includes('security')) {
      return <Badge className="bg-red-100 text-red-800">ADMIN</Badge>;
    } else {
      return <Badge variant="secondary">SISTEMA</Badge>;
    }
  };

  const getRiskLevel = (action: string) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('delete') || actionLower.includes('suspend') || actionLower.includes('admin')) {
      return 'high';
    } else if (actionLower.includes('update') || actionLower.includes('payment')) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const exportLogs = async () => {
    setIsExporting(true);
    try {
      const exportData = logs?.map(log => ({
        'Data/Hora': new Date(log.created_at).toLocaleString('pt-BR'),
        'Ação': log.action,
        'Usuário ID': log.user_id || 'Sistema',
        'IP': log.ip_address || 'N/A',
        'User Agent': log.user_agent || 'N/A',
        'Detalhes': JSON.stringify(log.details || {})
      }));

      if (!exportData?.length) {
        toast({
          title: "Nenhum dado para exportar",
          variant: "destructive"
        });
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            let value = row[header as keyof typeof row];
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
      link.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Relatório exportado",
        description: "O arquivo CSV foi baixado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setUserFilter("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600">Rastreamento completo de ações do sistema</p>
        </div>
      </div>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Ação</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Ação</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criações</SelectItem>
                  <SelectItem value="UPDATE">Atualizações</SelectItem>
                  <SelectItem value="DELETE">Exclusões</SelectItem>
                  <SelectItem value="LOGIN">Autenticação</SelectItem>
                  <SelectItem value="PAYMENT">Pagamentos</SelectItem>
                  <SelectItem value="SUSPEND">Suspensões</SelectItem>
                  <SelectItem value="ADMIN">Ações Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ID do usuário..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Filtros
            </Button>
            <Button onClick={exportLogs} disabled={isExporting} size="sm">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Logs</p>
                <p className="text-lg font-semibold">{logs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Ações Críticas</p>
                <p className="text-lg font-semibold">
                  {logs?.filter(log => getRiskLevel(log.action) === 'high').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Usuários Únicos</p>
                <p className="text-lg font-semibold">
                  {new Set(logs?.filter(log => log.user_id).map(log => log.user_id)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">IPs Únicos</p>
                <p className="text-lg font-semibold">
                  {new Set(logs?.filter(log => log.ip_address).map(log => log.ip_address)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Risco</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP/Localização</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        Carregando logs...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Nenhum log encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs?.map((log) => (
                    <TableRow key={log.id} className={
                      getRiskLevel(log.action) === 'high' ? 'bg-red-50' :
                      getRiskLevel(log.action) === 'medium' ? 'bg-yellow-50' : ''
                    }>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <div className={`w-2 h-2 rounded-full ${
                            getRiskLevel(log.action) === 'high' ? 'bg-red-500' :
                            getRiskLevel(log.action) === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getActionBadge(log.action)}
                          <div className="text-sm text-gray-600 font-mono">{log.action}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.user_id ? (
                          <div>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                              {log.user_id.slice(0, 8)}...
                            </code>
                          </div>
                        ) : (
                          <Badge variant="outline">Sistema</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {log.ip_address ? (
                            <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
                              {log.ip_address}
                            </code>
                          ) : (
                            <span className="text-gray-400 text-xs">IP não registrado</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(log.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              Ver detalhes
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-w-md">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400 text-xs">Sem detalhes</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {logs && logs.length >= 500 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Mostrando apenas os 500 registros mais recentes. Use filtros para refinar a busca.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
