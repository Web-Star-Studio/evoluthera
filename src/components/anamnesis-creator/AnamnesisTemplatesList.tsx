
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Trash2, Send, Eye } from "lucide-react";
import { useAnamnesisTemplates } from "@/hooks/useAnamnesisTemplates";
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
import ApplyToPatientModal from "./ApplyToPatientModal";
import { useState } from "react";
import { AnamnesisTemplate } from "@/types/anamnesis";

interface AnamnesisTemplatesListProps {
  onEdit: (templateId: string) => void;
  isLoading: boolean;
}

const AnamnesisTemplatesList = ({ onEdit, isLoading }: AnamnesisTemplatesListProps) => {
  const { templates, deleteTemplate, duplicateTemplate } = useAnamnesisTemplates();
  const [applyToPatientTemplate, setApplyToPatientTemplate] = useState<AnamnesisTemplate | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Templates</CardTitle>
          <CardDescription>Você ainda não criou nenhum template de anamnese</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">Comece criando seu primeiro template ou use um modelo padrão</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Meus Templates</CardTitle>
          <CardDescription>{templates.length} templates criados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={template.is_published ? "default" : "secondary"}>
                        {template.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {template.sections?.length || 0} seções
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Criado em {formatDate(template.created_at)}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(template.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApplyToPatientTemplate(template)}
                    disabled={!template.is_published}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Aplicar a Paciente
                  </Button>

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
                          Tem certeza que deseja deletar o template "{template.name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTemplate(template.id)}
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
        </CardContent>
      </Card>

      <ApplyToPatientModal
        template={applyToPatientTemplate}
        open={!!applyToPatientTemplate}
        onClose={() => setApplyToPatientTemplate(null)}
      />
    </>
  );
};

export default AnamnesisTemplatesList;
