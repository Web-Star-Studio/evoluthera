
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CrisisPredictorProps {
  patientId: string;
}

const CrisisPredictor = ({ patientId }: CrisisPredictorProps) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activePredictions, setActivePredictions] = useState<any[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadActivePredictions();
  }, [patientId]);

  const loadActivePredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('crisis_predictions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setActivePredictions(data || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const runPrediction = async () => {
    if (!profile?.id) return;

    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('crisis-prediction', {
        body: {
          patientId,
          psychologistId: profile.id
        }
      });

      if (response.error) throw response.error;

      setPrediction(response.data.prediction);
      loadActivePredictions();

      if (response.data.alert) {
        toast({
          title: "⚠️ Alerta de Risco Elevado",
          description: "Intervenção imediata pode ser necessária.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error running prediction:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível executar a predição de crise.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'baixo': 'bg-green-100 text-green-800',
      'medio': 'bg-yellow-100 text-yellow-800',
      'alto': 'bg-orange-100 text-orange-800',
      'critico': 'bg-red-100 text-red-800'
    };
    return colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskIcon = (riskLevel: string) => {
    if (riskLevel === 'critico' || riskLevel === 'alto') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (riskLevel === 'medio') {
      return <TrendingDown className="h-4 w-4" />;
    }
    return <Target className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise Preditiva de Crises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runPrediction} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analisando..." : "Executar Nova Análise"}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado da Análise</span>
              <Badge className={getRiskColor(prediction.risk_level)}>
                {getRiskIcon(prediction.risk_level)}
                <span className="ml-1 capitalize">{prediction.risk_level}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Score de Risco</h4>
                <div className="text-2xl font-bold">{prediction.risk_score}/100</div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Validade</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {new Date(prediction.expires_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {prediction.indicators && prediction.indicators.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Indicadores Identificados</h4>
                <div className="space-y-2">
                  {prediction.indicators.map((indicator: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm capitalize">
                        {indicator.type.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className={getRiskColor(indicator.severity)}>
                        {indicator.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediction.intervention_plan && (
              <div>
                <h4 className="font-medium mb-2">Plano de Intervenção</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <pre className="whitespace-pre-wrap text-sm text-blue-800">
                    {prediction.intervention_plan}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activePredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predições Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePredictions.map((pred) => (
                <div key={pred.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getRiskColor(pred.risk_level)}>
                        {getRiskIcon(pred.risk_level)}
                        <span className="ml-1 capitalize">{pred.risk_level}</span>
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Score: {pred.risk_score}/100
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(pred.created_at).toLocaleDateString('pt-BR')} - 
                      Expira em {new Date(pred.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  {pred.indicators && (
                    <div className="text-sm text-gray-600">
                      {pred.indicators.length} indicador(es)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrisisPredictor;
