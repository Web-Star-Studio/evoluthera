
import { useState } from "react";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const MedicalRecord = () => {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  
  const patients = [
    { id: 1, name: "Maria Silva", age: 28, lastSession: "10/01/2024" },
    { id: 2, name: "João Santos", age: 35, lastSession: "08/01/2024" },
    { id: 3, name: "Ana Costa", age: 42, lastSession: "05/01/2024" },
  ];

  const sessions = [
    { date: "10/01/2024", notes: "Paciente demonstrou melhora significativa no controle da ansiedade. Realizamos exercícios de respiração.", mood: "Bom" },
    { date: "03/01/2024", notes: "Discussão sobre gatilhos de ansiedade no trabalho. Paciente relatou episódios menores durante a semana.", mood: "Regular" },
    { date: "27/12/2023", notes: "Primeira sessão. Anamnese completa. Paciente apresenta sintomas de ansiedade generalizada.", mood: "Baixo" },
  ];

  return (
    <UniversalDashboardLayout userType="psychologist">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
          <p className="text-gray-600">Gerencie e visualize informações dos pacientes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pacientes</CardTitle>
              <CardDescription>Selecione um paciente para ver o prontuário</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient === patient.id 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.age} anos</p>
                    <p className="text-xs text-gray-500">Última sessão: {patient.lastSession}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 space-y-6">
            {selectedPatient ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Sessão</CardTitle>
                    <CardDescription>Registrar nova sessão para {patients.find(p => p.id === selectedPatient)?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-date">Data da Sessão</Label>
                        <Input id="session-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="session-duration">Duração (minutos)</Label>
                        <Input id="session-duration" type="number" defaultValue={50} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="session-notes">Observações da Sessão</Label>
                      <Textarea 
                        id="session-notes" 
                        placeholder="Registre as observações da sessão..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homework">Tarefas/Atividades para Casa</Label>
                      <Textarea 
                        id="homework" 
                        placeholder="Descreva as atividades recomendadas..."
                        rows={3}
                      />
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Salvar Sessão
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Sessões</CardTitle>
                    <CardDescription>Sessões anteriores registradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{session.date}</span>
                            <Badge variant={session.mood === "Bom" ? "default" : session.mood === "Regular" ? "secondary" : "destructive"}>
                              {session.mood}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{session.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Selecione um paciente para visualizar o prontuário</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </UniversalDashboardLayout>
  );
};

export default MedicalRecord;
