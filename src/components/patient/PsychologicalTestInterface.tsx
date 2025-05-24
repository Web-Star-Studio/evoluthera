
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, Clock, ArrowRight, ArrowLeft } from "lucide-react";

interface TestQuestion {
  id: number;
  question: string;
  options: { value: number; text: string }[];
}

interface TestApplication {
  id: string;
  test_id: string;
  status: string;
  responses: any;
  psychological_tests: {
    name: string;
    code: string;
    description: string;
    questions: {
      instructions: string;
      items: TestQuestion[];
    };
    scoring_rules: {
      method: string;
      total_possible: number;
    };
    interpretation_ranges: {
      ranges: Array<{
        min: number;
        max: number;
        level: string;
        color: string;
        description: string;
      }>;
    };
  };
}

const PsychologicalTestInterface = () => {
  const [applications, setApplications] = useState<TestApplication[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestApplication | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientId = "temp-user-id"; // Substituir por auth.uid()

  useEffect(() => {
    fetchTestApplications();
  }, []);

  const fetchTestApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('test_applications')
        .select(`
          *,
          psychological_tests(
            name,
            code,
            description,
            questions,
            scoring_rules,
            interpretation_ranges
          )
        `)
        .eq('patient_id', patientId)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
    }
  };

  const startTest = async (testApp: TestApplication) => {
    try {
      // Atualizar status para 'in_progress'
      const { error } = await supabase
        .from('test_applications')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', testApp.id);

      if (error) throw error;

      setSelectedTest(testApp);
      setCurrentQuestion(0);
      setResponses(testApp.responses || {});
    } catch (error) {
      console.error('Erro ao iniciar teste:', error);
    }
  };

  const saveResponse = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    if (selectedTest && currentQuestion < selectedTest.psychological_tests.questions.items.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!selectedTest) return 0;
    
    const items = selectedTest.psychological_tests.questions.items;
    return items.reduce((total, item) => {
      return total + (responses[item.id] || 0);
    }, 0);
  };

  const getInterpretation = (score: number) => {
    if (!selectedTest) return "Não disponível";
    
    const ranges = selectedTest.psychological_tests.interpretation_ranges.ranges;
    const range = ranges.find(r => score >= r.min && score <= r.max);
    
    return range ? `${range.level} - ${range.description}` : "Não classificado";
  };

  const submitTest = async () => {
    if (!selectedTest) return;

    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const interpretation = getInterpretation(score);

      const { error } = await supabase
        .from('test_applications')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          responses,
          score,
          interpretation
        })
        .eq('id', selectedTest.id);

      if (error) throw error;

      alert('Teste concluído com sucesso! Seus resultados foram enviados para o psicólogo.');
      setSelectedTest(null);
      setCurrentQuestion(0);
      setResponses({});
      fetchTestApplications();
    } catch (error) {
      console.error('Erro ao submeter teste:', error);
      alert('Erro ao concluir teste. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedTest) {
    const questions = selectedTest.psychological_tests.questions.items;
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isLastQuestion = currentQuestion === questions.length - 1;
    const allQuestionsAnswered = questions.every(q => responses[q.id] !== undefined);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTest.psychological_tests.name}</CardTitle>
                <CardDescription>{selectedTest.psychological_tests.description}</CardDescription>
              </div>
              <Badge variant="outline">
                {currentQuestion + 1} de {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
              {selectedTest.psychological_tests.questions.instructions}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQ.question}</h3>
              
              <RadioGroup
                value={responses[currentQ.id]?.toString() || ""}
                onValueChange={(value) => saveResponse(currentQ.id, parseInt(value))}
              >
                {currentQ.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label htmlFor={`option-${option.value}`} className="cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={submitTest}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Finalizar Teste'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={responses[currentQ.id] === undefined}
                >
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Testes Psicológicos
        </h2>
        <p className="text-gray-600">Complete os testes atribuídos pelo seu psicólogo</p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.psychological_tests.name}</CardTitle>
                    <CardDescription>{application.psychological_tests.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {application.status === 'in_progress' ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Em Andamento
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p><strong>Código:</strong> {application.psychological_tests.code}</p>
                    <p><strong>Status:</strong> {application.status === 'pending' ? 'Aguardando início' : 'Em progresso'}</p>
                  </div>
                  
                  <Button 
                    onClick={() => startTest(application)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {application.status === 'pending' ? 'Iniciar Teste' : 'Continuar Teste'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum teste disponível</h3>
            <p className="text-gray-600">
              Quando seu psicólogo atribuir testes, eles aparecerão aqui para você completar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PsychologicalTestInterface;
