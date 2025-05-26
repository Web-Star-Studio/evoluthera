
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientOverview {
  id: string;
  name: string;
  email: string;
  lastMoodScore: number;
  lastActivity: string;
  moodTrend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  avatar_url?: string;
}

interface PatientOverviewCardsProps {
  patients: PatientOverview[];
  onPatientSelect?: (patientId: string) => void;
}

const PatientOverviewCards = ({ patients, onPatientSelect }: PatientOverviewCardsProps) => {
  const getMoodColor = (score: number) => {
    if (score <= 1) return "text-red-600 bg-red-50";
    if (score <= 2) return "text-orange-600 bg-orange-50";
    if (score <= 3) return "text-yellow-600 bg-yellow-50";
    if (score <= 4) return "text-blue-600 bg-blue-50";
    return "text-green-600 bg-green-50";
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  const getMoodIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedPatients.map((patient) => (
        <Card 
          key={patient.id} 
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            patient.riskLevel === 'critical' ? 'border-red-200 bg-red-50/30' :
            patient.riskLevel === 'high' ? 'border-orange-200 bg-orange-50/30' : ''
          }`}
          onClick={() => onPatientSelect?.(patient.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatar_url} />
                  <AvatarFallback className="text-sm">
                    {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-medium">{patient.name}</CardTitle>
                  <p className="text-xs text-gray-500">{patient.email}</p>
                </div>
              </div>
              {patient.riskLevel !== 'low' && (
                <Badge variant={getRiskBadgeVariant(patient.riskLevel)} className="text-xs">
                  {patient.riskLevel === 'critical' ? 'Crítico' :
                   patient.riskLevel === 'high' ? 'Alto' : 'Médio'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Último Humor</span>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getMoodColor(patient.lastMoodScore)}`}>
                    {patient.lastMoodScore}/5
                  </span>
                  {getMoodIcon(patient.moodTrend)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Última Atividade</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(patient.lastActivity), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientOverviewCards;
