
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Lock, Unlock } from "lucide-react";
import { useAnamnesisApplications } from "@/hooks/useAnamnesisApplications";

const ApplicationsList = () => {
  const { applications, isLoading, updateApplicationStatus, addPsychologistNote } = useAnamnesisApplications();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      sent: { label: "Enviado", variant: "secondary" as const },
      in_progress: { label: "Em Andamento", variant: "default" as const },
      completed: { label: "Concluído", variant: "default" as const },
      locked: { label: "Bloqueado", variant: "destructive" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.sent;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando aplicações...</div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aplicações de Anamnese</CardTitle>
          <CardDescription>Nenhuma anamnese foi enviada ainda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">
              Você ainda não enviou nenhuma anamnese para seus pacientes
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aplicações de Anamnese</CardTitle>
        <CardDescription>{applications.length} aplicações encontradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{application.patient?.name}</h3>
                  <p className="text-sm text-gray-600">{application.patient?.email}</p>
                  <p className="text-sm text-gray-500">
                    Template: {application.template?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Enviado:</span><br />
                  {formatDate(application.sent_at)}
                </div>
                <div>
                  <span className="font-medium">Iniciado:</span><br />
                  {formatDate(application.started_at)}
                </div>
                <div>
                  <span className="font-medium">Concluído:</span><br />
                  {formatDate(application.completed_at)}
                </div>
                <div>
                  <span className="font-medium">Bloqueado:</span><br />
                  {formatDate(application.locked_at)}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>

                {application.status === 'completed' && !application.locked_at && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateApplicationStatus(application.id, 'locked')}
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Bloquear
                  </Button>
                )}

                {application.status === 'locked' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateApplicationStatus(application.id, 'completed')}
                  >
                    <Unlock className="h-4 w-4 mr-1" />
                    Desbloquear
                  </Button>
                )}

                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Anotações
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationsList;
