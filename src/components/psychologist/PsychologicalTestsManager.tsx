
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PsychologicalTest {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  questions: {
    instructions: string;
    items: Array<{
      id: string;
      text: string;
      options: Array<{
        value: number;
        label: string;
      }>;
    }>;
  };
}

interface TestApplication {
  id: string;
  patient_id: string;
  psychologist_id: string;
  test_id: string;
  status: string;
  score?: number;
  interpretation?: string;
  responses?: any;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  psychological_tests: PsychologicalTest;
  profiles?: {
    name: string;
    email: string;
  };
}

const PsychologicalTestsManager = () => {
  const [availableTests, setAvailableTests] = useState<PsychologicalTest[]>([]);
  const [applications, setApplications] = useState<TestApplication[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableTests();
    fetchPatients();
    fetchApplications();
  }, []);

  const fetchAvailableTests = async () => {
    try {
      const { data, error } = await supabase
        .from('psychological_tests')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const testsWithParsedQuestions = data?.map(test => ({
        ...test,
        questions: typeof test.questions === 'string' 
          ? JSON.parse(test.questions) 
          : test.questions
      })) || [];

      setAvailableTests(testsWithParsedQuestions);
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar testes disponíveis",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          patient_id,
          profiles!patients_patient_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('test_applications')
        .select(`
          *,
          psychological_tests (
            name,
            code,
            category
          ),
          profiles!test_applications_patient_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const applicationsWithParsedData = data?.map(app => ({
        ...app,
        psychological_tests: {
          ...app.psychological_tests,
          id: app.test_id,
          description: '',
          questions: { instructions: '', items: [] }
        },
        profiles: app.profiles
      })) || [];

      setApplications(applicationsWithParsedData);
    } catch (error) {
      console.error('Erro ao buscar aplicações:', error);
    }
  };

  const assignTest = async () => {
    if (!selectedTest || !selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um teste e um paciente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_applications')
        .insert({
          test_id: selectedTest,
          patient_id: selectedPatient,
          psychologist_id: 'temp-psychologist-id', // Substituir por ID real do psicólogo logado
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Teste atribuído com sucesso",
      });

      setSelectedTest("");
      setSelectedPatient("");
      fetchApplications();
    } catch (error) {
      console.error('Erro ao atribuir teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao atribuir teste",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      in_progress: { label: "Em Andamento", variant: "default" as const, icon: AlertCircle },
      completed: { label: "Concluído", variant: "default" as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerenciamento de Testes Psicológicos
          </CardTitle>
          <CardDescription>
            Atribua e acompanhe testes psicológicos para seus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Teste</label>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um teste" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.name} ({test.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Paciente</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.patient_id} value={patient.patient_id}>
                      {patient.profiles?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={assignTest} 
                disabled={loading || !selectedTest || !selectedPatient}
                className="w-full"
              >
                {loading ? "Atribuindo..." : "Atribuir Teste"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aplicações de Testes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma aplicação de teste encontrada
              </p>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {application.psychological_tests?.name || 'Teste não encontrado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Paciente: {application.profiles?.name || 'Nome não disponível'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Código: {application.psychological_tests?.code || 'N/A'}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  {application.status === 'completed' && application.score !== null && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-green-800">
                        Pontuação: {application.score}
                      </p>
                      {application.interpretation && (
                        <p className="text-sm text-green-700 mt-1">
                          {application.interpretation}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      Criado em: {new Date(application.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {application.completed_at && (
                      <span>
                        Concluído em: {new Date(application.completed_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsychologicalTestsManager;
