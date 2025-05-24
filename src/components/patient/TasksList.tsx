import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Calendar, Send } from "lucide-react";
import { useAchievementManager } from "../gamification/AchievementManager";

const TasksList = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const patientId = "temp-user-id"; // Substituir por auth.uid()
  const { checkAndAwardAchievements, awardPoints, updateStreak } = useAchievementManager(patientId);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("patient_id", "temp-user-id") // Substituir por auth.uid()
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Escreva uma resposta",
        description: "Por favor, descreva como foi realizar a tarefa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Inserir resposta
      const { error: responseError } = await supabase
        .from("task_responses")
        .insert({
          task_id: selectedTask.id,
          patient_id: patientId,
          response: response.trim(),
        });

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

      // Sistema de gamificação
      await awardPoints(patientId, 15, "tarefa completada");
      await updateStreak(patientId);
      
      // Atualizar contador de tarefas completadas
      await supabase
        .from('patient_stats')
        .update({
          tasks_completed: supabase.sql`tasks_completed + 1`
        })
        .eq('patient_id', patientId);

      // Verificar novas conquistas
      setTimeout(() => checkAndAwardAchievements(), 1000);

      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi registrada e enviada ao psicólogo. +15 pontos!",
      });

      setSelectedTask(null);
      setResponse("");
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
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Atrasada</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
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
          </CardTitle>
          <CardDescription>
            Atividades recomendadas pelo seu psicólogo para apoiar seu bem-estar
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
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
                          Criada em {formatDate(task.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
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
                <h3 className="font-semibold text-gray-900 mb-2">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <p className="text-gray-600 text-sm">{selectedTask.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="task-response" className="text-sm font-medium text-gray-700">
                  Como foi realizar esta atividade? Compartilhe sua experiência:
                </label>
                <Textarea
                  id="task-response"
                  placeholder="Descreva como se sentiu, o que aprendeu, dificuldades encontradas, etc..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || isSubmitting}
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

export default TasksList;
