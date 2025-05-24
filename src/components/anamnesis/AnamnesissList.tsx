
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AnamnesisCard from "./AnamnesisCard";

interface Anamnesis {
  id: string;
  status: string;
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
  };
}

interface AnamnesisListProps {
  anamneses: Anamnesis[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSaveAsTemplate: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const AnamnesissList = ({
  anamneses,
  isLoading,
  onView,
  onEdit,
  onDuplicate,
  onSaveAsTemplate,
  onStatusChange,
  onDelete,
  onCreateNew,
}: AnamnesisListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anamneses</CardTitle>
        <CardDescription>
          {anamneses.length} anamneses encontradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : anamneses.length > 0 ? (
          <div className="space-y-4">
            {anamneses.map((anamnesis) => (
              <AnamnesisCard
                key={anamnesis.id}
                anamnesis={anamnesis}
                onView={onView}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onSaveAsTemplate={onSaveAsTemplate}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma anamnese encontrada</p>
            <Button onClick={onCreateNew} className="mt-4">
              Criar primeira anamnese
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnamnesissList;
