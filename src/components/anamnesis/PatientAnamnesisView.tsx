
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface AnamnesisField {
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
}

interface AnamnesisSection {
  title: string;
  fields: Record<string, AnamnesisField>;
}

interface PatientAnamnesisViewProps {
  anamnesisId: string;
}

const PatientAnamnesisView = ({ anamnesisId }: PatientAnamnesisViewProps) => {
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnamnesis();
  }, [anamnesisId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadAnamnesis = async () => {
    try {
      const { data: anamnesisData, error: anamnesisError } = await supabase
        .from('anamnesis')
        .select(`
          *,
          template:anamnesis_templates(*),
          psychologist:profiles!anamnesis_psychologist_id_fkey(name)
        `)
        .eq('id', anamnesisId)
        .single();

      if (anamnesisError) throw anamnesisError;

      setAnamnesis(anamnesisData);
      setTemplate(anamnesisData.template);
      setResponses(anamnesisData.data || {});
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a anamnese",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveResponses = async (complete = false) => {
    setIsSaving(true);
    try {
      const newStatus = complete ? 'completed' : 'in_progress';
      const updateData: any = {
        data: responses,
        status: newStatus,
        ...(complete && { completed_at: new Date().toISOString() })
      };

      const { error } = await supabase
        .from('anamnesis')
        .update(updateData)
        .eq('id', anamnesisId);

      if (error) throw error;

      // Criar versão
      const { error: versionError } = await supabase
        .from('anamnesis_versions')
        .insert({
          anamnesis_id: anamnesisId,
          version: Date.now(), // Usar timestamp como versão temporária
          data: responses,
          status: newStatus,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (versionError) throw versionError;

      // Criar notificação para o psicólogo
      await supabase
        .from('anamnesis_notifications')
        .insert({
          anamnesis_id: anamnesisId,
          recipient_id: anamnesis.psychologist_id,
          type: complete ? 'completed' : 'sent',
          message: complete 
            ? 'Paciente concluiu o preenchimento da anamnese'
            : 'Paciente salvou progresso na anamnese'
        });

      setHasUnsavedChanges(false);
      setAnamnesis(prev => ({ ...prev, status: newStatus }));

      toast({
        title: "Sucesso",
        description: complete 
          ? "Anamnese concluída com sucesso!" 
          : "Progresso salvo com sucesso",
      });

      if (complete) {
        // Recarregar para atualizar o status
        loadAnamnesis();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as respostas",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    if (!template?.fields) return false;

    for (const [sectionKey, section] of Object.entries(template.fields)) {
      for (const [fieldKey, field] of Object.entries(section.fields)) {
        if (field.required && !responses[sectionKey]?.[fieldKey]) {
          return false;
        }
      }
    }
    return true;
  };

  const renderField = (sectionKey: string, fieldKey: string, field: AnamnesisField) => {
    const value = responses[sectionKey]?.[fieldKey] || '';
    const isReadOnly = anamnesis?.status === 'completed' || anamnesis?.status === 'locked';

    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
            disabled={isReadOnly}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
            disabled={isReadOnly}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
            disabled={isReadOnly}
            required={field.required}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(sectionKey, fieldKey, val)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      sent: { 
        label: "Aguardando Preenchimento", 
        variant: "default" as const, 
        icon: Clock,
        description: "Você pode preencher e salvar seu progresso a qualquer momento"
      },
      in_progress: { 
        label: "Em Andamento", 
        variant: "default" as const, 
        icon: AlertCircle,
        description: "Continue preenchendo quando quiser. Seu progresso foi salvo"
      },
      completed: { 
        label: "Concluído", 
        variant: "default" as const, 
        icon: CheckCircle,
        description: "Anamnese concluída. Obrigado pelas informações!"
      },
      locked: { 
        label: "Finalizado", 
        variant: "destructive" as const, 
        icon: CheckCircle,
        description: "Esta anamnese foi finalizada pelo seu psicólogo"
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.sent;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Carregando anamnese...</p>
        </div>
      </div>
    );
  }

  if (!anamnesis || !template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Anamnese não encontrada</h3>
        <p className="text-gray-600">A anamnese solicitada não foi encontrada ou você não tem permissão para acessá-la.</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(anamnesis.status);
  const StatusIcon = statusInfo.icon;
  const isFormValid = validateForm();
  const canEdit = anamnesis.status === 'sent' || anamnesis.status === 'in_progress';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StatusIcon className="h-6 w-6" />
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <CardTitle>Anamnese Psicológica</CardTitle>
          <CardDescription>
            {statusInfo.description}
            <br />
            <span className="text-sm">
              Psicólogo: {anamnesis.psychologist?.name}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {canEdit && hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              <span>Você tem alterações não salvas</span>
              <Button
                size="sm"
                onClick={() => saveResponses()}
                disabled={isSaving}
                className="ml-auto"
              >
                {isSaving ? "Salvando..." : "Salvar Agora"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {template.fields && Object.entries(template.fields).map(([sectionKey, section]) => (
        <Card key={sectionKey}>
          <CardHeader>
            <CardTitle className="text-emerald-700">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(section.fields).map(([fieldKey, field]) => (
              <div key={fieldKey} className="space-y-2">
                <Label htmlFor={`${sectionKey}-${fieldKey}`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(sectionKey, fieldKey, field)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => saveResponses()}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Progresso"}
              </Button>
              <Button
                onClick={() => saveResponses(true)}
                disabled={isSaving || !isFormValid}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSaving ? "Finalizando..." : "Concluir Anamnese"}
              </Button>
            </div>
            {!isFormValid && (
              <p className="text-center text-sm text-red-600 mt-2">
                Por favor, preencha todos os campos obrigatórios para concluir
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientAnamnesisView;
