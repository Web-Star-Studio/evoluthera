
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, AlertTriangle, Info, CheckCircle } from "lucide-react";

const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-logs', searchTerm, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.ilike('action', `%${searchTerm}%`);
      }

      if (actionFilter !== 'all') {
        query = query.ilike('action', `%${actionFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getActionIcon = (action: string) => {
    if (action.includes('DELETE')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (action.includes('INSERT')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE')) {
      return <Badge variant="destructive">DELETE</Badge>;
    } else if (action.includes('INSERT')) {
      return <Badge className="bg-green-100 text-green-800">INSERT</Badge>;
    } else if (action.includes('UPDATE')) {
      return <Badge className="bg-yellow-100 text-yellow-800">UPDATE</Badge>;
    } else {
      return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs do Sistema</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="INSERT">Inserções</SelectItem>
              <SelectItem value="UPDATE">Atualizações</SelectItem>
              <SelectItem value="DELETE">Exclusões</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {getActionIcon(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getActionBadge(log.action)}
                        <div className="text-sm text-gray-600">{log.action}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.user_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-gray-400">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.ip_address ? (
                        <code className="text-xs">{String(log.ip_address)}</code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(log.created_at).toLocaleDateString('pt-BR')}</div>
                        <div className="text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600">Ver detalhes</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogs;
