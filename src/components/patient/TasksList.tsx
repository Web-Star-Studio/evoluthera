import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, AlertCircle, Target, Calendar, MessageSquare } from "lucide-react";
import { incrementTaskCompleted } from "@/utils/supabaseRpc";

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
}

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientId = "temp-user-id"; // Substituir por auth.uid()

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      // Atualizar status da tarefa
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Adicionar resposta se houver
      if (response.trim()) {
        const { error: responseError } = await supabase
          .from('task_responses')
          .insert({
            task_id: taskId,
            patient_id: patientId,
            response: response
          });

        if (responseError) throw responseError;
      }

      // Atualizar estatísticas do paciente usando a nova função
      await incrementTaskCompleted(patientId);

      // Resetar formulário e recarregar tarefas
      setSelectedTask(null);
      setResponse("");
      fetchTasks();
      
      alert('Tarefa concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      alert('Erro ao concluir tarefa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasada";
      default:
        return "Não iniciada";
    }
  };

  const isTaskOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && tasks.find(t => t.due_date === dueDate)?.status !== 'completed';
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-500" />
          Suas Tarefas
        </h2>
        <p className="text-gray-600">Complete as atividades propostas pelo seu psicólogo</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isOverdue = isTaskOverdue(task.due_date);
          const taskStatus = isOverdue ? 'overdue' : task.status;
          
          return (
            <Card key={task.id} className={`${task.status === 'completed' ? 'bg-gray-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(taskStatus)}
                      {task.title}
                    </CardTitle>
                    {task.description && (
                      <CardDescription className="mt-2">
                        {task.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={getStatusColor(taskStatus)}>
                    {getStatusLabel(taskStatus)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </div>

                {task.status === 'pending' && (
                  <div className="space-y-3">
                    {selectedTask === task.id && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Resposta ou comentário (opcional):
                          </label>
                          <Textarea
                            placeholder="Descreva como foi realizar esta tarefa, suas reflexões ou dificuldades..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => completeTask(task.id)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Salvando...' : 'Marcar como Concluída'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedTask(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask !== task.id && (
                      <Button 
                        onClick={() => setSelectedTask(task.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Concluir Tarefa
                      </Button>
                    )}
                  </div>
                )}

                {task.status === 'completed' && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tarefa concluída com sucesso!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa ainda</h3>
            <p className="text-gray-600">
              Seu psicólogo irá atribuir tarefas terapêuticas que aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksList;
