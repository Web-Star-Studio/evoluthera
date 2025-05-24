
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnamnesisTemplates } from "@/hooks/useAnamnesisTemplates";
import { DefaultTemplate } from "@/types/anamnesis";

interface DefaultTemplatesModalProps {
  open: boolean;
  onClose: () => void;
}

const DefaultTemplatesModal = ({ open, onClose }: DefaultTemplatesModalProps) => {
  const { defaultTemplates, createFromDefault } = useAnamnesisTemplates();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUseTemplate = async (template: DefaultTemplate) => {
    setIsLoading(template.id);
    try {
      await createFromDefault(template);
      onClose();
    } catch (error) {
      console.error('Erro ao criar template:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      general: 'Geral',
      anxiety: 'Ansiedade',
      children: 'Crianças e Adolescentes',
      depression: 'Depressão',
      trauma: 'Trauma',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      anxiety: 'bg-orange-100 text-orange-800',
      children: 'bg-green-100 text-green-800',
      depression: 'bg-purple-100 text-purple-800',
      trauma: 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Modelos Padrão de Anamnese</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    {getCategoryLabel(template.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {template.sections?.length || 0} seções
                  </div>
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    disabled={isLoading === template.id}
                    size="sm"
                  >
                    {isLoading === template.id ? 'Criando...' : 'Usar Este Modelo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {defaultTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum modelo padrão disponível</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DefaultTemplatesModal;
