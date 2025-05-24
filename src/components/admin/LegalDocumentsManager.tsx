
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Scale, FileText, Shield, Cookie } from "lucide-react";
import DocumentEditor from "./DocumentEditor";
import DocumentPreview from "./DocumentPreview";
import DocumentVersionHistory from "./DocumentVersionHistory";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  content_type: string;
  version: number;
  is_active: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const LegalDocumentsManager = () => {
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('document_type');

      if (error) throw error;
      return data as LegalDocument[];
    }
  });

  const documentTypes = [
    {
      type: 'terms_of_service',
      title: 'Termos de Uso',
      icon: FileText,
      description: 'Condições de uso da plataforma'
    },
    {
      type: 'privacy_policy',
      title: 'Política de Privacidade',
      icon: Shield,
      description: 'Como tratamos dados pessoais'
    },
    {
      type: 'data_consent',
      title: 'Consentimento LGPD',
      icon: Scale,
      description: 'Aviso de consentimento para dados'
    },
    {
      type: 'cookie_policy',
      title: 'Política de Cookies',
      icon: Cookie,
      description: 'Uso de cookies no site'
    }
  ];

  const handleDocumentSelect = (docType: string) => {
    const doc = documents?.find(d => d.document_type === docType);
    setSelectedDocument(doc || null);
    setActiveTab("editor");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos Legais</h1>
          <p className="text-gray-600">Gerencie termos, políticas e avisos legais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Documentos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documentos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentTypes.map((docType) => {
              const doc = documents?.find(d => d.document_type === docType.type);
              const Icon = docType.icon;
              
              return (
                <Card 
                  key={docType.type}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedDocument?.document_type === docType.type ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleDocumentSelect(docType.type)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{docType.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{docType.description}</p>
                      {doc ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-green-700">Versão {doc.version}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Atualizado em {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="text-xs text-gray-500">Não configurado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Editor/Preview */}
        <Card className="lg:col-span-2">
          {selectedDocument ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {documentTypes.find(d => d.type === selectedDocument.document_type)?.title}
                  </CardTitle>
                  <TabsList>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="preview">Prévia</TabsTrigger>
                    <TabsTrigger value="versions">Versões</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="editor">
                  <DocumentEditor 
                    document={selectedDocument} 
                    onSave={() => refetch()}
                  />
                </TabsContent>
                
                <TabsContent value="preview">
                  <DocumentPreview document={selectedDocument} />
                </TabsContent>
                
                <TabsContent value="versions">
                  <DocumentVersionHistory 
                    documentType={selectedDocument.document_type}
                    onRestore={() => refetch()}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Selecione um documento</p>
                <p className="text-sm">Escolha um documento da lista para editar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LegalDocumentsManager;
