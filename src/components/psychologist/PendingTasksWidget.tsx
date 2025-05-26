
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Eye, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingTask {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  priority: 'low' | 'normal' | 'high';
  dueDate?: string;
  status: string;
}

interface PendingTasksWidgetProps {
  tasks: PendingTask[];
  onReviewTask?: (taskId: string) => void;
}

const PendingTasksWidget = ({ tasks, onReviewTask }: PendingTasksWidgetProps) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Baixa</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Normal</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          Tarefas para Revisar
          {tasks.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma tarefa pendente para revisar</p>
            <p className="text-sm">Todas as tarefas foram revisadas</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedTasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      {task.patientName}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onReviewTask?.(task.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Revisar
                  </Button>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Prazo: {formatDistanceToNow(new Date(task.dueDate), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingTasksWidget;
