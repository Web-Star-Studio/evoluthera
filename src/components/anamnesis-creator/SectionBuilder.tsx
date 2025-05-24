
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { AnamnesisSection, AnamnesisField } from "@/types/anamnesis";
import FieldBuilder from "./FieldBuilder";

interface SectionBuilderProps {
  section: AnamnesisSection;
  onUpdate: (section: AnamnesisSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const SectionBuilder = ({ section, onUpdate, onDelete, onMoveUp, onMoveDown }: SectionBuilderProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateSectionTitle = (title: string) => {
    onUpdate({ ...section, title });
  };

  const addField = () => {
    const newField: AnamnesisField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nova pergunta',
      required: false,
      order: section.fields.length + 1,
    };

    onUpdate({
      ...section,
      fields: [...section.fields, newField],
    });
  };

  const updateField = (fieldId: string, updatedField: AnamnesisField) => {
    onUpdate({
      ...section,
      fields: section.fields.map(field => 
        field.id === fieldId ? updatedField : field
      ),
    });
  };

  const deleteField = (fieldId: string) => {
    onUpdate({
      ...section,
      fields: section.fields.filter(field => field.id !== fieldId),
    });
  };

  const reorderFields = (fromIndex: number, toIndex: number) => {
    const fields = [...section.fields];
    const [moved] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, moved);

    // Atualizar ordem
    fields.forEach((field, index) => {
      field.order = index + 1;
    });

    onUpdate({ ...section, fields });
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(e.target.value)}
              className="font-semibold border-none p-0 h-auto bg-transparent"
              placeholder="Título da seção"
            />
            <Badge variant="outline">
              {section.fields.length} {section.fields.length === 1 ? 'campo' : 'campos'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button size="sm" variant="ghost" onClick={onMoveUp}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button size="sm" variant="ghost" onClick={onMoveDown}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {section.fields
            .sort((a, b) => a.order - b.order)
            .map((field, index) => (
              <FieldBuilder
                key={field.id}
                field={field}
                onUpdate={(updatedField) => updateField(field.id, updatedField)}
                onDelete={() => deleteField(field.id)}
                onMoveUp={index > 0 ? () => reorderFields(index, index - 1) : undefined}
                onMoveDown={index < section.fields.length - 1 ? () => reorderFields(index, index + 1) : undefined}
              />
            ))}

          <Button onClick={addField} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Campo
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default SectionBuilder;
