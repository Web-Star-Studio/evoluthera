
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnamnesisEditor from "./AnamnesisEditor";
import AnamnesisSearch from "./AnamnesisSearch";
import AnamnesissList from "./AnamnesissList";
import { useAnamnesisManager } from "@/hooks/useAnamnesisManager";

const AnamnesisManager = () => {
  const [selectedAnamnesis, setSelectedAnamnesis] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    anamneses,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleStatusChange,
    handleDeleteAnamnesis,
    handleDuplicateAnamnesis,
    handleSaveAsTemplate,
    loadAnamneses,
  } = useAnamnesisManager();

  if (isEditing || selectedAnamnesis) {
    return (
      <div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelectedAnamnesis(null);
          }}
          variant="outline"
          className="mb-4"
        >
          ← Voltar para Lista
        </Button>
        <AnamnesisEditor
          anamnesisId={selectedAnamnesis || undefined}
          onSave={() => {
            loadAnamneses();
            setIsEditing(false);
            setSelectedAnamnesis(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Anamneses</h2>
          <p className="text-gray-600">Visualize e gerencie todas as anamneses dos pacientes</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Anamnese
        </Button>
      </div>

      <AnamnesisSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <AnamnesissList
        anamneses={anamneses}
        isLoading={isLoading}
        onView={setSelectedAnamnesis}
        onEdit={setSelectedAnamnesis}
        onDuplicate={handleDuplicateAnamnesis}
        onSaveAsTemplate={handleSaveAsTemplate}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteAnamnesis}
        onCreateNew={() => setIsEditing(true)}
      />
    </div>
  );
};

export default AnamnesisManager;
