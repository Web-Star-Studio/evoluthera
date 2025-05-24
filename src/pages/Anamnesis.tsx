
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const Anamnesis = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input id="age" type="number" />
              </div>
              <div>
                <Label htmlFor="profession">Profissão</Label>
                <Input id="profession" type="text" />
              </div>
              <div>
                <Label htmlFor="marital-status">Estado Civil</Label>
                <RadioGroup defaultValue="single">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Solteiro(a)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="married" />
                    <Label htmlFor="married">Casado(a)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="divorced" id="divorced" />
                    <Label htmlFor="divorced">Divorciado(a)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Histórico de Saúde Mental</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="previous-therapy">Já fez terapia anteriormente?</Label>
                <RadioGroup defaultValue="no">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes-therapy" />
                    <Label htmlFor="yes-therapy">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-therapy" />
                    <Label htmlFor="no-therapy">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="medications">Uso de medicamentos</Label>
                <Textarea id="medications" placeholder="Liste os medicamentos que você usa atualmente" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Sintomas e Preocupações</h3>
            <div className="space-y-4">
              <div>
                <Label>Sintomas que você tem experimentado (marque todos que se aplicam):</Label>
                <div className="mt-2 space-y-2">
                  {["Ansiedade", "Depressão", "Insônia", "Estresse", "Ataques de pânico", "Problemas de relacionamento"].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox id={symptom} />
                      <Label htmlFor={symptom}>{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="main-concern">Principal preocupação ou motivo para buscar terapia</Label>
                <Textarea id="main-concern" placeholder="Descreva sua principal preocupação..." />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Objetivos e Expectativas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goals">O que você espera alcançar com a terapia?</Label>
                <Textarea id="goals" placeholder="Descreva seus objetivos..." />
              </div>
              <div>
                <Label htmlFor="support-system">Como é seu sistema de apoio (família, amigos)?</Label>
                <Textarea id="support-system" placeholder="Descreva seu sistema de apoio..." />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Anamnese</CardTitle>
            <CardDescription>
              Etapa {currentStep} de {totalSteps} - Suas informações nos ajudam a personalizar seu acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep === totalSteps ? (
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Concluir Anamnese
                </Button>
              ) : (
                <Button 
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Próximo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Anamnesis;
