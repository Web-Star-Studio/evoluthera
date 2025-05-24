
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AnamnesisTemplate, AnamnesisField } from "@/types/anamnesis";

interface AnamnesisPreviewProps {
  template: AnamnesisTemplate;
  onBack: () => void;
}

const AnamnesisPreview = ({ template, onBack }: AnamnesisPreviewProps) => {
  const renderField = (field: AnamnesisField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || field.label}
            disabled
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || field.label}
            disabled
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
                <span>{option}</span>
              </div>
            ))}
          </div>
        );
      
      case 'scale':
        return (
          <div className="flex items-center space-x-4">
            <span>{field.min || 1}</span>
            <Input type="range" min={field.min || 1} max={field.max || 5} disabled />
            <span>{field.max || 5}</span>
          </div>
        );
      
      case 'date':
        return <Input type="date" disabled />;
      
      case 'number':
        return <Input type="number" disabled />;
      
      case 'observation':
        return (
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <p className="text-sm text-gray-500">
              Campo reservado para observações do psicólogo (não visível ao paciente)
            </p>
          </div>
        );
      
      default:
        return <Input disabled />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Prévia: {template.name}</h2>
          <p className="text-gray-600">Como a anamnese aparecerá para o paciente</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{template.name}</CardTitle>
            {template.description && (
              <p className="text-gray-600">{template.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {template.sections
              ?.sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} className="space-y-6">
                  <div className="border-b pb-2">
                    <h3 className="text-xl font-semibold text-blue-700">
                      {section.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {section.fields
                      ?.sort((a, b) => a.order - b.order)
                      .filter(field => field.type !== 'observation') // Não mostrar campos de observação na prévia
                      .map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-base font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {renderField(field)}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnamnesisPreview;
