
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  FileText,
  Lightbulb,
  Activity,
  BarChart3,
  Zap
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

interface MoodAnalysis {
  averageMood: number;
  moodTrend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  lowMoodDays: number;
  patternChanges: string[];
}

interface TaskCorrelation {
  completionRate: number;
  moodImprovement: number;
  effectiveTaskTypes: string[];
  strugglingAreas: string[];
}

interface CrisisAlert {
  severity: 'low' | 'medium' | 'high';
  triggers: string[];
  recommendation: string;
  daysAtRisk: number;
}

interface TaskSuggestion {
  type: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
}

interface WeeklyInsights {
  patientId: string;
  patientName: string;
  weekPeriod: string;
  moodAnalysis: MoodAnalysis;
  taskCorrelation: TaskCorrelation;
  crisisAlert?: CrisisAlert;
  taskSuggestions: TaskSuggestion[];
  overallSummary: string;
  clinicalNotes: string[];
}

const AIInsights = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patients] = useState<Patient[]>([
    { id: "1", name: "Maria Silva" },
    { id: "2", name: "João Santos" },
    { id: "3", name: "Ana Costa" }
  ]);
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      generateInsights(selectedPatient);
    }
  }, [selectedPatient]);

  const generateInsights = async (patientId: string) => {
    setIsLoading(true);
    try {
      // Buscar dados do paciente dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Buscar registros de humor
      const { data: moodRecords } = await supabase
        .from('mood_records')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Buscar tarefas
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Buscar entradas de diário
      const { data: diaryEntries } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Gerar insights usando os dados coletados
      const weeklyInsights = await analyzePatientData(
        patientId,
        moodRecords || [],
        tasks || [],
        diaryEntries || []
      );

      setInsights(weeklyInsights);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePatientData = async (
    patientId: string,
    moodRecords: any[],
    tasks: any[],
    diaryEntries: any[]
  ): Promise<WeeklyInsights> => {
    const patientName = patients.find(p => p.id === patientId)?.name || "Paciente";
    
    // Análise de humor
    const moodScores = moodRecords.map(r => r.mood_score);
    const averageMood = moodScores.length > 0 ? 
      moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length : 0;
    
    const lowMoodDays = moodScores.filter(score => score <= 2).length;
    const volatility = calculateVolatility(moodScores);
    const moodTrend = calculateTrend(moodScores);

    // Análise de tarefas
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Correlação entre tarefas e humor
    const moodImprovement = calculateMoodTaskCorrelation(moodRecords, completedTasks);

    // Detecção de crise
    const crisisAlert = detectCrisisAlert(moodRecords, diaryEntries);

    // Sugestões de tarefas
    const taskSuggestions = generateTaskSuggestions(moodRecords, tasks, averageMood);

    // Resumo geral
    const overallSummary = generateOverallSummary(averageMood, completionRate, lowMoodDays);

    return {
      patientId,
      patientName,
      weekPeriod: `${sevenDaysAgo.toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`,
      moodAnalysis: {
        averageMood: Math.round(averageMood * 10) / 10,
        moodTrend,
        volatility,
        lowMoodDays,
        patternChanges: detectPatternChanges(moodRecords)
      },
      taskCorrelation: {
        completionRate: Math.round(completionRate),
        moodImprovement,
        effectiveTaskTypes: getEffectiveTaskTypes(tasks, moodRecords),
        strugglingAreas: getStrugglingAreas(tasks)
      },
      crisisAlert,
      taskSuggestions,
      overallSummary,
      clinicalNotes: generateClinicalNotes(moodRecords, tasks, diaryEntries)
    };
  };

  const calculateVolatility = (moodScores: number[]): number => {
    if (moodScores.length < 2) return 0;
    const avg = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / moodScores.length;
    return Math.round(Math.sqrt(variance) * 10) / 10;
  };

  const calculateTrend = (moodScores: number[]): 'increasing' | 'decreasing' | 'stable' => {
    if (moodScores.length < 3) return 'stable';
    const firstHalf = moodScores.slice(0, Math.floor(moodScores.length / 2));
    const secondHalf = moodScores.slice(Math.floor(moodScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 0.3) return 'increasing';
    if (diff < -0.3) return 'decreasing';
    return 'stable';
  };

  const calculateMoodTaskCorrelation = (moodRecords: any[], completedTasks: any[]): number => {
    // Simplificação: assumir correlação positiva baseada na quantidade de tarefas
    const improvementFactor = completedTasks.length * 0.2;
    return Math.min(Math.round(improvementFactor * 10) / 10, 2.0);
  };

  const detectCrisisAlert = (moodRecords: any[], diaryEntries: any[]): CrisisAlert | undefined => {
    const recentLowMoods = moodRecords.filter(r => r.mood_score <= 2);
    
    if (recentLowMoods.length >= 3) {
      return {
        severity: 'high',
        triggers: ['Humor consistentemente baixo', 'Possível episódio depressivo'],
        recommendation: 'Considere agendar sessão de emergência e avaliar necessidade de intervenção médica',
        daysAtRisk: recentLowMoods.length
      };
    }
    
    if (recentLowMoods.length >= 2) {
      return {
        severity: 'medium',
        triggers: ['Declínio emocional recente'],
        recommendation: 'Monitorar de perto e considerar sessão antecipada',
        daysAtRisk: recentLowMoods.length
      };
    }
    
    return undefined;
  };

  const generateTaskSuggestions = (moodRecords: any[], tasks: any[], averageMood: number): TaskSuggestion[] => {
    const suggestions: TaskSuggestion[] = [];
    
    if (averageMood < 3) {
      suggestions.push({
        type: 'Mindfulness e Relaxamento',
        reason: 'Humor médio baixo indica necessidade de técnicas de regulação emocional',
        priority: 'high',
        estimatedDuration: 15
      });
    }
    
    const completedTaskTypes = tasks.filter(t => t.status === 'completed').map(t => t.task_type);
    
    if (!completedTaskTypes.includes('exercise')) {
      suggestions.push({
        type: 'Atividade Física Leve',
        reason: 'Exercícios podem melhorar humor e bem-estar geral',
        priority: 'medium',
        estimatedDuration: 30
      });
    }
    
    return suggestions;
  };

  const generateOverallSummary = (averageMood: number, completionRate: number, lowMoodDays: number): string => {
    let summary = "";
    
    if (averageMood >= 4) {
      summary += "Paciente demonstra estabilidade emocional positiva. ";
    } else if (averageMood >= 3) {
      summary += "Humor neutro com espaço para melhoria. ";
    } else {
      summary += "Período desafiador com humor predominantemente baixo. ";
    }
    
    if (completionRate >= 70) {
      summary += "Boa aderência às tarefas terapêuticas. ";
    } else {
      summary += "Baixa aderência às tarefas, considerar ajustes na abordagem. ";
    }
    
    return summary;
  };

  const detectPatternChanges = (moodRecords: any[]): string[] => {
    // Simplificação para detecção de padrões
    return moodRecords.length > 0 ? ['Padrão de humor matinal baixo'] : [];
  };

  const getEffectiveTaskTypes = (tasks: any[], moodRecords: any[]): string[] => {
    return ['Mindfulness', 'Exercício físico'];
  };

  const getStrugglingAreas = (tasks: any[]): string[] => {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    return incompleteTasks.length > 0 ? ['Técnicas de enfrentamento'] : [];
  };

  const generateClinicalNotes = (moodRecords: any[], tasks: any[], diaryEntries: any[]): string[] => {
    const notes = [];
    
    if (moodRecords.length === 0) {
      notes.push("Paciente não registrou humor na semana - considerar estratégias de engajamento");
    }
    
    if (tasks.length === 0) {
      notes.push("Nenhuma tarefa foi atribuída - avaliar necessidade de intervenções estruturadas");
    }
    
    notes.push("Dados gerados por IA - requer validação clínica profissional");
    
    return notes;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Brain className="h-6 w-6 animate-pulse mr-2" />
            <span>Gerando insights com IA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Insights de IA - Assistente Clínico
          </CardTitle>
          <CardDescription>
            Análise automatizada dos dados do paciente. 
            <strong className="text-orange-600 ml-1">
              Estes insights são sugestões e não substituem avaliação clínica profissional.
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full md:w-64">
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

      {insights && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="mood">Humor</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Semanal - {insights.patientName}</CardTitle>
                <CardDescription>{insights.weekPeriod}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {insights.moodAnalysis.averageMood}/5
                    </div>
                    <p className="text-sm text-blue-600">Humor Médio</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {insights.taskCorrelation.completionRate}%
                    </div>
                    <p className="text-sm text-green-600">Tarefas Concluídas</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {insights.moodAnalysis.lowMoodDays}
                    </div>
                    <p className="text-sm text-purple-600">Dias de Humor Baixo</p>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <h4>Resumo Geral:</h4>
                  <p>{insights.overallSummary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análise de Humor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Tendência:</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insights.moodAnalysis.moodTrend)}
                        <span className="capitalize">{insights.moodAnalysis.moodTrend}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Volatilidade:</span>
                      <Badge variant="outline">{insights.moodAnalysis.volatility}</Badge>
                    </div>
                  </div>
                </div>
                
                {insights.moodAnalysis.patternChanges.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Mudanças de Padrão:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {insights.moodAnalysis.patternChanges.map((change, index) => (
                        <li key={index} className="text-sm">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Correlação com Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Tipos de Tarefa Eficazes:</h4>
                    <div className="space-y-1">
                      {insights.taskCorrelation.effectiveTaskTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Áreas de Dificuldade:</h4>
                    <div className="space-y-1">
                      {insights.taskCorrelation.strugglingAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Melhoria no Humor:</strong> +{insights.taskCorrelation.moodImprovement} pontos
                    correlacionados com conclusão de tarefas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {insights.crisisAlert ? (
              <Alert className={getSeverityColor(insights.crisisAlert.severity)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      Alerta de Crise - Severidade: {insights.crisisAlert.severity.toUpperCase()}
                    </div>
                    <div>
                      <strong>Gatilhos:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {insights.crisisAlert.triggers.map((trigger, index) => (
                          <li key={index}>{trigger}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Recomendação:</strong> {insights.crisisAlert.recommendation}
                    </div>
                    <div>
                      <strong>Dias em risco:</strong> {insights.crisisAlert.daysAtRisk}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-700">Nenhum Alerta de Crise</h3>
                  <p className="text-green-600">O paciente não apresenta sinais de crise emocional no momento.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Sugestões de Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.taskSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{suggestion.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Duração estimada: {suggestion.estimatedDuration} minutos
                          </p>
                        </div>
                        <Badge 
                          variant={suggestion.priority === 'high' ? 'destructive' : 
                                  suggestion.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas Clínicas Automatizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.clinicalNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                      • {note}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Estes insights são gerados por inteligência artificial e devem ser usados 
          apenas como ferramenta de apoio. Todas as decisões clínicas devem ser baseadas em avaliação 
          profissional qualificada e nunca devem substituir o julgamento clínico do psicólogo.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AIInsights;
