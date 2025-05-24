
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Eye, Send, Lock, Unlock, Trash2, Copy } from "lucide-react";
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
import AnamnesisEditor from "./AnamnesisEditor";

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

const AnamnesisManager = () => {
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [filteredAnamneses, setFilteredAnamneses] = useState<Anamnesis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnamnesis, setSelectedAnamnesis] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnamneses();
  }, []);

  useEffect(() => {
    filterAnamneses();
  }, [searchTerm, anamneses]);

  const loadAnamneses = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis')
        .select(`
          *,
          patient:profiles!anamnesis_patient_id_fkey(name, email),
          template:anamnesis_templates(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnamneses(data || []);
    } catch (error) {
      console.error('Erro ao carregar anamneses:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as anamneses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnamneses = () => {
    if (!searchTerm) {
      setFilteredAnamneses(anamneses);
      return;
    }

    const filtered = anamneses.filter(anamnesis =>
      anamnesis.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.patient?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAnamneses(filtered);
  };

  const handleStatusChange = async (anamnesisId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'locked') {
        updateData.locked_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('anamnesis')
        .update(updateData)
        .eq('id', anamnesisId);

      if (error) throw error;

      // Criar notificação
      const anamnesis = anamneses.find(a => a.id === anamnesisId);
      if (anamnesis) {
        await supabase
          .from('anamnesis_notifications')
          .insert({
            anamnesis_id: anamnesisId,
            recipient_id: anamnesis.patient ? Object.values(anamnesis.patient)[0] : null,
            type: newStatus,
            message: `Anamnese ${newStatus === 'locked' ? 'bloqueada' : 'finalizada'}`
          });
      }

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: `Anamnese ${newStatus === 'locked' ? 'bloqueada' : 'finalizada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da anamnese",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnamnesis = async (anamnesisId: string) => {
    try {
      const { error } = await supabase
        .from('anamnesis')
        .delete()
        .eq('id', anamnesisId);

      if (error) throw error;

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: "Anamnese deletada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a anamnese",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateAnamnesis = async (anamnesisId: string) => {
    try {
      const { data: originalAnamnesis, error: fetchError } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const { error: insertError } = await supabase
        .from('anamnesis')
        .insert({
          patient_id: originalAnamnesis.patient_id,
          psychologist_id: originalAnamnesis.psychologist_id,
          template_id: originalAnamnesis.template_id,
          data: originalAnamnesis.data,
          status: 'draft'
        });

      if (insertError) throw insertError;

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: "Anamnese duplicada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao duplicar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar a anamnese",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsTemplate = async (anamnesisId: string) => {
    try {
      const { data: anamnesis, error: fetchError } = await supabase
        .from('anamnesis')
        .select(`
          *,
          template:anamnesis_templates(fields)
        `)
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const templateName = `Template baseado em ${new Date().toLocaleDateString('pt-BR')}`;
      
      const { error: insertError } = await supabase
        .from('anamnesis_templates')
        .insert({
          psychologist_id: anamnesis.psychologist_id,
          name: templateName,
          description: 'Template criado a partir de anamnese existente',
          fields: anamnesis.template?.fields || {},
          is_default: false
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Template criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar como template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar como template",
        variant: "destructive",
      });
    }
  };

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

  if (isEditing || selectedAnamnesis) {
    return (
      <div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedAnamnesis(null);
          }}
          variant="outline"
          className="mb-4"
        >
          ← Voltar para Lista
        </Button>
        <AnamnesisEditor
          anamnesisId={selectedAnamnesis || undefined}
          onSave={() => {
            loadAnamneses();
            setIsEditing(false);
            setSelectedAnamnesis(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Anamneses</h2>
          <p className="text-gray-600">Visualize e gerencie todas as anamneses dos pacientes</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Anamnese
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por paciente, email ou template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anamneses</CardTitle>
          <CardDescription>
            {filteredAnamneses.length} anamneses encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredAnamneses.length > 0 ? (
            <div className="space-y-4">
              {filteredAnamneses.map((anamnesis) => (
                <div key={anamnesis.id} className="border rounded-lg p-4">
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
                      onClick={() => setSelectedAnamnesis(anamnesis.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    
                    {anamnesis.status !== 'locked' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnamnesis(anamnesis.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateAnamnesis(anamnesis.id)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveAsTemplate(anamnesis.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Salvar como Template
                    </Button>

                    {anamnesis.status === 'completed' && !anamnesis.locked_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(anamnesis.id, 'locked')}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Bloquear
                      </Button>
                    )}

                    {anamnesis.status === 'locked' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(anamnesis.id, 'completed')}
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
                            onClick={() => handleDeleteAnamnesis(anamnesis.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma anamnese encontrada</p>
              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Criar primeira anamnese
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnamnesisManager;
