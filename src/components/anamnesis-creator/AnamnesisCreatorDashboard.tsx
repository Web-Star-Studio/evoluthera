
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Clock } from "lucide-react";
import { useAnamnesisTemplates } from "@/hooks/useAnamnesisTemplates";
import { useAnamnesisApplications } from "@/hooks/useAnamnesisApplications";
import AnamnesisTemplatesList from "./AnamnesisTemplatesList";
import AnamnesisBuilder from "./AnamnesisBuilder";
import DefaultTemplatesModal from "./DefaultTemplatesModal";
import ApplicationsList from "./ApplicationsList";

const AnamnesisCreatorDashboard = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'applications'>('dashboard');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showDefaultTemplates, setShowDefaultTemplates] = useState(false);

  const { templates, isLoading: templatesLoading } = useAnamnesisTemplates();
  const { applications, isLoading: applicationsLoading } = useAnamnesisApplications();

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setCurrentView('builder');
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplate(templateId);
    setCurrentView('builder');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingTemplate(null);
  };

  if (currentView === 'builder') {
    return (
      <AnamnesisBuilder
        templateId={editingTemplate}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'applications') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Aplicações de Anamnese</h2>
            <p className="text-gray-600">Gerencie as anamneses enviadas aos pacientes</p>
          </div>
          <Button onClick={handleBackToDashboard} variant="outline">
            ← Voltar ao Dashboard
          </Button>
        </div>
        <ApplicationsList />
      </div>
    );
  }

  const stats = [
    {
      title: "Templates Criados",
      value: templates.length,
      icon: FileText,
      description: "Templates de anamnese",
    },
    {
      title: "Aplicações Ativas",
      value: applications.filter(app => app.status !== 'completed').length,
      icon: Users,
      description: "Anamneses pendentes",
    },
    {
      title: "Concluídas",
      value: applications.filter(app => app.status === 'completed').length,
      icon: Clock,
      description: "Anamneses finalizadas",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Criador de Anamneses</h2>
          <p className="text-gray-600">Crie e gerencie questionários de anamnese personalizados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDefaultTemplates(true)} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Modelos Padrão
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Anamnese
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView('applications')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Aplicações
            </CardTitle>
            <CardDescription>
              Visualize e gerencie as anamneses enviadas aos pacientes
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateNew}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Nova Anamnese
            </CardTitle>
            <CardDescription>
              Monte um novo questionário personalizado do zero
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Templates */}
      <AnamnesisTemplatesList 
        onEdit={handleEditTemplate}
        isLoading={templatesLoading}
      />

      {/* Modal de Templates Padrão */}
      <DefaultTemplatesModal
        open={showDefaultTemplates}
        onClose={() => setShowDefaultTemplates(false)}
      />
    </div>
  );
};

export default AnamnesisCreatorDashboard;
