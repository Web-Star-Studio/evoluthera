import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Send, Eye, History, Plus, Trash2, Settings } from "lucide-react";
import { AnamnesisField, AnamnesisSection, AnamnesisTemplate, parseJsonField, stringifyForSupabase } from "@/types/anamnesis";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AnamnesisEditorProps {
  patientId?: string;
  anamnesisId?: string;
  onSave?: () => void;
}

const AnamnesisEditor = ({ patientId, anamnesisId, onSave }: AnamnesisEditorProps) => {
  const [templates, setTemplates] = useState<AnamnesisTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [currentSections, setCurrentSections] = useState<AnamnesisSection[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<string>("draft");
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    if (anamnesisId) {
      loadAnamnesis();
      loadVersions();
    }
  }, [anamnesisId]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      const convertedTemplates: AnamnesisTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        sections: parseJsonField<AnamnesisSection[]>(template.sections),
        psychologist_id: template.psychologist_id,
        is_default: template.is_default,
        is_published: template.is_published,
        created_at: template.created_at,
        updated_at: template.updated_at
      }));
      
      setTemplates(convertedTemplates);

      // Selecionar template padrão automaticamente
      const defaultTemplate = convertedTemplates.find(t => t.is_default);
      if (defaultTemplate && !selectedTemplate) {
        setSelectedTemplate(defaultTemplate.id);
        setCurrentSections(defaultTemplate.sections);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates",
        variant: "destructive",
      });
    }
  };

  const loadAnamnesis = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('id', anamnesisId)
        .single();

      if (error) throw error;
      if (data) {
        setResponses(parseJsonField<Record<string, any>>(data.data));
        setStatus(data.status);
        if (data.template_id) {
          setSelectedTemplate(data.template_id);
          const template = templates.find(t => t.id === data.template_id);
          if (template) {
            setCurrentSections(template.sections);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
    }
  };

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis_versions')
        .select(`
          *,
          profiles:created_by(name)
        `)
        .eq('anamnesis_id', anamnesisId)
        .order('version', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCurrentSections(template.sections);
    }
  };

  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value
      }
    }));
  };

  const saveAnamnesis = async (newStatus?: string) => {
    if (!patientId && !anamnesisId) return;

    setIsLoading(true);
    try {
      const anamnesisData = {
        data: stringifyForSupabase(responses),
        status: newStatus || status,
        template_id: selectedTemplate,
        ...(newStatus === 'sent' && { sent_at: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completed_at: new Date().toISOString() }),
      };

      let result;
      if (anamnesisId) {
        // Atualizar anamnese existente
        const { data, error } = await supabase
          .from('anamnesis')
          .update(anamnesisData)
          .eq('id', anamnesisId)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Criar nova versão
        const { error: versionError } = await supabase
          .from('anamnesis_versions')
          .insert({
            anamnesis_id: anamnesisId,
            version: versions.length + 1,
            data: stringifyForSupabase(responses),
            status: newStatus || status,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (versionError) throw versionError;
      } else {
        // Criar nova anamnese
        const { data, error } = await supabase
          .from('anamnesis')
          .insert({
            ...anamnesisData,
            patient_id: patientId,
            psychologist_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      if (newStatus === 'sent') {
        // Criar notificação para o paciente
        await supabase
          .from('anamnesis_notifications')
          .insert({
            anamnesis_id: result.id,
            recipient_id: patientId,
            type: 'sent',
            message: 'Nova anamnese enviada para preenchimento'
          });
      }

      setStatus(newStatus || status);
      toast({
        title: "Sucesso",
        description: newStatus === 'sent' 
          ? "Anamnese enviada para o paciente" 
          : "Anamnese salva com sucesso",
      });

      if (onSave) onSave();
      if (anamnesisId) {
        loadVersions();
      }
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anamnese",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('anamnesis_templates')
        .insert({
          psychologist_id: user.user.id,
          name: newTemplateName,
          description: newTemplateDescription,
          sections: stringifyForSupabase(currentSections),
          is_default: false
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template criado com sucesso",
      });

      setIsTemplateDialogOpen(false);
      setNewTemplateName("");
      setNewTemplateDescription("");
      loadTemplates();
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template",
        variant: "destructive",
      });
    }
  };

  const renderField = (sectionId: string, fieldId: string, field: AnamnesisField) => {
    const value = responses[sectionId]?.[fieldId] || '';
    const isReadOnly = status === 'locked' || (status === 'completed' && Boolean(patientId));

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(sectionId, fieldId, e.target.value)}
            disabled={isReadOnly}
            required={Boolean(field.required)}
            placeholder={field.placeholder}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(sectionId, fieldId, e.target.value)}
            disabled={isReadOnly}
            required={Boolean(field.required)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(sectionId, fieldId, e.target.value)}
            disabled={isReadOnly}
            required={Boolean(field.required)}
            placeholder={field.placeholder}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(sectionId, fieldId, val)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor de Anamnese</h2>
          <p className="text-gray-600">
            {anamnesisId ? "Editando anamnese existente" : "Criando nova anamnese"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(status)}
          <Button
            onClick={() => saveAnamnesis()}
            disabled={isLoading}
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          {status === 'draft' && (
            <Button
              onClick={() => saveAnamnesis('sent')}
              disabled={isLoading || !patientId}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar para Paciente
            </Button>
          )}
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Salvar como Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
                <DialogDescription>
                  Salve os campos atuais como um novo template reutilizável.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input
                    id="templateName"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Digite o nome do template"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Descrição (opcional)</Label>
                  <Textarea
                    id="templateDescription"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Descreva o propósito deste template"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Criar Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
          <TabsTrigger value="versions">Versões</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
              <CardDescription>Selecione o template base para a anamnese</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.is_default && "(Padrão)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {currentSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`${section.id}-${field.id}`}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(section.id, field.id, field)}
                    {field.description && (
                      <p className="text-sm text-gray-500">{field.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Anamnese</CardTitle>
              <CardDescription>Como a anamnese aparecerá para o paciente</CardDescription>
            </CardHeader>
            <CardContent>
              {currentSections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-emerald-700">{section.title}</h3>
                  {section.description && (
                    <p className="text-gray-600 mb-4">{section.description}</p>
                  )}
                  <div className="space-y-4">
                    {section.fields.map((field) => {
                      const response = responses[section.id]?.[field.id];
                      return (
                        <div key={field.id} className="border-l-4 border-emerald-200 pl-4">
                          <p className="font-medium text-gray-700">{field.label}</p>
                          <p className="text-gray-600 mt-1">
                            {response || <span className="italic text-gray-400">Não respondido</span>}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Versões</CardTitle>
              <CardDescription>Timeline de modificações da anamnese</CardDescription>
            </CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Versão {version.version}</Badge>
                          {getStatusBadge(version.status)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(version.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Modificado por: {version.profiles?.name || 'Sistema'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma versão encontrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnamnesisEditor;
