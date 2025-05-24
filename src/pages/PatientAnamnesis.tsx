
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import PatientAnamnesisView from "@/components/anamnesis/PatientAnamnesisView";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const PatientAnamnesis = () => {
  const { anamnesisId } = useParams<{ anamnesisId: string }>();

  if (!anamnesisId) {
    return (
      <UniversalDashboardLayout userType="patient">
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
      </UniversalDashboardLayout>
    );
  }

  return (
    <UniversalDashboardLayout userType="patient">
      <PatientAnamnesisView anamnesisId={anamnesisId} />
    </UniversalDashboardLayout>
  );
};

export default PatientAnamnesis;
