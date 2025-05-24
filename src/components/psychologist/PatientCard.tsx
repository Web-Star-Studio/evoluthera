
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AlertTriangle, FileText, ClipboardList, TrendingDown } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastSession?: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  pendingTasks: number;
  alertLevel: 'none' | 'low' | 'high';
}

interface PatientCardProps {
  patient: Patient;
  onStatusChange: (patientId: string, newStatus: 'active' | 'inactive') => void;
  onViewRecord: (patientId: string) => void;
  onSendTask: (patientId: string) => void;
  onViewMoodChart: (patientId: string) => void;
}

const PatientCard = ({ 
  patient, 
  onStatusChange, 
  onViewRecord, 
  onSendTask,
  onViewMoodChart 
}: PatientCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async () => {
    setIsLoading(true);
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    await onStatusChange(patient.id, newStatus);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  const getMoodTrendIcon = (trend: string) => {
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card className="relative">
      {patient.alertLevel === 'high' && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-emerald-100">
              <span className="text-emerald-600 font-semibold">
                {patient.name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <p className="text-sm text-gray-600">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getMoodTrendIcon(patient.moodTrend)}
            <Badge className={getStatusColor(patient.status)}>
              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {patient.lastSession && (
            <p className="text-sm text-gray-600">
              Última sessão: {patient.lastSession}
            </p>
          )}
          
          {patient.pendingTasks > 0 && (
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">
                {patient.pendingTasks} tarefa(s) pendente(s)
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewRecord(patient.id)}
              className="flex items-center space-x-1"
            >
              <FileText className="h-3 w-3" />
              <span>Prontuário</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendTask(patient.id)}
              className="flex items-center space-x-1"
            >
              <ClipboardList className="h-3 w-3" />
              <span>Nova Tarefa</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewMoodChart(patient.id)}
            >
              Gráfico Humor
            </Button>
            
            <Button
              size="sm"
              variant={patient.status === 'active' ? 'destructive' : 'default'}
              onClick={handleStatusChange}
              disabled={isLoading}
            >
              {patient.status === 'active' ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
