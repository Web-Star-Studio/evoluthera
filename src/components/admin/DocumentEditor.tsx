
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, FileText, Code } from "lucide-react";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  content_type: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface DocumentEditorProps {
  document: LegalDocument;
  onSave: () => void;
}

const DocumentEditor = ({ document, onSave }: DocumentEditorProps) => {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [contentType, setContentType] = useState(document.content_type);
  const [changesSummary, setChangesSummary] = useState('');
  const { toast } = useToast();

  const createVersionMutation = useMutation({
    mutationFn: async ({ 
      docType, 
      newTitle, 
      newContent, 
      newContentType, 
      summary 
    }: {
      docType: string;
      newTitle: string;
      newContent: string;
      newContentType: string;
      summary: string;
    }) => {
      const { data, error } = await supabase.rpc('create_document_version', {
        doc_type: docType,
        new_title: newTitle,
        new_content: newContent,
        new_content_type: newContentType,
        changes_summary: summary || 'Alterações gerais no documento'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Nova versão do documento salva com sucesso"
      });
      setChangesSummary('');
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar o documento",
        variant: "destructive"
      });
      console.error('Error saving document:', error);
    }
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createVersionMutation.mutate({
      docType: document.document_type,
      newTitle: title,
      newContent: content,
      newContentType: contentType,
      summary: changesSummary
    });
  };

  const hasChanges = title !== document.title || 
                    content !== document.content || 
                    contentType !== document.content_type;

  return (
    <div className="space-y-6">
      {/* Cabeçalho com informações da versão atual */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Versão Atual: {document.version}</p>
          <p className="text-xs text-gray-600">
            Criado em {new Date(document.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600 capitalize">{document.content_type}</span>
        </div>
      </div>

      {/* Formulário de edição */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Documento</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do documento"
          />
        </div>

        <div>
          <Label htmlFor="content-type">Tipo de Conteúdo</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Markdown
                </div>
              </SelectItem>
              <SelectItem value="html">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML
                </div>
              </SelectItem>
              <SelectItem value="plain_text">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Texto Simples
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Conteúdo do Documento</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              contentType === 'markdown' 
                ? "Digite o conteúdo em Markdown...\n\n# Título\n## Subtítulo\n- Item da lista\n**Texto em negrito**"
                : contentType === 'html'
                ? "Digite o conteúdo em HTML...\n\n<h1>Título</h1>\n<p>Parágrafo</p>"
                : "Digite o conteúdo do documento..."
            }
            rows={20}
            className="font-mono text-sm"
          />
        </div>

        {hasChanges && (
          <div>
            <Label htmlFor="changes-summary">Resumo das Alterações</Label>
            <Textarea
              id="changes-summary"
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              placeholder="Descreva brevemente as alterações feitas nesta versão..."
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Dicas de formatação */}
      {contentType === 'markdown' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Dicas de Markdown:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div><code># Título</code> - Título principal</div>
            <div><code>## Subtítulo</code> - Subtítulo</div>
            <div><code>**negrito**</code> - Texto em negrito</div>
            <div><code>*itálico*</code> - Texto em itálico</div>
            <div><code>- Item</code> - Lista com marcadores</div>
            <div><code>[Link](url)</code> - Link</div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          {hasChanges ? 'Há alterações não salvas' : 'Nenhuma alteração'}
        </div>
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || createVersionMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {createVersionMutation.isPending ? 'Salvando...' : 'Salvar Nova Versão'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentEditor;
