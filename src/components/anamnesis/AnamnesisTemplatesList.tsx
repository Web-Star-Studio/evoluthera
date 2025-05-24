
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2, FileText, Calendar, Users } from "lucide-react";
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

interface AnamnesisTemplatesListProps {
  searchTerm: string;
  onEdit: (templateId: string) => void;
  onCreate: () => void;
  showDefaultTemplates?: boolean;
}

const AnamnesisTemplatesList = ({ 
  searchTerm, 
  onEdit, 
  onCreate, 
  showDefaultTemplates = false 
}: AnamnesisTemplatesListProps) => {
  const {
    templates,
    defaultTemplates,
    isLoading,
    deleteTemplate,
    duplicateTemplate,
    createFromDefault,
  } = useAnamnesisTemplates();

  const displayTemplates = showDefaultTemplates ? defaultTemplates : templates;

  const filteredTemplates = displayTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await duplicateTemplate(templateId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCreateFromDefault = async (defaultTemplateId: string) => {
    try {
      await createFromDefault(defaultTemplateId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSectionCount = (sections: any) => {
    if (!sections || !Array.isArray(sections)) return 0;
    return sections.length;
  };

  const getFieldCount = (sections: any) => {
    if (!sections || !Array.isArray(sections)) return 0;
    return sections.reduce((total, section) => {
      return total + (section.fields ? section.fields.length : 0);
    }, 0);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando templates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {showDefaultTemplates ? 'Templates Padrão do Sistema' : 'Meus Templates'}
        </CardTitle>
        <CardDescription>
          {showDefaultTemplates 
            ? `${filteredTemplates.length} templates padrão disponíveis`
            : `${filteredTemplates.length} templates personalizados`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    {!showDefaultTemplates && (
                      <div className="flex gap-1">
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                        {template.is_published && (
                          <Badge variant="default" className="text-xs">
                            Publicado
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{getSectionCount(template.sections)} seções</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{getFieldCount(template.sections)} campos</span>
                    </div>
                    {!showDefaultTemplates && template.created_at && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em {formatDate(template.created_at)}</span>
                      </div>
                    )}
                    {showDefaultTemplates && template.category && (
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {showDefaultTemplates ? (
                      <Button
                        size="sm"
                        onClick={() => handleCreateFromDefault(template.id)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Usar como Base
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(template.id)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicate(template.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
                                onClick={() => handleDelete(template.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>
              {showDefaultTemplates 
                ? "Nenhum template padrão encontrado" 
                : "Nenhum template personalizado encontrado"
              }
            </p>
            {!showDefaultTemplates && (
              <Button onClick={onCreate} className="mt-4">
                Criar primeiro template
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnamnesisTemplatesList;
