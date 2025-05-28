
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PatientCard from "./PatientCard";

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

const EnhancedPatientsList = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      loadPatients();
    }
  }, [profile?.id]);

  const loadPatients = async (showRefreshNotification = false) => {
    try {
      if (showRefreshNotification) setIsRefreshing(true);
      
      // Get patients with their profiles and stats
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          id,
          patient_id,
          psychologist_id,
          status,
          created_at,
          updated_at,
          profiles!patients_patient_id_fkey(
            id,
            name,
            email,
            created_at
          )
        `)
        .eq('psychologist_id', profile?.id)
        .eq('status', 'active');

      if (patientsError) throw patientsError;

      // Get patient stats for each patient
      const patientsWithStats = await Promise.all(
        (patientsData || []).map(async (patient) => {
          // Get patient stats
          const { data: stats } = await supabase
            .from('patient_stats')
            .select('*')
            .eq('patient_id', patient.patient_id)
            .single();

          // Get mood analytics
          const { data: moodData } = await supabase
            .from('mood_records')
            .select('mood_score, created_at')
            .eq('patient_id', patient.patient_id)
            .order('created_at', { ascending: false });

          let mood_analytics = undefined;
          if (moodData && moodData.length > 0) {
            const avgMood = moodData.reduce((sum, record) => sum + record.mood_score, 0) / moodData.length;
            const recent = moodData.slice(0, 5);
            const older = moodData.slice(5, 10);
            
            let mood_trend: 'up' | 'down' | 'stable' = 'stable';
            if (recent.length >= 3 && older.length >= 3) {
              const recentAvg = recent.reduce((sum, r) => sum + r.mood_score, 0) / recent.length;
              const olderAvg = older.reduce((sum, r) => sum + r.mood_score, 0) / older.length;
              
              if (recentAvg > olderAvg + 0.3) mood_trend = 'up';
              else if (recentAvg < olderAvg - 0.3) mood_trend = 'down';
            }

            mood_analytics = {
              avg_mood: avgMood,
              total_mood_records: moodData.length,
              last_mood_entry: moodData[0]?.created_at || null,
              mood_trend
            };
          }

          return {
            ...patient,
            patient_stats: stats || undefined,
            mood_analytics
          };
        })
      );

      setPatients(patientsWithStats);
      
      if (showRefreshNotification) {
        toast({
          title: "Dados atualizados",
          description: `${patientsWithStats.length} paciente(s) carregado(s)`,
        });
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleResendCredentials = async (patientId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // Call resend credentials function
      const res = await fetch(`https://phjpyojetgxfsmqhhjfa.supabase.co/functions/v1/resend-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          patientId,
          tempPassword: `temp${Math.random().toString(36).slice(2, 8)}` // Generate temp password
        }),
      });

      const response = await res.json();
      
      if (!res.ok) {
        throw new Error(response.error || "Erro ao reenviar credenciais.");
      }

      toast({
        title: "Credenciais reenviadas",
        description: response.message,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar credenciais",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewRecord = (patientId: string) => {
    // TODO: Implement view patient record functionality
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A visualização do prontuário será implementada em breve.",
    });
  };

  const handleRefresh = () => {
    loadPatients(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-900">Carregando pacientes...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-medium text-gray-900">
            {patients.length === 0 ? "Nenhum paciente" : `${patients.length} paciente${patients.length > 1 ? 's' : ''}`}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum paciente ativo
            </h3>
            <p className="text-gray-600 mb-4">
              Você ainda não possui pacientes ativos. Adicione um novo paciente para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onResendCredentials={handleResendCredentials}
              onViewRecord={handleViewRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedPatientsList;
