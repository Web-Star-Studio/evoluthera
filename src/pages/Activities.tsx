
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const Activities = () => {
  const [userType] = useState<"patient" | "psychologist">("patient"); // This would come from auth context
  
  const activities = [
    {
      id: 1,
      title: "Exercício de Respiração",
      description: "Pratique respiração profunda por 10 minutos",
      status: "pending",
      dueDate: "15/01/2024",
      type: "Relaxamento"
    },
    {
      id: 2,
      title: "Diário de Gratidão",
      description: "Escreva 3 coisas pelas quais você é grato hoje",
      status: "completed",
      dueDate: "14/01/2024",
      type: "Reflexão"
    },
    {
      id: 3,
      title: "Caminhada de 20 minutos",
      description: "Faça uma caminhada ao ar livre prestando atenção aos sons",
      status: "pending",
      dueDate: "16/01/2024",
      type: "Exercício"
    },
  ];

  const PatientView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Minhas Atividades</h1>
        <p className="text-gray-600">Atividades recomendadas pelo seu terapeuta</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className={activity.status === "completed" ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                  {activity.type}
                </Badge>
              </div>
              <CardDescription>{activity.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Prazo: {activity.dueDate}</p>
                {activity.status === "pending" ? (
                  <div className="space-y-2">
                    <Label htmlFor={`response-${activity.id}`}>Sua resposta</Label>
                    <Textarea 
                      id={`response-${activity.id}`}
                      placeholder="Como foi realizar esta atividade?"
                      rows={3}
                    />
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Marcar como Concluída
                    </Button>
                  </div>
                ) : (
                  <Badge className="w-full justify-center">✓ Concluída</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const PsychologistView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Atividades</h1>
        <p className="text-gray-600">Envie atividades para seus pacientes</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Atividade</CardTitle>
            <CardDescription>Crie uma nova atividade para um paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient-select">Paciente</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Maria Silva</option>
                <option>João Santos</option>
                <option>Ana Costa</option>
              </select>
            </div>
            <div>
              <Label htmlFor="activity-title">Título da Atividade</Label>
              <Input id="activity-title" placeholder="Ex: Exercício de respiração" />
            </div>
            <div>
              <Label htmlFor="activity-description">Descrição</Label>
              <Textarea 
                id="activity-description" 
                placeholder="Descreva a atividade em detalhes..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="activity-type">Tipo de Atividade</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Relaxamento</option>
                <option>Reflexão</option>
                <option>Exercício</option>
                <option>Leitura</option>
              </select>
            </div>
            <div>
              <Label htmlFor="due-date">Prazo</Label>
              <Input id="due-date" type="date" />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Enviar Atividade
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Atividades Enviadas</CardTitle>
            <CardDescription>Acompanhe o progresso dos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{activity.title}</h4>
                    <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                      {activity.status === "completed" ? "Concluída" : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <p className="text-xs text-gray-500">Prazo: {activity.dueDate}</p>
                  {activity.status === "completed" && (
                    <Button size="sm" variant="outline" className="mt-2">
                      Ver Resposta
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      userType={userType} 
      userName={userType === "patient" ? "Maria Silva" : "Dr. João Santos"}
    >
      {userType === "patient" ? <PatientView /> : <PsychologistView />}
    </DashboardLayout>
  );
};

export default Activities;
