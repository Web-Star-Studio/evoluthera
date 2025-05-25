
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentationAssistantProps {
  patientId: string;
  sessionData?: any;
}

const DocumentationAssistant = ({ patientId, sessionData }: DocumentationAssistantProps) => {
  const [documentType, setDocumentType] = useState<string>("sessao");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [compliance, setCompliance] = useState<any>(null);
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const documentTypes = [
    { value: "sessao", label: "Relatório de Sessão" },
    { value: "progresso", label: "Relatório de Progresso" },
    { value: "laudo", label: "Laudo Psicológico" },
    { value: "parecer", label: "Parecer Técnico" },
    { value: "relatorio", label: "Relatório Clínico" }
  ];

  const generateDocument = async () => {
    if (!profile?.id) return;

    setIsGenerating(true);
    try {
      // Buscar dados do paciente para contexto
      const contextData = await fetchPatientContext();

      const response = await supabase.functions.invoke('document-generator', {
        body: {
          sessionData: { ...sessionData, ...contextData },
          patientId,
          documentType,
          customPrompt: customPrompt || undefined
        }
      });

      if (response.error) throw response.error;

      setGeneratedContent(response.data.content);
      setCompliance(response.data.compliance);
      
      toast({
        title: "Documento gerado com sucesso!",
        description: `Conformidade CFP: ${response.data.compliance.score.toFixed(1)}%`
      });

    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Erro ao gerar documento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchPatientContext = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [moodData, diaryData, tasksData] = await Promise.all([
      supabase
        .from('mood_records')
        .select('mood_score, created_at, notes')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('diary_entries')
        .select('content, mood_score, created_at')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('tasks')
        .select('title, status, completed_at, created_at')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
    ]);

    return {
      moodRecords: moodData.data || [],
      diaryEntries: diaryData.data || [],
      tasksCompleted: tasksData.data || []
    };
  };

  const saveDocument = async () => {
    if (!profile?.id || !generatedContent || !title) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o título e gere o conteúdo antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clinical_documents')
        .insert({
          psychologist_id: profile.id,
          patient_id: patientId,
          document_type: documentType,
          title,
          content: generatedContent,
          ai_generated: true,
          compliance_status: compliance?.status || 'pending',
          metadata: {
            compliance_score: compliance?.score,
            word_count: generatedContent.split(' ').length,
            generated_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Documento salvo!",
        description: "O documento foi salvo com sucesso na base clínica."
      });

      // Limpar formulário
      setGeneratedContent("");
      setTitle("");
      setCompliance(null);

    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o documento.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assistente de Documentação Clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Documento
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Título do Documento
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ex: Relatório de Sessão - 15/01/2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Prompt Personalizado (Opcional)
            </label>
            <Textarea
              placeholder="Adicione instruções específicas para personalizar o documento..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateDocument} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando documento...
              </>
            ) : (
              "Gerar Documento"
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Documento Gerado</span>
              {compliance && (
                <div className="flex items-center gap-2">
                  {compliance.status === 'compliant' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm">
                    CFP: {compliance.score.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>

            {compliance && compliance.status === 'needs_review' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Revisão Necessária
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {compliance.details
                    .filter((detail: any) => !detail.passed)
                    .map((detail: any, index: number) => (
                      <li key={index}>• {detail.rule}</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveDocument} disabled={!title}>
                Salvar na Base Clínica
              </Button>
              <Button variant="outline" onClick={() => setGeneratedContent("")}>
                Gerar Novo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentationAssistant;
