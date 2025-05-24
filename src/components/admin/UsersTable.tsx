import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Settings, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  name: string;
  email: string;
  user_type: string;
  created_at: string;
  avatar_url?: string;
  account_control?: {
    status: string;
    suspension_reason?: string;
  } | null;
}

const UsersTable = () => {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserData[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          user_type,
          created_at,
          avatar_url,
          account_controls!left(
            status,
            suspension_reason
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
        account_control: Array.isArray(user.account_controls) && user.account_controls.length > 0 
          ? {
              status: user.account_controls[0].status || 'active',
              suspension_reason: user.account_controls[0].suspension_reason
            }
          : { status: 'active' }
      }));
    },
  });

  const getUserTypeBadge = (userType: string) => {
    const types = {
      admin: { label: "Admin", variant: "destructive" as const },
      psychologist: { label: "Psicólogo", variant: "default" as const },
      patient: { label: "Paciente", variant: "secondary" as const },
    };
    const type = types[userType as keyof typeof types] || { label: userType, variant: "outline" as const };
    return <Badge variant={type.variant}>{type.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      active: { label: "Ativo", variant: "default" as const, icon: CheckCircle },
      suspended: { label: "Suspenso", variant: "destructive" as const, icon: Ban },
    };
    const statusInfo = statuses[status as keyof typeof statuses] || statuses.active;
    const Icon = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) return <div>Carregando usuários...</div>;
  if (error) return <div>Erro ao carregar usuários</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Usuários do Sistema
        </CardTitle>
        <CardDescription>
          Gerencie todos os usuários cadastrados na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                <TableCell>
                  {getStatusBadge(user.account_control?.status || 'active')}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
