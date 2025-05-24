
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, UserMinus, UserPlus } from "lucide-react";

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, userTypeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          account_controls(status, suspension_reason)
        `);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (userTypeFilter !== 'all') {
        query = query.eq('user_type', userTypeFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string, currentStatus: string }) => {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const suspensionReason = newStatus === 'suspended' ? 'Suspensão administrativa' : null;
      
      const { error } = await supabase
        .from('account_controls')
        .upsert({
          user_id: userId,
          status: newStatus,
          suspension_reason: suspensionReason,
          suspended_by: newStatus === 'suspended' ? (await supabase.auth.getUser()).data.user?.id : null,
          suspended_at: newStatus === 'suspended' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (user: any) => {
    const status = user.account_controls?.[0]?.status || 'active';
    const variant = status === 'active' ? 'default' : status === 'suspended' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status === 'active' ? 'Ativo' : status === 'suspended' ? 'Suspenso' : 'Inativo'}</Badge>;
  };

  const getUserTypeBadge = (userType: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      psychologist: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800'
    };
    const labels = {
      admin: 'Admin',
      psychologist: 'Psicólogo',
      patient: 'Paciente'
    };
    
    return (
      <Badge className={colors[userType as keyof typeof colors]}>
        {labels[userType as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user => {
    if (statusFilter !== 'all') {
      const userStatus = user.account_controls?.[0]?.status || 'active';
      if (userStatus !== statusFilter) return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Usuários</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo de usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="psychologist">Psicólogos</SelectItem>
              <SelectItem value="patient">Pacientes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => {
                  const status = user.account_controls?.[0]?.status || 'active';
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {user.user_type !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus.mutate({ userId: user.id, currentStatus: status })}
                            disabled={toggleUserStatus.isPending}
                          >
                            {status === 'active' ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-1" />
                                Suspender
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Ativar
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
