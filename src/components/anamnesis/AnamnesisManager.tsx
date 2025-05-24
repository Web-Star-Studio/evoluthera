
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnamnesisTemplateBuilder from "./AnamnesisTemplateBuilder";
import AnamnesisTemplatesList from "./AnamnesisTemplatesList";
import AnamnesisApplicationsList from "./AnamnesisApplicationsList";
import AnamnesisSearch from "./AnamnesisSearch";

type ViewMode = 'dashboard' | 'template-builder' | 'template-editor';

const AnamnesisManager = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setViewMode('template-builder');
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setViewMode('template-editor');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedTemplateId(null);
  };

  if (viewMode === 'template-builder' || viewMode === 'template-editor') {
    return (
      <div>
        <Button
          onClick={handleBackToDashboard}
          variant="outline"
          className="mb-4"
        >
          ← Voltar para Dashboard
        </Button>
        <AnamnesisTemplateBuilder
          templateId={selectedTemplateId || undefined}
          onSave={handleBackToDashboard}
          onCancel={handleBackToDashboard}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Anamneses</h2>
          <p className="text-gray-600">
            Crie templates personalizados e gerencie anamneses dos pacientes
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <AnamnesisSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Meus Templates
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Aplicações
          </TabsTrigger>
          <TabsTrigger value="default-templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates Padrão
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <AnamnesisTemplatesList
            searchTerm={searchTerm}
            onEdit={handleEditTemplate}
            onCreate={handleCreateTemplate}
          />
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <AnamnesisApplicationsList searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="default-templates" className="space-y-4">
          <AnamnesisTemplatesList
            searchTerm={searchTerm}
            onEdit={handleEditTemplate}
            onCreate={handleCreateTemplate}
            showDefaultTemplates={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnamnesisManager;
