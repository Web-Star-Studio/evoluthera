
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User, Calendar, TrendingUp } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  lastSession: string;
  progress: number;
}

interface PatientsListProps {
  patients: Patient[];
  addPatient: (patient: Patient) => void;
}

const PatientsList = ({ patients, addPatient }: PatientsListProps) => {
  const [newPatientName, setNewPatientName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPatient = () => {
    if (newPatientName.trim()) {
      const newPatient: Patient = {
        id: Date.now(),
        name: newPatientName,
        lastSession: new Date().toLocaleDateString('pt-BR'),
        progress: 0
      };
      addPatient(newPatient);
      setNewPatientName("");
      setIsDialogOpen(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressLevel = (progress: number) => {
    if (progress >= 75) return "Excelente";
    if (progress >= 50) return "Bom";
    if (progress >= 25) return "Regular";
    return "Baixo";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-600">Gerencie seus pacientes e acompanhe o progresso</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Paciente</DialogTitle>
              <DialogDescription>
                Insira o nome do novo paciente para adicioná-lo à sua lista.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do paciente"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPatient()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPatient} className="bg-emerald-600 hover:bg-emerald-700">
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className={`${getProgressColor(patient.progress)} text-white`}>
                  {getProgressLevel(patient.progress)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Última sessão: {patient.lastSession}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{patient.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(patient.progress)}`}
                    style={{ width: `${patient.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Progresso
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientsList;
