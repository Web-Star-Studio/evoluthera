
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Save, History } from "lucide-react";

const MOOD_EMOJIS = [
  { value: 1, emoji: "😢", color: "#ef4444", label: "Muito Triste" },
  { value: 2, emoji: "😔", color: "#f97316", label: "Triste" },
  { value: 3, emoji: "😐", color: "#eab308", label: "Neutro" },
  { value: 4, emoji: "😊", color: "#22c55e", label: "Feliz" },
  { value: 5, emoji: "😄", color: "#10b981", label: "Muito Feliz" }
];

const DailyMoodTracker = () => {
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [cause, setCause] = useState("");
  const [observations, setObservations] = useState("");
  const [diaryEntry, setDiaryEntry] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', 'temp-user-id') // Substituir por auth.uid()
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .single();

      if (data && !error) {
        setTodayEntry(data);
        setMoodScore(data.mood_score);
        const notes = JSON.parse(data.notes || '{}');
        setCause(notes.cause || '');
        setObservations(notes.observations || '');
        setDiaryEntry(notes.diary || '');
      }
    } catch (error) {
      console.log('Nenhum registro encontrado para hoje');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erro ao acessar microfone",
        description: "Permita o acesso ao microfone para gravar áudio.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleSave = async () => {
    if (!moodScore) {
      toast({
        title: "Selecione seu humor",
        description: "Por favor, escolha como você está se sentindo hoje.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const notesData = {
        cause: cause.trim(),
        observations: observations.trim(),
        diary: diaryEntry.trim(),
        hasAudio: !!audioBlob
      };

      const moodData = {
        patient_id: 'temp-user-id', // Substituir por auth.uid()
        mood_score: moodScore,
        notes: JSON.stringify(notesData)
      };

      let result;
      if (todayEntry) {
        // Atualizar registro existente
        result = await supabase
          .from('mood_records')
          .update(moodData)
          .eq('id', todayEntry.id);
      } else {
        // Criar novo registro
        result = await supabase
          .from('mood_records')
          .insert(moodData);
      }

      if (result.error) throw result.error;

      // Salvar áudio se houver
      if (audioBlob) {
        const fileName = `diary_audio_${new Date().getTime()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('diary-audio')
          .upload(fileName, audioBlob);

        if (uploadError) {
          console.error('Erro ao salvar áudio:', uploadError);
        }
      }

      // Criar entrada de diário se houver texto
      if (diaryEntry.trim()) {
        await supabase
          .from('diary_entries')
          .insert({
            patient_id: 'temp-user-id', // Substituir por auth.uid()
            content: diaryEntry.trim(),
            mood_score: moodScore
          });
      }

      toast({
        title: "Registro salvo!",
        description: "Seu humor e observações foram registrados com sucesso."
      });

      checkTodayEntry();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu registro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMood = MOOD_EMOJIS.find(m => m.value === moodScore);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedMood && (
            <span style={{ color: selectedMood.color }}>{selectedMood.emoji}</span>
          )}
          Como você está se sentindo hoje?
        </CardTitle>
        <CardDescription>
          Registre seu humor diário e mantenha um acompanhamento de seu bem-estar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Humor */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Escolha seu humor</Label>
          <div className="flex justify-center gap-3">
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setMoodScore(mood.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  moodScore === mood.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-xs text-gray-600">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Causa */}
        <div className="space-y-2">
          <Label htmlFor="cause">O que influenciou seu humor hoje?</Label>
          <Input
            id="cause"
            placeholder="Ex: trabalho, família, exercícios..."
            value={cause}
            onChange={(e) => setCause(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observations">Observações adicionais</Label>
          <Textarea
            id="observations"
            placeholder="Descreva como você se sentiu, o que aconteceu..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Diário de Texto */}
        <div className="space-y-2">
          <Label htmlFor="diary">Diário pessoal (opcional)</Label>
          <Textarea
            id="diary"
            placeholder="Escreva seus pensamentos, reflexões do dia..."
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Gravação de Voz */}
        <div className="space-y-3">
          <Label>Diário de voz (opcional)</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Parar Gravação" : "Gravar Áudio"}
            </Button>
            {audioBlob && (
              <Badge variant="secondary">Áudio gravado</Badge>
            )}
          </div>
        </div>

        {/* Botão Salvar */}
        <Button
          onClick={handleSave}
          disabled={!moodScore || isSaving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : todayEntry ? "Atualizar Registro" : "Salvar Registro"}
        </Button>

        {todayEntry && (
          <div className="text-center text-sm text-green-600">
            ✅ Você já registrou seu humor hoje às {new Date(todayEntry.created_at).toLocaleTimeString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyMoodTracker;
