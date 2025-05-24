
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Calendar, Send, FileText, MessageCircle, Mic, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: 'text' | 'multiple_choice' | 'audio';
  options: any;
  due_date: string | null;
  priority: 'low' | 'normal' | 'high';
  estimated_duration: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  psychologist_comment?: string;
}

const EnhancedTasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [response, setResponse] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          task_responses(id, psychologist_comment)
        `)
        .eq("patient_id", "temp-user-id") // Substituir por auth.uid()
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const tasksWithComments = (data || []).map(task => ({
        ...task,
        psychologist_comment: task.task_responses?.[0]?.psychologist_comment
      }));
      
      setTasks(tasksWithComments);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("task_notifications")
        .select("*")
        .eq("recipient_id", "temp-user-id") // Substituir por auth.uid()
        .is("read_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("task_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedTask) return;

    const responseData: any = {
      task_id: selectedTask.id,
      patient_id: "temp-user-id", // Substituir por auth.uid()
      response_type: selectedTask.task_type,
    };

    if (selectedTask.task_type === 'multiple_choice') {
      if (!selectedChoice) {
        toast({
          title: "Selecione uma opção",
          description: "Por favor, escolha uma das opções disponíveis.",
          variant: "destructive",
        });
        return;
      }
      responseData.response_data = { selected_choice: selectedChoice };
      responseData.response = response.trim() || `Selecionou: ${selectedChoice}`;
    } else {
      if (!response.trim()) {
        toast({
          title: "Escreva uma resposta",
          description: "Por favor, descreva como foi realizar a tarefa.",
          variant: "destructive",
        });
        return;
      }
      responseData.response = response.trim();
    }

    setIsSubmitting(true);
    try {
      // Inserir resposta
      const { error: responseError } = await supabase
        .from("task_responses")
        .insert(responseData);

      if (responseError) throw responseError;

      // Atualizar status da tarefa para completed
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", selectedTask.id);

      if (updateError) throw updateError;

      // Criar notificação para o psicólogo
      await supabase
        .from("task_notifications")
        .insert({
          task_id: selectedTask.id,
          recipient_id: selectedTask.psychologist_id,
          type: "task_completed",
          message: `Paciente concluiu a tarefa: "${selectedTask.title}"`
        });

      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi registrada e enviada ao psicólogo.",
      });

      setSelectedTask(null);
      setResponse("");
      setSelectedChoice("");
      fetchTasks();
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua resposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
  }, []);

  const getStatusBadge = (task: Task) => {
    if (task.status === "completed") {
      return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
    }
    
    if (task.due_date && new Date(task.due_date) < new Date()) {
      return <Badge className="bg-red-100 text-red-800">Atrasada</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'multiple_choice': return <MessageCircle className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Minhas Tarefas
            {notifications.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800 ml-2">
                {notifications.length} nova{notifications.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Atividades recomendadas pelo seu psicólogo para apoiar seu bem-estar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Notificações */}
          {notifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Notificações</h3>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2 flex items-start justify-between"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{notification.message}</p>
                      <p className="text-xs text-blue-700">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Marcar como lida
                  </Button>
                </div>
              ))}
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma tarefa disponível no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTaskTypeIcon(task.task_type)}
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'normal' ? 'Normal' : 'Baixa'} prioridade
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.due_date ? `Prazo: ${formatDate(task.due_date)}` : "Sem prazo"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration ? `${task.estimated_duration}min` : 'Criada em ' + formatDate(task.created_at)}
                        </div>
                      </div>
                      {task.psychologist_comment && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-sm font-medium text-emerald-800">Comentário do Psicólogo:</p>
                          <p className="text-sm text-emerald-700 mt-1">{task.psychologist_comment}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task)}
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Responder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={selectedTask !== null} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              Responder Tarefa
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getTaskTypeIcon(selectedTask.task_type)}
                  <h3 className="font-semibold text-gray-900">{selectedTask.title}</h3>
                </div>
                {selectedTask.description && (
                  <p className="text-gray-600 text-sm">{selectedTask.description}</p>
                )}
                {selectedTask.estimated_duration && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Tempo estimado: {selectedTask.estimated_duration} minutos
                  </div>
                )}
              </div>
              
              {selectedTask.task_type === 'multiple_choice' && selectedTask.options?.choices ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {selectedTask.options.question || "Selecione uma opção:"}
                    </Label>
                    <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice} className="mt-2">
                      {selectedTask.options.choices.map((choice: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={choice} id={`choice-${index}`} />
                          <Label htmlFor={`choice-${index}`} className="text-sm">{choice}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additional-comment" className="text-sm font-medium text-gray-700">
                      Comentário adicional (opcional):
                    </Label>
                    <Textarea
                      id="additional-comment"
                      placeholder="Adicione qualquer observação sobre sua experiência..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="task-response" className="text-sm font-medium text-gray-700">
                    Como foi realizar esta atividade? Compartilhe sua experiência:
                  </Label>
                  <Textarea
                    id="task-response"
                    placeholder="Descreva como se sentiu, o que aprendeu, dificuldades encontradas, etc..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={
                    (selectedTask.task_type === 'multiple_choice' && !selectedChoice) ||
                    (selectedTask.task_type !== 'multiple_choice' && !response.trim()) ||
                    isSubmitting
                  }
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedTasksList;
