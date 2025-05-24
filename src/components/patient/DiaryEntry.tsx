
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

const DiaryEntry = () => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Escreva algo",
        description: "Por favor, escreva suas reflexões antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("diary_entries")
        .insert({
          content: content.trim(),
          patient_id: "temp-user-id", // Substituir por auth.uid() quando autenticação estiver implementada
        });

      if (error) throw error;

      toast({
        title: "Entrada salva!",
        description: "Sua reflexão foi registrada no diário.",
      });

      setContent("");
      // Refresh recent entries
      fetchRecentEntries();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua entrada. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("patient_id", "temp-user-id") // Substituir por auth.uid()
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error) {
      console.error("Erro ao buscar entradas:", error);
    }
  };

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* New Entry Card */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Diário Terapêutico
          </CardTitle>
          <CardDescription>
            Este é um espaço seguro para suas reflexões, sentimentos e pensamentos do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="diary-content" className="text-sm font-medium text-gray-700">
              Como foi seu dia? O que você gostaria de compartilhar?
            </label>
            <Textarea
              id="diary-content"
              placeholder="Escreva livremente sobre seus sentimentos, experiências, conquistas ou desafios do dia..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="text-xs text-gray-500">
              {content.length} caracteres
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? "Salvando..." : "Salvar Entrada"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Entradas Recentes</CardTitle>
            <CardDescription>Suas últimas reflexões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(entry.created_at)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {entry.content.length > 200 
                      ? `${entry.content.substring(0, 200)}...` 
                      : entry.content
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiaryEntry;
