
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Brain,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  Mail,
  MoreVertical,
  Clock,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import AIAssistantDashboard from "@/components/ai/AIAssistantDashboard";
import PatientMoodAnalytics from "./PatientMoodAnalytics";

interface PatientData {
  id: string;
  patient_id: string;
  psychologist_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  } | null;
  patient_stats?: {
    tasks_completed: number;
    streak_days: number;
    mood_records_count: number;
    last_activity: string | null;
    total_points: number;
  };
  mood_analytics?: {
    avg_mood: number;
    total_mood_records: number;
    last_mood_entry: string | null;
    mood_trend: 'up' | 'down' | 'stable';
  };
}

interface PatientCardProps {
  patient: PatientData;
  onResendCredentials?: (patientId: string) => void;
  onViewRecord?: (patientId: string) => void;
}

const PatientCard = ({ 
  patient, 
  onResendCredentials,
  onViewRecord 
}: PatientCardProps) => {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);

  // Verificar se os dados do profile existem
  if (!patient.profiles) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Dados do paciente incompletos
              </h3>
              <p className="text-sm text-gray-600">
                ID: {patient.patient_id}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                O perfil deste paciente não foi encontrado. Entre em contato com o suporte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getMoodColor = (avgMood: number) => {
    if (avgMood >= 4) return "text-green-600 bg-green-50";
    if (avgMood >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getMoodIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityStatus = () => {
    if (!patient.patient_stats?.last_activity) {
      return { text: "Nunca ativo", color: "bg-gray-100 text-gray-600" };
    }

    const lastActivity = new Date(patient.patient_stats.last_activity);
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity === 0) {
      return { text: "Ativo hoje", color: "bg-green-100 text-green-800" };
    }
    if (daysSinceActivity <= 3) {
      return { text: `${daysSinceActivity}d atrás`, color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: `${daysSinceActivity}d atrás`, color: "bg-red-100 text-red-800" };
  };

  const activityStatus = getActivityStatus();
  const avgMood = patient.mood_analytics?.avg_mood || 0;
  const moodRecords = patient.mood_analytics?.total_mood_records || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600">
                <AvatarFallback className="text-white font-semibold">
                  {getInitials(patient.profiles.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 mb-1">
                  {patient.profiles.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-2">{patient.profiles.email}</p>
                <Badge className={`text-xs ${activityStatus.color}`}>
                  {activityStatus.text}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResendCredentials?.(patient.patient_id)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar Credenciais
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewRecord?.(patient.patient_id)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Prontuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tarefas</span>
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <div className="font-semibold text-lg">
                {patient.patient_stats?.tasks_completed || 0}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sequência</span>
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              <div className="font-semibold text-lg">
                {patient.patient_stats?.streak_days || 0} dias
              </div>
            </div>
          </div>

          {/* Mood Section */}
          {moodRecords > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Humor Médio</span>
                {getMoodIcon(patient.mood_analytics?.mood_trend || 'stable')}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-sm font-medium ${getMoodColor(avgMood)}`}>
                  {avgMood.toFixed(1)}/5
                </div>
                <span className="text-xs text-gray-600">
                  {moodRecords} registros
                </span>
              </div>
            </div>
          )}

          {/* Patient since */}
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Paciente há {formatDistanceToNow(new Date(patient.profiles.created_at), { 
              addSuffix: false, 
              locale: ptBR 
            })}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAiDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Brain className="h-3 w-3" />
              IA
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Chat
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMoodDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              Mood
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Assistente de IA - {patient.profiles.name}
            </DialogTitle>
          </DialogHeader>
          <AIAssistantDashboard 
            patientId={patient.profiles.id}
            sessionData={{}}
          />
        </DialogContent>
      </Dialog>

      {/* Mood Analytics Dialog */}
      <Dialog open={moodDialogOpen} onOpenChange={setMoodDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise de Humor - {patient.profiles.name}</DialogTitle>
          </DialogHeader>
          <PatientMoodAnalytics 
            patientId={patient.profiles.id} 
            patientName={patient.profiles.name}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientCard;
