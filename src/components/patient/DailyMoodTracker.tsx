import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Smile, Meh, Frown, Zap, Calendar, Plus } from "lucide-react";
import { incrementMoodRecord } from "@/utils/supabaseRpc";

interface MoodRecord {
  id: string;
  mood_score: number;
  notes: string;
  created_at: string;
}

const DailyMoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [cause, setCause] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientId = "temp-user-id"; // Substituir por auth.uid()

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      setMoodHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de humor:', error);
    }
  };

  const submitMoodRecord = async () => {
    if (selectedMood === null) return;

    setIsSubmitting(true);
    try {
      const moodNotes = `${cause ? `Causa: ${cause}. ` : ''}${notes}`;
      
      const { error } = await supabase
        .from('mood_records')
        .insert({
          patient_id: patientId,
          mood_score: selectedMood,
          notes: moodNotes
        });

      if (error) throw error;

      // Atualizar estatísticas do paciente usando a nova função
      await incrementMoodRecord(patientId);

      // Resetar formulário
      setSelectedMood(null);
      setNotes("");
      setCause("");
      
      // Recarregar histórico
      fetchMoodHistory();
      
      alert('Registro de humor salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      alert('Erro ao salvar registro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { value: 1, label: "Muito Baixo", icon: Frown, color: "bg-red-500", emoji: "😢" },
    { value: 2, label: "Baixo", icon: Frown, color: "bg-orange-500", emoji: "😔" },
    { value: 3, label: "Neutro", icon: Meh, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: "Bom", icon: Smile, color: "bg-green-500", emoji: "😊" },
    { value: 5, label: "Excelente", icon: Zap, color: "bg-emerald-500", emoji: "😄" }
  ];

  const getMoodColor = (score: number) => {
    const mood = moodOptions.find(m => m.value === score);
    return mood?.color || "bg-gray-500";
  };

  const getMoodEmoji = (score: number) => {
    const mood = moodOptions.find(m => m.value === score);
    return mood?.emoji || "😐";
  };

  const getMoodLabel = (score: number) => {
    const mood = moodOptions.find(m => m.value === score);
    return mood?.label || "Neutro";
  };

  return (
    <div className="space-y-6">
      {/* Registro de Humor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Como você está se sentindo hoje?
          </CardTitle>
          <CardDescription>
            Registre seu humor e nos ajude a acompanhar seu bem-estar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Humor */}
          <div>
            <Label className="text-base font-medium">Nível de Humor (1-5)</Label>
            <div className="grid grid-cols-5 gap-3 mt-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedMood === mood.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-medium">{mood.label}</div>
                  <div className="text-xs text-gray-500">({mood.value})</div>
                </button>
              ))}
            </div>
          </div>

          {/* Causa */}
          <div>
            <Label htmlFor="cause">O que pode ter influenciado seu humor?</Label>
            <Input
              id="cause"
              placeholder="Ex: trabalho, família, exercício, sono..."
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações adicionais (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Descreva como você se sente, o que aconteceu hoje, pensamentos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button 
            onClick={submitMoodRecord}
            disabled={selectedMood === null || isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Registrar Humor'}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Histórico dos Últimos Registros
          </CardTitle>
          <CardDescription>
            Veja como seu humor tem evoluído
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moodHistory.length > 0 ? (
            <div className="space-y-3">
              {moodHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getMoodEmoji(record.mood_score)}</div>
                    <div>
                      <div className="font-medium">{getMoodLabel(record.mood_score)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(record.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-500 mt-1 max-w-md truncate">
                          {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getMoodColor(record.mood_score)} text-white`}>
                    {record.mood_score}/5
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum registro de humor ainda</p>
              <p className="text-sm text-gray-400">Comece registrando como você se sente hoje!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMoodTracker;
