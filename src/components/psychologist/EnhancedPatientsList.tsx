import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, MessageSquare, TrendingUp, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AIAssistantDashboard from "@/components/ai/AIAssistantDashboard";
import PatientMoodAnalytics from "./PatientMoodAnalytics";

const EnhancedPatientsList = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      loadPatients();
    }
  }, [profile?.id]);

  const loadPatients = async () => {
    try {
      let { data: patientsData, error }: { data: any[] | null; error: any } = await supabase
        .from('patients')
        .select(`
          *,
          profiles!patients_patient_id_fkey(id, name, email),
          patient_stats(*)
        `)
        .eq('psychologist_id', profile?.id)
        .eq('status', 'active');

      // Fallback se relation patient_stats não existir
      if (error && error.code === 'PGRST200') {
        ({ data: patientsData, error } = await supabase
          .from('patients')
          .select(`
            *,
            profiles!patients_patient_id_fkey(id, name, email)
          `)
          .eq('psychologist_id', profile?.id)
          .eq('status', 'active'));
      }

      if (error) throw error;

      // @ts-ignore -- supabase types might lack patient_stats in fallback
      setPatients((patientsData as any[]) || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAIAssistant = (patient: any) => {
    setSelectedPatient(patient);
    setAiDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum paciente ativo encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{patient.profiles?.name}</CardTitle>
              <p className="text-sm text-gray-600">{patient.profiles?.email}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.patient_stats && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Atividades:</span>
                    <div className="font-medium">{patient.patient_stats.tasks_completed || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Streak:</span>
                    <div className="font-medium">{patient.patient_stats.streak_days || 0} dias</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAIAssistant(patient)}
                  className="flex items-center gap-1 flex-1"
                >
                  <Brain className="h-3 w-3" />
                  IA
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 flex-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 flex-1"
                    >
                      <TrendingUp className="h-3 w-3" />
                      Mood
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Análise de Humor - {patient.profiles?.name}</DialogTitle>
                    </DialogHeader>
                    <PatientMoodAnalytics 
                      patientId={patient.profiles?.id} 
                      patientName={patient.profiles?.name || 'Paciente'}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Assistente de IA - {selectedPatient?.profiles?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <AIAssistantDashboard 
              patientId={selectedPatient.profiles?.id}
              sessionData={{}}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedPatientsList;
