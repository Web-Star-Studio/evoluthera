
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowUp, ArrowDown, GripVertical, Plus, X } from "lucide-react";
import { AnamnesisField } from "@/types/anamnesis";

interface FieldBuilderProps {
  field: AnamnesisField;
  onUpdate: (field: AnamnesisField) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const FieldBuilder = ({ field, onUpdate, onDelete, onMoveUp, onMoveDown }: FieldBuilderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Texto curto' },
    { value: 'textarea', label: 'Texto longo' },
    { value: 'select', label: 'Seleção única' },
    { value: 'multiple_choice', label: 'Múltipla escolha' },
    { value: 'scale', label: 'Escala (1-5)' },
    { value: 'date', label: 'Data' },
    { value: 'number', label: 'Número' },
    { value: 'observation', label: 'Campo observacional' },
  ];

  const updateField = (updates: Partial<AnamnesisField>) => {
    onUpdate({ ...field, ...updates });
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    updateField({ options: [...currentOptions, 'Nova opção'] });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    updateField({ options: newOptions });
  };

  const getFieldTypeLabel = (type: string) => {
    return fieldTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <div className="flex-1">
              <div className="font-medium">{field.label}</div>
              <Badge variant="secondary" className="text-xs">
                {getFieldTypeLabel(field.type)}
              </Badge>
            </div>
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
              {isExpanded ? 'Recolher' : 'Editar'}
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

        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor={`label-${field.id}`}>Texto da pergunta</Label>
              <Input
                id={`label-${field.id}`}
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Digite a pergunta..."
              />
            </div>

            <div>
              <Label htmlFor={`type-${field.id}`}>Tipo de campo</Label>
              <Select
                value={field.type}
                onValueChange={(value) => updateField({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {field.placeholder !== undefined && (
              <div>
                <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.id}`}
                  value={field.placeholder || ''}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  placeholder="Texto de exemplo..."
                />
              </div>
            )}

            {(field.type === 'select' || field.type === 'multiple_choice') && (
              <div>
                <Label>Opções</Label>
                <div className="space-y-2">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addOption} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar opção
                  </Button>
                </div>
              </div>
            )}

            {field.type === 'scale' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`min-${field.id}`}>Valor mínimo</Label>
                  <Input
                    id={`min-${field.id}`}
                    type="number"
                    value={field.min || 1}
                    onChange={(e) => updateField({ min: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor={`max-${field.id}`}>Valor máximo</Label>
                  <Input
                    id={`max-${field.id}`}
                    type="number"
                    value={field.max || 5}
                    onChange={(e) => updateField({ max: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.required || false}
                onCheckedChange={(checked) => updateField({ required: checked })}
              />
              <Label htmlFor={`required-${field.id}`}>Campo obrigatório</Label>
            </div>

            {field.type === 'multiple_choice' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id={`multiple-${field.id}`}
                  checked={field.multiple || false}
                  onCheckedChange={(checked) => updateField({ multiple: checked })}
                />
                <Label htmlFor={`multiple-${field.id}`}>Permitir múltiplas seleções</Label>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldBuilder;
