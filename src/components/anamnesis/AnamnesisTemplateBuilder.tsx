
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnamnesisField, AnamnesisSection, stringifyForSupabase } from "@/types/anamnesis";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AnamnesisTemplateBuilderProps {
  templateId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const fieldTypes = [
  { value: 'text', label: 'Texto Simples' },
  { value: 'textarea', label: 'Texto Longo' },
  { value: 'select', label: 'Lista Suspensa' },
  { value: 'radio', label: 'Múltipla Escolha' },
  { value: 'checkbox', label: 'Caixas de Seleção' },
  { value: 'date', label: 'Data' },
  { value: 'number', label: 'Número' },
  { value: 'scale', label: 'Escala (1-5)' },
];

const AnamnesisTemplateBuilder = ({ templateId, onSave, onCancel }: AnamnesisTemplateBuilderProps) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [sections, setSections] = useState<AnamnesisSection[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const addSection = () => {
    const newSection: AnamnesisSection = {
      id: `section_${Date.now()}`,
      title: "Nova Seção",
      description: "",
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<AnamnesisSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addField = (sectionId: string) => {
    const newField: AnamnesisField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: "Novo Campo",
      required: false,
      placeholder: ""
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<AnamnesisField>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            )
          }
        : section
    ));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const templateData = {
        psychologist_id: user.user.id,
        name: templateName,
        description: templateDescription,
        sections: stringifyForSupabase(sections),
        is_default: false,
        is_published: false
      };

      if (templateId) {
        const { error } = await supabase
          .from('anamnesis_templates')
          .update(templateData)
          .eq('id', templateId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('anamnesis_templates')
          .insert(templateData);
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: templateId ? "Template atualizado com sucesso" : "Template criado com sucesso",
      });

      if (onSave) onSave();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderFieldEditor = (sectionId: string, field: AnamnesisField) => (
    <Card key={field.id} className="p-4 border-l-4 border-l-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteField(sectionId, field.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${field.id}-label`}>Rótulo do Campo</Label>
          <Input
            id={`${field.id}-label`}
            value={field.label}
            onChange={(e) => updateField(sectionId, field.id, { label: e.target.value })}
            placeholder="Digite o rótulo"
          />
        </div>
        <div>
          <Label htmlFor={`${field.id}-type`}>Tipo do Campo</Label>
          <Select
            value={field.type}
            onValueChange={(value: AnamnesisField['type']) => 
              updateField(sectionId, field.id, { type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor={`${field.id}-placeholder`}>Placeholder/Ajuda</Label>
        <Input
          id={`${field.id}-placeholder`}
          value={field.placeholder || ''}
          onChange={(e) => updateField(sectionId, field.id, { placeholder: e.target.value })}
          placeholder="Texto de ajuda para o campo"
        />
      </div>

      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
        <div className="mt-3">
          <Label>Opções (uma por linha)</Label>
          <Textarea
            value={(field.options || []).join('\n')}
            onChange={(e) => updateField(sectionId, field.id, { 
              options: e.target.value.split('\n').filter(opt => opt.trim()) 
            })}
            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            rows={3}
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          type="checkbox"
          id={`${field.id}-required`}
          checked={field.required}
          onChange={(e) => updateField(sectionId, field.id, { required: e.target.checked })}
        />
        <Label htmlFor={`${field.id}-required`}>Campo obrigatório</Label>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {templateId ? 'Editar Template' : 'Criar Novo Template'}
          </h2>
          <p className="text-gray-600">
            Configure campos e seções para sua anamnese personalizada
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview do Template</DialogTitle>
                <DialogDescription>
                  Como a anamnese aparecerá para o paciente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {sections.map(section => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    {section.description && (
                      <p className="text-gray-600 mb-4">{section.description}</p>
                    )}
                    <div className="space-y-4">
                      {section.fields.map(field => (
                        <div key={field.id}>
                          <Label className="flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          {field.type === 'text' && (
                            <Input placeholder={field.placeholder} disabled />
                          )}
                          {field.type === 'textarea' && (
                            <Textarea placeholder={field.placeholder} disabled rows={3} />
                          )}
                          {field.type === 'select' && (
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
                              </SelectTrigger>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={saveTemplate} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Template'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-name">Nome do Template</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Anamnese Inicial Adultos"
            />
          </div>
          <div>
            <Label htmlFor="template-description">Descrição (opcional)</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Descreva o propósito e uso deste template"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-semibold text-lg border-none p-0 h-auto"
                    placeholder="Título da Seção"
                  />
                  <Textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    placeholder="Descrição da seção (opcional)"
                    className="mt-2 border-none p-0 resize-none"
                    rows={1}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map(field => renderFieldEditor(section.id, field))}
              
              <Button
                variant="outline"
                onClick={() => addField(section.id)}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campo
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addSection}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Seção
        </Button>
      </div>
    </div>
  );
};

export default AnamnesisTemplateBuilder;
