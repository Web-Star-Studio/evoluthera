
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnamnesisApplications } from "@/hooks/useAnamnesisApplications";
import { AnamnesisTemplate } from "@/types/anamnesis";

interface ApplyToPatientModalProps {
  template: AnamnesisTemplate | null;
  open: boolean;
  onClose: () => void;
}

const ApplyToPatientModal = ({ template, open, onClose }: ApplyToPatientModalProps) => {
  const [patientEmail, setPatientEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createApplication } = useAnamnesisApplications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !patientEmail.trim()) return;

    setIsLoading(true);
    try {
      // Por enquanto, vamos usar um ID fictício para o paciente
      // Em um ambiente real, você buscaria o paciente pelo email
      const mockPatientId = "mock-patient-id";
      
      await createApplication(template.id, mockPatientId);
      setPatientEmail("");
      onClose();
    } catch (error) {
      console.error('Erro ao aplicar anamnese:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar Anamnese: {template.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientEmail">Email do Paciente</Label>
            <Input
              id="patientEmail"
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Digite o email do paciente..."
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sobre esta anamnese:</h4>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <p className="text-sm text-gray-500">
              {template.sections?.length || 0} seções • 
              {template.sections?.reduce((total, section) => total + (section.fields?.length || 0), 0) || 0} perguntas
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !patientEmail.trim()}>
              {isLoading ? 'Enviando...' : 'Enviar Anamnese'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyToPatientModal;
