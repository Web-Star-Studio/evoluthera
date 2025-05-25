
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SessionRecorderProps {
  patientId: string;
  onAnalysisComplete?: (analysis: any) => void;
}

const SessionRecorder = ({ patientId, onAnalysisComplete }: SessionRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Gravação iniciada",
        description: "A sessão está sendo gravada."
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro na gravação",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Gravação finalizada",
        description: "Agora você pode reproduzir ou processar a gravação."
      });
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const processRecording = async () => {
    if (!audioBlob || !profile?.id) return;

    setIsProcessing(true);
    try {
      // Primeiro, fazer upload do áudio (simulado - em produção seria para storage)
      const audioData = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));

      // Salvar gravação no banco
      const { data: sessionRecord, error: saveError } = await supabase
        .from('session_recordings')
        .insert({
          psychologist_id: profile.id,
          patient_id: patientId,
          audio_url: `data:audio/wav;base64,${base64Audio.substring(0, 100)}...`, // URL simplificada
          status: 'processing'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Simular transcrição (em produção usaria Whisper API)
      const mockTranscript = `Transcrição simulada da sessão:
      
      Paciente: Olá, doutor. Como está?
      Psicólogo: Olá! Estou bem, obrigado. Como você tem se sentido desde nossa última conversa?
      Paciente: Tenho me sentido um pouco melhor. As técnicas que discutimos têm me ajudado.
      Psicólogo: Que bom saber! Pode me contar mais sobre quais técnicas têm funcionado melhor?
      Paciente: A respiração profunda tem sido muito útil quando sinto ansiedade...`;

      // Analisar transcrição
      const response = await supabase.functions.invoke('session-analysis', {
        body: {
          transcript: mockTranscript,
          sessionId: sessionRecord.id,
          psychologistId: profile.id
        }
      });

      if (response.error) throw response.error;

      // Atualizar registro com transcrição e análise
      await supabase
        .from('session_recordings')
        .update({
          transcript: mockTranscript,
          analysis: response.data.analysis,
          sentiment_score: response.data.sentiment_score,
          status: 'completed'
        })
        .eq('id', sessionRecord.id);

      setTranscript(mockTranscript);
      setAnalysis(response.data.analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }

      toast({
        title: "Processamento concluído",
        description: "A análise da sessão foi concluída com sucesso."
      });

    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a gravação.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Gravador de Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Iniciar Gravação
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Parar Gravação
              </Button>
            )}

            {audioUrl && (
              <Button 
                onClick={playAudio} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pausar" : "Reproduzir"}
              </Button>
            )}

            {audioBlob && !isProcessing && (
              <Button 
                onClick={processRecording} 
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Processar e Analisar
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Gravando...</span>
            </div>
          )}

          {audioUrl && (
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {isProcessing && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Processando gravação...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{transcript}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise da Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.sentiment && (
              <div>
                <h4 className="font-medium mb-2">Análise de Sentimentos</h4>
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span>Score: {analysis.sentiment.score}/10</span>
                    <span className="capitalize">{analysis.sentiment.dominant_emotion}</span>
                  </div>
                </div>
              </div>
            )}

            {analysis.insights && (
              <div>
                <h4 className="font-medium mb-2">Insights Principais</h4>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm">{analysis.insights.summary}</p>
                </div>
              </div>
            )}

            {analysis.interventions && analysis.interventions.immediate_interventions && (
              <div>
                <h4 className="font-medium mb-2">Sugestões de Intervenção</h4>
                <ul className="text-sm space-y-1">
                  {analysis.interventions.immediate_interventions.map((intervention: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{intervention}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionRecorder;
