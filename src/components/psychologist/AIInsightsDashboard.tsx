
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AIInsightsDashboard = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile?.id]);

  const loadDashboardData = async () => {
    try {
      const [insightsData, alertsData, documentsData] = await Promise.all([
        // Insights recentes
        supabase
          .from('ai_insights')
          .select(`
            *,
            profiles!ai_insights_patient_id_fkey(name)
          `)
          .eq('psychologist_id', profile?.id)
          .eq('is_reviewed', false)
          .order('created_at', { ascending: false })
          .limit(5),

        // Alertas de crise ativa
        supabase
          .from('crisis_predictions')
          .select(`
            *,
            profiles!crisis_predictions_patient_id_fkey(name)
          `)
          .eq('psychologist_id', profile?.id)
          .eq('is_active', true)
          .in('risk_level', ['alto', 'critico'])
          .order('risk_score', { ascending: false }),

        // Documentos recentes
        supabase
          .from('clinical_documents')
          .select(`
            *,
            profiles!clinical_documents_patient_id_fkey(name)
          `)
          .eq('psychologist_id', profile?.id)
          .eq('ai_generated', true)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setInsights(insightsData.data || []);
      setCrisisAlerts(alertsData.data || []);
      setRecentDocuments(documentsData.data || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markInsightAsReviewed = async (insightId: string) => {
    try {
      await supabase
        .from('ai_insights')
        .update({ 
          is_reviewed: true, 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', insightId);
      
      loadDashboardData();
    } catch (error) {
      console.error('Error marking insight as reviewed:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'alto': 'bg-orange-100 text-orange-800',
      'critico': 'bg-red-100 text-red-800'
    };
    return colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Crise */}
      {crisisAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Alertas de Crise Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crisisAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                  <div>
                    <div className="font-medium">{alert.profiles?.name}</div>
                    <div className="text-sm text-gray-600">
                      Score: {alert.risk_score}/100 • {alert.indicators?.length || 0} indicadores
                    </div>
                  </div>
                  <Badge className={getRiskColor(alert.risk_level)}>
                    {alert.risk_level.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Insights Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Insights Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{insight.profiles?.name}</div>
                      <button
                        onClick={() => markInsightAsReviewed(insight.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Marcar como visto
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 capitalize mb-1">
                      {insight.insight_type.replace('_', ' ')}
                    </div>
                    {insight.confidence_score && (
                      <div className="text-xs text-gray-500">
                        Confiança: {(insight.confidence_score * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum insight pendente</p>
            )}
          </CardContent>
        </Card>

        {/* Documentos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Documentos IA Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-md p-3">
                    <div className="font-medium text-sm truncate">{doc.title}</div>
                    <div className="text-xs text-gray-600 capitalize">{doc.document_type}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {doc.profiles?.name} • {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={doc.compliance_status === 'compliant' ? 'text-green-600' : 'text-yellow-600'}
                    >
                      {doc.compliance_status === 'compliant' ? 'Conforme CFP' : 'Revisar'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum documento recente</p>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Estatísticas IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{insights.length}</div>
                <div className="text-sm text-gray-600">Insights pendentes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{crisisAlerts.length}</div>
                <div className="text-sm text-gray-600">Alertas ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{recentDocuments.length}</div>
                <div className="text-sm text-gray-600">Docs gerados (7 dias)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
