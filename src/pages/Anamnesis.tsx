
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientAnamnesisView from "@/components/anamnesis/PatientAnamnesisView";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileText } from "lucide-react";

const Anamnesis = () => {
  const { anamnesisId } = useParams<{ anamnesisId: string }>();

  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      {anamnesisId ? (
        <PatientAnamnesisView anamnesisId={anamnesisId} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
              <h3 className="text-lg font-semibold mb-2">Anamnese Interativa</h3>
              <p className="text-gray-600 mb-4">
                Para preencher sua anamnese, você precisa acessar o link específico enviado pelo seu psicólogo.
              </p>
              <p className="text-sm text-gray-500">
                A anamnese é um questionário importante que ajuda seu psicólogo a conhecer melhor seu histórico e suas necessidades.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Anamnesis;
