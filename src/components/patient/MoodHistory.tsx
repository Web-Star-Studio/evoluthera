
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";

const MOOD_EMOJIS = [
  { value: 1, emoji: "😢", color: "#ef4444", label: "Muito Triste" },
  { value: 2, emoji: "😔", color: "#f97316", label: "Triste" },
  { value: 3, emoji: "😐", color: "#eab308", label: "Neutro" },
  { value: 4, emoji: "😊", color: "#22c55e", label: "Feliz" },
  { value: 5, emoji: "😄", color: "#10b981", label: "Muito Feliz" }
];

interface MoodRecord {
  id: string;
  mood_score: number;
  notes: string;
  created_at: string;
}

const MoodHistory = () => {
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const recordsPerPage = 7;

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', 'temp-user-id') // Substituir por auth.uid()
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMoodEmoji = (score: number) => {
    return MOOD_EMOJIS.find(m => m.value === score);
  };

  const parseNotes = (notesString: string) => {
    try {
      return JSON.parse(notesString || '{}');
    } catch {
      return { observations: notesString || '' };
    }
  };

  const paginatedRecords = records.slice(
    currentPage * recordsPerPage,
    (currentPage + 1) * recordsPerPage
  );

  const totalPages = Math.ceil(records.length / recordsPerPage);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Carregando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Humor
        </CardTitle>
        <CardDescription>
          Acompanhe a evolução do seu bem-estar ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum registro encontrado</p>
            <p className="text-sm">Comece registrando seu humor diário!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedRecords.map((record) => {
                const mood = getMoodEmoji(record.mood_score);
                const notes = parseNotes(record.notes);
                
                return (
                  <div
                    key={record.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {mood && (
                          <span 
                            className="text-2xl"
                            style={{ color: mood.color }}
                          >
                            {mood.emoji}
                          </span>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{mood?.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {record.mood_score}/5
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(record.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {notes.cause && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Causa:</p>
                        <p className="text-sm text-gray-600">{notes.cause}</p>
                      </div>
                    )}
                    
                    {notes.observations && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Observações:</p>
                        <p className="text-sm text-gray-600">{notes.observations}</p>
                      </div>
                    )}
                    
                    {notes.diary && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Diário:</p>
                        <p className="text-sm text-gray-600 italic">{notes.diary}</p>
                      </div>
                    )}
                    
                    {notes.hasAudio && (
                      <div className="mt-2 flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Áudio gravado</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodHistory;
