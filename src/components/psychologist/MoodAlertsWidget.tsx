
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MoodAlert {
  id: string;
  patientId: string;
  patientName: string;
  moodScore: number;
  severity: 'low' | 'critical';
  timestamp: string;
  notes?: string;
}

interface MoodAlertsWidgetProps {
  alerts: MoodAlert[];
  onContactPatient?: (patientId: string) => void;
}

const MoodAlertsWidget = ({ alerts, onContactPatient }: MoodAlertsWidgetProps) => {
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? 
      <AlertTriangle className="h-4 w-4 text-red-600" /> :
      <AlertTriangle className="h-4 w-4 text-orange-600" />;
  };

  const getSeverityBadge = (severity: string) => {
    return severity === 'critical' ? 
      <Badge variant="destructive" className="text-xs">Crítico</Badge> :
      <Badge variant="secondary" className="text-xs">Baixo</Badge>;
  };

  const getMoodScoreColor = (score: number) => {
    if (score <= 1) return "text-red-600 bg-red-100";
    return "text-orange-600 bg-orange-100";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertas de Humor
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum alerta de humor no momento</p>
            <p className="text-sm">Todos os pacientes estão com humor estável</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-medium text-sm">{alert.patientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getMoodScoreColor(alert.moodScore)}`}>
                          Humor: {alert.moodScore}/5
                        </span>
                        {getSeverityBadge(alert.severity)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onContactPatient?.(alert.patientId)}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Contatar
                  </Button>
                </div>
                
                {alert.notes && (
                  <p className="text-sm text-gray-700 mb-2 italic">
                    "{alert.notes}"
                  </p>
                )}
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(alert.timestamp), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodAlertsWidget;
