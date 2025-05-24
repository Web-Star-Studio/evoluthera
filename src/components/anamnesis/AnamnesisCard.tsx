
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Copy, Lock, Unlock, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Anamnesis {
  id: string;
  status: string;
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
  };
}

interface AnamnesisCardProps {
  anamnesis: Anamnesis;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSaveAsTemplate: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const AnamnesisCard = ({
  anamnesis,
  onView,
  onEdit,
  onDuplicate,
  onSaveAsTemplate,
  onStatusChange,
  onDelete,
}: AnamnesisCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      sent: { label: "Enviado", variant: "default" as const },
      in_progress: { label: "Em Andamento", variant: "default" as const },
      completed: { label: "Concluído", variant: "default" as const },
      locked: { label: "Bloqueado", variant: "destructive" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold">{anamnesis.patient?.name}</h3>
          <p className="text-sm text-gray-600">{anamnesis.patient?.email}</p>
          <p className="text-sm text-gray-500">
            Template: {anamnesis.template?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(anamnesis.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Criado:</span><br />
          {formatDate(anamnesis.created_at)}
        </div>
        <div>
          <span className="font-medium">Enviado:</span><br />
          {formatDate(anamnesis.sent_at)}
        </div>
        <div>
          <span className="font-medium">Concluído:</span><br />
          {formatDate(anamnesis.completed_at)}
        </div>
        <div>
          <span className="font-medium">Bloqueado:</span><br />
          {formatDate(anamnesis.locked_at)}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(anamnesis.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizar
        </Button>
        
        {anamnesis.status !== 'locked' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(anamnesis.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onDuplicate(anamnesis.id)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicar
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSaveAsTemplate(anamnesis.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Salvar como Template
        </Button>

        {anamnesis.status === 'completed' && !anamnesis.locked_at && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(anamnesis.id, 'locked')}
          >
            <Lock className="h-4 w-4 mr-1" />
            Bloquear
          </Button>
        )}

        {anamnesis.status === 'locked' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(anamnesis.id, 'completed')}
          >
            <Unlock className="h-4 w-4 mr-1" />
            Desbloquear
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar esta anamnese? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(anamnesis.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AnamnesisCard;
