
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientAnamnesisView from "@/components/anamnesis/PatientAnamnesisView";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const PatientAnamnesis = () => {
  const { anamnesisId } = useParams<{ anamnesisId: string }>();

  if (!anamnesisId) {
    return (
      <DashboardLayout userType="patient" userName="Maria Silva">
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">ID da Anamnese Necessário</h3>
              <p className="text-gray-600">
                Para acessar sua anamnese, você precisa de um link válido enviado pelo seu psicólogo.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      <PatientAnamnesisView anamnesisId={anamnesisId} />
    </DashboardLayout>
  );
};

export default PatientAnamnesis;
