
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Plus, Eye, Send } from "lucide-react";
import { useAnamnesisTemplates } from "@/hooks/useAnamnesisTemplates";
import { AnamnesisTemplate, AnamnesisSection } from "@/types/anamnesis";
import SectionBuilder from "./SectionBuilder";
import AnamnesisPreview from "./AnamnesisPreview";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AnamnesisBuilderProps {
  templateId?: string | null;
  onBack: () => void;
}

const AnamnesisBuilder = ({ templateId, onBack }: AnamnesisBuilderProps) => {
  const { templates, createTemplate, updateTemplate } = useAnamnesisTemplates();
  const [currentTemplate, setCurrentTemplate] = useState<Partial<AnamnesisTemplate>>({
    name: '',
    description: '',
    sections: [],
    is_published: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCurrentTemplate(template);
      }
    }
  }, [templateId, templates]);

  const handleSave = async (publish = false) => {
    setIsLoading(true);
    try {
      const templateData = {
        ...currentTemplate,
        is_published: publish || currentTemplate.is_published,
      };

      if (templateId) {
        await updateTemplate(templateId, templateData);
      } else {
        await createTemplate(templateData);
      }

      if (publish) {
        onBack();
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    const newSection: AnamnesisSection = {
      id: `section_${Date.now()}`,
      title: 'Nova Seção',
      order: (currentTemplate.sections?.length || 0) + 1,
      fields: [],
    };

    setCurrentTemplate(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
  };

  const updateSection = (sectionId: string, updatedSection: AnamnesisSection) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections?.map(section => 
        section.id === sectionId ? updatedSection : section
      ) || [],
    }));
  };

  const deleteSection = (sectionId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections?.filter(section => section.id !== sectionId) || [],
    }));
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (!currentTemplate.sections) return;

    const sections = [...currentTemplate.sections];
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);

    // Atualizar ordem
    sections.forEach((section, index) => {
      section.order = index + 1;
    });

    setCurrentTemplate(prev => ({
      ...prev,
      sections,
    }));
  };

  if (showPreview) {
    return (
      <AnamnesisPreview
        template={currentTemplate as AnamnesisTemplate}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {templateId ? 'Editar Template' : 'Criar Nova Anamnese'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={currentTemplate.is_published ? "default" : "secondary"}>
                {currentTemplate.is_published ? "Publicado" : "Rascunho"}
              </Badge>
              <span className="text-sm text-gray-500">
                {currentTemplate.sections?.length || 0} seções
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPreview(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Prévia
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading || !currentTemplate.name}>
            <Send className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Template</Label>
            <Input
              id="name"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da anamnese..."
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={currentTemplate.description}
              onChange={(e) => setCurrentTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo desta anamnese..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={currentTemplate.is_published}
              onCheckedChange={(checked) => setCurrentTemplate(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="published">Publicar template (disponível para aplicação)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Seções */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seções do Questionário</CardTitle>
            <Button onClick={addSection} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Seção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentTemplate.sections && currentTemplate.sections.length > 0 ? (
            <div className="space-y-6">
              {currentTemplate.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <SectionBuilder
                    key={section.id}
                    section={section}
                    onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
                    onDelete={() => deleteSection(section.id)}
                    onMoveUp={index > 0 ? () => reorderSections(index, index - 1) : undefined}
                    onMoveDown={index < currentTemplate.sections!.length - 1 ? () => reorderSections(index, index + 1) : undefined}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">Nenhuma seção criada ainda</div>
              <div className="text-xs mt-1">Clique em "Adicionar Seção" para começar</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnamnesisBuilder;
