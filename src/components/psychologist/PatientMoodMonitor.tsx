
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingDown, Clock, Volume2 } from "lucide-react";

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
  patient_id: string;
}

interface Patient {
  id: string;
  name: string;
}

const PatientMoodMonitor = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patients] = useState<Patient[]>([
    { id: "1", name: "Maria Silva" },
    { id: "2", name: "João Santos" },
    { id: "3", name: "Ana Costa" }
  ]);
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientMoodData(selectedPatient);
      checkMoodAlerts(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatientMoodData = async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(14); // Últimos 14 registros

      if (error) throw error;
      setMoodRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMoodAlerts = async (patientId: string) => {
    try {
      // Buscar registros dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const records = data || [];
      const alertList: any[] = [];

      // Verificar humor consistentemente baixo (3 ou menos)
      const lowMoodDays = records.filter(r => r.mood_score <= 3).length;
      if (lowMoodDays >= 3) {
        alertList.push({
          type: 'low_mood',
          severity: 'high',
          message: `Humor baixo registrado em ${lowMoodDays} dos últimos ${records.length} dias`,
          recommendation: 'Considere agendar uma sessão urgente'
        });
      }

      // Verificar instabilidade (variação grande)
      if (records.length >= 5) {
        const moodScores = records.slice(0, 5).map(r => r.mood_score);
        const maxVariation = Math.max(...moodScores) - Math.min(...moodScores);
        if (maxVariation >= 3) {
          alertList.push({
            type: 'mood_instability',
            severity: 'medium',
            message: 'Variações significativas de humor detectadas nos últimos registros',
            recommendation: 'Monitore padrões e considere ajustes no tratamento'
          });
        }
      }

      // Verificar falta de registros recentes
      const lastRecord = records[0];
      if (!lastRecord || new Date(lastRecord.created_at) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
        alertList.push({
          type: 'no_recent_activity',
          severity: 'medium',
          message: 'Paciente não registrou humor nos últimos 3 dias',
          recommendation: 'Entre em contato para verificar o bem-estar do paciente'
        });
      }

      setAlerts(alertList);
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_mood': return <TrendingDown className="h-4 w-4" />;
      case 'mood_instability': return <AlertTriangle className="h-4 w-4" />;
      case 'no_recent_activity': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Humor dos Pacientes</CardTitle>
          <CardDescription>
            Acompanhe o bem-estar emocional dos seus pacientes em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          {/* Alertas */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas de Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert, index) => (
                  <Alert key={index} variant={getAlertColor(alert.severity) as any}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <AlertDescription className="font-medium">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.recommendation}
                        </p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Registros de Humor */}
          <Card>
            <CardHeader>
              <CardTitle>Registros Recentes de Humor</CardTitle>
              <CardDescription>
                Últimos registros do paciente selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Carregando registros...</div>
              ) : moodRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moodRecords.map((record) => {
                    const mood = getMoodEmoji(record.mood_score);
                    const notes = parseNotes(record.notes);
                    
                    return (
                      <div
                        key={record.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {mood && (
                              <span 
                                className="text-2xl"
                                style={{ color: mood.color }}
                              >
                                {mood.emoji}
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{mood?.label}</span>
                                <Badge variant="outline">
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
                          <div>
                            <p className="text-sm font-medium text-gray-700">Causa:</p>
                            <p className="text-sm text-gray-600">{notes.cause}</p>
                          </div>
                        )}
                        
                        {notes.observations && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Observações:</p>
                            <p className="text-sm text-gray-600">{notes.observations}</p>
                          </div>
                        )}
                        
                        {notes.diary && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Diário:</p>
                            <p className="text-sm text-gray-600 italic">{notes.diary}</p>
                          </div>
                        )}
                        
                        {notes.hasAudio && (
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600">Áudio disponível</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PatientMoodMonitor;
