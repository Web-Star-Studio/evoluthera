import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Clock, User, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskResponse {
  id: string;
  response: string;
  response_type: string;
  response_data: any;
  psychologist_comment: string | null;
  commented_at: string | null;
  created_at: string;
  patient_id: string;
  task: {
    id: string;
    title: string;
    description: string;
    task_type: string;
    options: any;
  };
  patient: {
    name: string;
  };
}

interface TaskResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskResponsesModal = ({ isOpen, onClose }: TaskResponsesModalProps) => {
  const [responses, setResponses] = useState<TaskResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<TaskResponse | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('task_responses')
        .select(`
          *,
          task:tasks(id, title, description, task_type, options),
          patient:profiles!task_responses_patient_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResponses();
    }
  }, [isOpen]);

  const handleCommentSubmit = async () => {
    if (!selectedResponse || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('task_responses')
        .update({
          psychologist_comment: comment.trim(),
          commented_at: new Date().toISOString()
        })
        .eq('id', selectedResponse.id);

      if (error) throw error;

      // Criar notificação para o paciente
      await supabase
        .from('task_notifications')
        .insert({
          task_id: selectedResponse.task.id,
          recipient_id: selectedResponse.patient_id,
          type: 'task_commented',
          message: `Seu psicólogo comentou sua resposta para "${selectedResponse.task.title}"`
        });

      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi salvo e o paciente foi notificado.",
      });

      setComment("");
      setSelectedResponse(null);
      fetchResponses();
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro ao enviar comentário",
        description: "Não foi possível salvar o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderResponse = (response: TaskResponse) => {
    if (response.response_type === 'multiple_choice' && response.response_data) {
      return (
        <div>
          <p className="font-medium">Resposta selecionada:</p>
          <Badge variant="outline" className="mt-1">
            {response.response_data.selected_choice}
          </Badge>
          {response.response && (
            <div className="mt-2">
              <p className="font-medium">Comentário adicional:</p>
              <p className="text-gray-700">{response.response}</p>
            </div>
          )}
        </div>
      );
    }

    return <p className="text-gray-700">{response.response}</p>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Respostas de Tarefas
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Respostas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Respostas Recentes</h3>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma resposta disponível</p>
              </div>
            ) : (
              responses.map((response) => (
                <Card 
                  key={response.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedResponse?.id === response.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => setSelectedResponse(response)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {response.task.title}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {response.psychologist_comment ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      {response.patient?.name}
                      <Clock className="h-3 w-3 ml-2" />
                      {formatDate(response.created_at)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {response.response}
                    </p>
                    {response.psychologist_comment && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Comentado
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detalhes da Resposta Selecionada */}
          <div>
            {selectedResponse ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedResponse.task.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {selectedResponse.patient?.name}
                      <Clock className="h-4 w-4 ml-2" />
                      {formatDate(selectedResponse.created_at)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Descrição da Tarefa:</h4>
                      <p className="text-gray-600 text-sm">{selectedResponse.task.description}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Resposta do Paciente:</h4>
                      {renderResponse(selectedResponse)}
                    </div>

                    {selectedResponse.psychologist_comment && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Seu Comentário:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {selectedResponse.psychologist_comment}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Comentado em: {formatDate(selectedResponse.commented_at!)}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Área de Comentário */}
                {!selectedResponse.psychologist_comment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Adicionar Comentário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Escreva seu feedback sobre a resposta do paciente..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setComment("")}
                        >
                          Limpar
                        </Button>
                        <Button
                          onClick={handleCommentSubmit}
                          disabled={!comment.trim() || isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {isSubmitting ? "Enviando..." : "Enviar Comentário"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecione uma resposta para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskResponsesModal;
