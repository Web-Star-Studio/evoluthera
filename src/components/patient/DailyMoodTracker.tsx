
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAchievementManager } from "../gamification/AchievementManager";
import { Heart, Volume2, Mic, Square } from "lucide-react";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", color: "#ef4444", label: "Muito Triste" },
  { value: 2, emoji: "😔", color: "#f97316", label: "Triste" },
  { value: 3, emoji: "😐", color: "#eab308", label: "Neutro" },
  { value: 4, emoji: "😊", color: "#22c55e", label: "Feliz" },
  { value: 5, emoji: "😄", color: "#10b981", label: "Muito Feliz" }
];

const DailyMoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [cause, setCause] = useState("");
  const [observations, setObservations] = useState("");
  const [diary, setDiary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  const { toast } = useToast();
  const patientId = "temp-user-id"; // Substituir por auth.uid()
  const { checkAndAwardAchievements, awardPoints, updateStreak } = useAchievementManager(patientId);

  useEffect(() => {
    checkTodayRecord();
  }, []);

  const checkTodayRecord = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTodayRecord(data);
        setSelectedMood(data.mood_score);
        
        const notes = data.notes ? JSON.parse(data.notes) : {};
        setCause(notes.cause || "");
        setObservations(notes.observations || "");
        setDiary(notes.diary || "");
        setHasAudio(notes.hasAudio || false);
      }
    } catch (error) {
      console.error('Erro ao verificar registro de hoje:', error);
    }
  };

  const handleAudioRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simular gravação de áudio
      setTimeout(() => {
        setIsRecording(false);
        setHasAudio(true);
        toast({
          title: "Áudio gravado!",
          description: "Sua reflexão em áudio foi salva com sucesso.",
        });
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Selecione seu humor",
        description: "Por favor, escolha como você está se sentindo hoje.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const notes = {
        cause: cause.trim(),
        observations: observations.trim(),
        diary: diary.trim(),
        hasAudio
      };

      const recordData = {
        patient_id: patientId,
        mood_score: selectedMood,
        notes: JSON.stringify(notes)
      };

      if (todayRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('mood_records')
          .update(recordData)
          .eq('id', todayRecord.id);

        if (error) throw error;

        toast({
          title: "Registro atualizado!",
          description: "Seu humor de hoje foi atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('mood_records')
          .insert(recordData);

        if (error) throw error;

        // Conceder pontos pela primeira vez hoje
        await awardPoints(patientId, 10, "registro de humor");

        // Atualizar streak
        await updateStreak(patientId);

        // Atualizar contador de registros de humor
        await supabase
          .from('patient_stats')
          .update({
            mood_records_count: supabase.sql`mood_records_count + 1`
          })
          .eq('patient_id', patientId);

        // Se escreveu diário, conceder pontos extras e atualizar contador
        if (diary.trim()) {
          await awardPoints(patientId, 5, "entrada no diário");
          await supabase
            .from('patient_stats')
            .update({
              diary_entries_count: supabase.sql`diary_entries_count + 1`
            })
            .eq('patient_id', patientId);
        }

        // Verificar novas conquistas
        setTimeout(() => checkAndAwardAchievements(), 1000);

        toast({
          title: "Registro salvo!",
          description: "Seu humor de hoje foi registrado com sucesso. +10 pontos!",
        });

        setTodayRecord({ ...recordData, id: Date.now() });
      }
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu registro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Como você está se sentindo hoje?
        </CardTitle>
        <CardDescription>
          {todayRecord ? "Atualize seu registro de hoje" : "Registre seu humor e reflexões diárias"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Humor */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Meu humor hoje:</Label>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMood(option.value)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedMood === option.value
                    ? 'border-current bg-current/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  borderColor: selectedMood === option.value ? option.color : undefined,
                  backgroundColor: selectedMood === option.value ? `${option.color}20` : undefined
                }}
              >
                <div className="text-3xl mb-1">{option.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Causa */}
        <div className="space-y-2">
          <Label htmlFor="cause">O que influenciou seu humor? (opcional)</Label>
          <Input
            id="cause"
            placeholder="Ex: trabalho estressante, boa conversa com amigo..."
            value={cause}
            onChange={(e) => setCause(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observations">Observações adicionais (opcional)</Label>
          <Textarea
            id="observations"
            placeholder="Como foi seu dia? O que você sentiu?"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Diário */}
        <div className="space-y-2">
          <Label htmlFor="diary">Diário pessoal (opcional) - Ganhe +5 pontos extra!</Label>
          <Textarea
            id="diary"
            placeholder="Escreva sobre seus pensamentos, sentimentos ou reflexões do dia..."
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Gravação de Áudio */}
        <div className="space-y-2">
          <Label>Reflexão em áudio (opcional)</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleAudioRecording}
              disabled={isSubmitting}
              className={`${isRecording ? 'bg-red-50 border-red-300' : ''}`}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2 text-red-600" />
                  Gravando... (Pare)
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  {hasAudio ? 'Regravar' : 'Gravar reflexão'}
                </>
              )}
            </Button>
            
            {hasAudio && !isRecording && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Volume2 className="h-4 w-4" />
                Áudio gravado
              </div>
            )}
          </div>
        </div>

        {/* Botão de Envio */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? "Salvando..." : todayRecord ? "Atualizar Registro" : "Salvar Registro (+10 pontos)"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyMoodTracker;
