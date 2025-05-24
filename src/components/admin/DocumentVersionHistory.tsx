
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { History, RotateCcw, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  title: string;
  content: string;
  content_type: string;
  changes_summary: string;
  created_by: string;
  created_at: string;
}

interface DocumentVersionHistoryProps {
  documentType: string;
  onRestore: () => void;
}

const DocumentVersionHistory = ({ documentType, onRestore }: DocumentVersionHistoryProps) => {
  const { toast } = useToast();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['document-versions', documentType],
    queryFn: async () => {
      // Primeiro buscar o documento ativo
      const { data: activeDoc, error: activeError } = await supabase
        .from('legal_documents')
        .select('id')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .single();

      if (activeError) throw activeError;

      // Depois buscar todas as versões do documento
      const { data: allVersions, error: versionsError } = await supabase
        .from('legal_documents')
        .select(`
          id,
          version,
          title,
          content,
          content_type,
          created_at,
          created_by,
          profiles:created_by(name)
        `)
        .eq('document_type', documentType)
        .order('version', { ascending: false });

      if (versionsError) throw versionsError;

      // Buscar detalhes das versões (incluindo summary)
      const { data: versionDetails, error: detailsError } = await supabase
        .from('legal_document_versions')
        .select('*')
        .in('document_id', allVersions.map(v => v.id))
        .order('version', { ascending: false });

      if (detailsError) throw detailsError;

      // Combinar os dados
      const combinedVersions = allVersions.map(version => {
        const detail = versionDetails.find(d => d.document_id === version.id);
        return {
          ...version,
          changes_summary: detail?.changes_summary || 'Sem resumo de alterações',
          is_current: version.id === activeDoc.id
        };
      });

      return combinedVersions;
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const version = versions?.find(v => v.id === versionId);
      if (!version) throw new Error('Versão não encontrada');

      const { data, error } = await supabase.rpc('create_document_version', {
        doc_type: documentType,
        new_title: version.title,
        new_content: version.content,
        new_content_type: version.content_type,
        changes_summary: `Restaurado da versão ${version.version}`
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Versão restaurada com sucesso"
      });
      onRestore();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao restaurar a versão",
        variant: "destructive"
      });
      console.error('Error restoring version:', error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">Histórico de Versões</h3>
      </div>

      {versions?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Nenhuma versão encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions?.map((version, index) => (
            <Card key={version.id} className={`${version.is_current ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={version.is_current ? 'default' : 'secondary'}>
                        Versão {version.version}
                      </Badge>
                      {version.is_current && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Atual
                        </Badge>
                      )}
                      {index === 0 && !version.is_current && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Mais Recente
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{version.title}</h4>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(version.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                      <div className="capitalize">{version.content_type}</div>
                    </div>
                    
                    {version.changes_summary && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {version.changes_summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Implementar modal de prévia da versão
                        toast({
                          title: "Em desenvolvimento",
                          description: "Prévia de versão será implementada em breve"
                        });
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    {!version.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersionMutation.mutate(version.id)}
                        disabled={restoreVersionMutation.isPending}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p><strong>Importante:</strong> Restaurar uma versão criará uma nova versão atual. 
        As versões antigas são mantidas para histórico.</p>
      </div>
    </div>
  );
};

export default DocumentVersionHistory;
