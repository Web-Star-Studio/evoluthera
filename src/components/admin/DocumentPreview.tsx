
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { useState } from "react";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  content_type: string;
  version: number;
  published_at: string;
}

interface DocumentPreviewProps {
  document: LegalDocument;
}

const DocumentPreview = ({ document }: DocumentPreviewProps) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const renderContent = () => {
    if (document.content_type === 'markdown') {
      // Conversão básica de Markdown para HTML
      let html = document.content
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2">$1</h3>')
        .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/^(?!<[h|l|p])/gm, '<p class="mb-4">')
        .replace(/(<li.*?>.*?<\/li>)/gs, '<ul class="list-disc mb-4">$1</ul>');

      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else if (document.content_type === 'html') {
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      );
    } else {
      return (
        <div className="whitespace-pre-wrap font-sans leading-relaxed">
          {document.content}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de prévia */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Prévia do Documento</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            Desktop
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            Mobile
          </Button>
        </div>
      </div>

      {/* Informações do documento */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
        <div>
          <span className="font-medium text-gray-600">Versão:</span>
          <p className="text-gray-900">{document.version}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Tipo:</span>
          <p className="text-gray-900 capitalize">{document.content_type}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Publicado:</span>
          <p className="text-gray-900">
            {document.published_at 
              ? new Date(document.published_at).toLocaleDateString('pt-BR')
              : 'Não publicado'
            }
          </p>
        </div>
      </div>

      {/* Prévia simulada */}
      <Card className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'} transition-all duration-300`}>
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {document.title}
            </CardTitle>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className={`${previewMode === 'mobile' ? 'text-sm' : 'text-base'} leading-relaxed`}>
            {renderContent()}
          </div>
        </CardContent>
      </Card>

      {/* Rodapé simulado */}
      <div className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'} p-4 bg-gray-100 border-t text-center text-xs text-gray-600`}>
        <p>© 2024 Evoluthera - Todos os direitos reservados</p>
        <p>Versão {document.version} - Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      {/* Dica sobre responsividade */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p><strong>Dica:</strong> Esta é uma prévia de como o documento será exibido para os usuários. 
        Use os botões Desktop/Mobile para ver como ficará em diferentes dispositivos.</p>
      </div>
    </div>
  );
};

export default DocumentPreview;
