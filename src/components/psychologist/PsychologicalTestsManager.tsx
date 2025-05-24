
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send, BarChart3, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface PsychologicalTest {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
}

interface TestApplication {
  id: string;
  test_id: string;
  patient_id: string;
  status: string;
  score: number;
  interpretation: string;
  completed_at: string;
  psychological_tests: PsychologicalTest; // Corrigido para aceitar o tipo correto
  profiles: { name: string };
}

const PsychologicalTestsManager = () => {
  const [tests, setTests] = useState<PsychologicalTest[]>([]);
  const [applications, setApplications] = useState<TestApplication[]>([]);
  const [patients] = useState([
    { id: "patient-1", name: "Maria Silva" },
    { id: "patient-2", name: "João Pereira" },
    { id: "patient-3", name: "Ana Souza" }
  ]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const psychologistId = "temp-psychologist-id"; // Substituir por auth.uid()

  useEffect(() => {
    fetchTests();
    fetchApplications();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('psychological_tests')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('test_applications')
        .select(`
          *,
          psychological_tests(id, name, code, category, description),
          profiles(name)
        `)
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Converter os dados para o formato esperado, garantindo que todos os campos necessários existam
      const formattedApplications = (data || []).map(app => ({
        ...app,
        psychological_tests: {
          id: app.psychological_tests?.id || '',
          name: app.psychological_tests?.name || '',
          code: app.psychological_tests?.code || '',
          category: app.psychological_tests?.category || '',
          description: app.psychological_tests?.description || ''
        },
        profiles: {
          name: app.profiles?.name || 'Nome não disponível'
        }
      }));
      
      setApplications(formattedApplications);
    } catch (error) {
      console.error('Erro ao buscar aplicações:', error);
    }
  };

  const assignTest = async () => {
    if (!selectedTest || !selectedPatient) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('test_applications')
        .insert({
          test_id: selectedTest,
          patient_id: selectedPatient,
          psychologist_id: psychologistId,
          status: 'pending'
        });

      if (error) throw error;

      setSelectedTest("");
      setSelectedPatient("");
      setIsDialogOpen(false);
      fetchApplications();
      
      alert('Teste atribuído com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir teste:', error);
      alert('Erro ao atribuir teste. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em Andamento";
      case "pending":
        return "Pendente";
      default:
        return "Não Iniciado";
    }
  };

  const getInterpretationColor = (score: number, testCode: string) => {
    // Lógica simplificada de interpretação baseada no código do teste
    if (testCode === 'PHQ-9') {
      if (score <= 4) return 'text-green-600';
      if (score <= 9) return 'text-yellow-600';
      if (score <= 14) return 'text-orange-600';
      return 'text-red-600';
    }
    
    if (testCode === 'BDI-II') {
      if (score <= 13) return 'text-green-600';
      if (score <= 19) return 'text-yellow-600';
      if (score <= 28) return 'text-orange-600';
      return 'text-red-600';
    }
    
    if (testCode === 'BAI') {
      if (score <= 7) return 'text-green-600';
      if (score <= 15) return 'text-yellow-600';
      if (score <= 25) return 'text-orange-600';
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  const completedTests = applications.filter(app => app.status === 'completed').length;
  const pendingTests = applications.filter(app => app.status === 'pending').length;
  const inProgressTests = applications.filter(app => app.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testes Psicológicos</h2>
          <p className="text-gray-600">Aplique e acompanhe testes psicológicos validados</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" />
              Atribuir Teste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Teste Psicológico</DialogTitle>
              <DialogDescription>
                Selecione um teste e um paciente para iniciar a aplicação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test">Teste Psicológico</Label>
                <Select onValueChange={setSelectedTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o teste" />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name} ({test.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={assignTest}
                disabled={!selectedTest || !selectedPatient || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Atribuindo...' : 'Atribuir Teste'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold">{completedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">{inProgressTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testes Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Testes Disponíveis</CardTitle>
          <CardDescription>
            Testes psicológicos validados disponíveis para aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{test.code}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">{test.category}</Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{test.name}</h4>
                    <p className="text-xs text-gray-600">{test.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aplicações de Testes */}
      <Card>
        <CardHeader>
          <CardTitle>Aplicações de Testes</CardTitle>
          <CardDescription>
            Acompanhe o progresso e resultados dos testes aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(application.status)}
                  <div>
                    <h4 className="font-medium">{application.psychological_tests.name}</h4>
                    <p className="text-sm text-gray-600">Paciente: {application.profiles.name}</p>
                    {application.status === 'completed' && application.completed_at && (
                      <p className="text-xs text-gray-500">
                        Concluído em: {new Date(application.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {application.status === 'completed' && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getInterpretationColor(application.score, application.psychological_tests.code)}`}>
                        {application.score} pts
                      </div>
                      <div className="text-xs text-gray-600">{application.interpretation}</div>
                    </div>
                  )}
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusLabel(application.status)}
                  </Badge>
                  {application.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {applications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum teste aplicado ainda</h3>
              <p className="text-gray-600">
                Comece atribuindo testes psicológicos aos seus pacientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PsychologicalTestsManager;
