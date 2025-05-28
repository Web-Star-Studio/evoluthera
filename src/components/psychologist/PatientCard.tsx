
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Brain,
  Mail,
  MoreVertical,
  Clock,
  Calendar
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
import { PatientCardProps } from "./patient-card/types";
import { getInitials, getActivityStatus } from "./patient-card/utils";
import PatientStats from "./patient-card/PatientStats";
import PatientMoodSection from "./patient-card/PatientMoodSection";
import PatientActionButtons from "./patient-card/PatientActionButtons";
import PatientErrorCard from "./patient-card/PatientErrorCard";

const PatientCard = ({ 
  patient, 
  onResendCredentials,
  onViewRecord 
}: PatientCardProps) => {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);

  // Verificar se os dados do profile existem
  if (!patient.profiles) {
    return <PatientErrorCard patientId={patient.patient_id} />;
  }

  const activityStatus = getActivityStatus(patient.patient_stats?.last_activity || null);

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
          <PatientStats patient={patient} />
          <PatientMoodSection patient={patient} />

          {/* Patient since */}
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Paciente há {formatDistanceToNow(new Date(patient.profiles.created_at), { 
              addSuffix: false, 
              locale: ptBR 
            })}
          </div>

          <PatientActionButtons 
            onAiClick={() => setAiDialogOpen(true)}
            onMoodClick={() => setMoodDialogOpen(true)}
          />
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
