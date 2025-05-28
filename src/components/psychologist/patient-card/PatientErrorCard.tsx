
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface PatientErrorCardProps {
  patientId: string;
}

const PatientErrorCard = ({ patientId }: PatientErrorCardProps) => {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Dados do paciente incompletos
            </h3>
            <p className="text-sm text-gray-600">
              ID: {patientId}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              O perfil deste paciente não foi encontrado. Entre em contato com o suporte.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientErrorCard;
