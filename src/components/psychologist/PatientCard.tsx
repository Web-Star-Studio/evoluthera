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
  Calendar,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  onViewRecord,
  onDeletePatient,
  onToggleStatus
}: PatientCardProps) => {
  
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);

  // Verificar se os dados do profile existem
  if (!patient.profiles) {
    return <PatientErrorCard patientId={patient.patient_id} />;
  }

  const activityStatus = getActivityStatus(patient.patient_stats?.last_activity || null);
  const isActive = patient.status === 'active';

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
        isActive 
          ? 'border-l-blue-500' 
          : 'border-l-gray-400 bg-gray-50/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className={`h-12 w-12 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gray-400'
              }`}>
                <AvatarFallback className="text-white font-semibold">
                  {getInitials(patient.profiles.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className={`text-lg ${
                    isActive ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {patient.profiles.name}
                  </CardTitle>
                  <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className={`text-sm mb-2 ${
                  isActive ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  {patient.profiles.email}
                </p>
                {isActive && (
                  <Badge className={`text-xs ${activityStatus.color}`}>
                    {activityStatus.text}
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isActive && (
                  <>
                    <DropdownMenuItem onClick={() => onResendCredentials?.(patient.patient_id)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reenviar Credenciais
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewRecord?.(patient.patient_id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Prontuário
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem 
                  onClick={() => onToggleStatus?.(patient.patient_id)}
                  className={isActive ? "text-orange-600 focus:text-orange-600" : "text-green-600 focus:text-green-600"}
                >
                  {isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Desativar Paciente
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ativar Paciente
                    </>
                  )}
                </DropdownMenuItem>

                {isActive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeletePatient?.(patient.patient_id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Paciente
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isActive ? (
            <>
              <PatientStats patient={patient} />
              <PatientMoodSection patient={patient} />
            </>
          ) : (
            <div className="text-center py-4">
              <UserX className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Paciente inativo - dados limitados
              </p>
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

          {isActive && (
            <PatientActionButtons 
              onMoodClick={() => setMoodDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>


      {/* Mood Analytics Dialog - only for active patients */}
      {isActive && (
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
      )}
    </>
  );
};

export default PatientCard;
