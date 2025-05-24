
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
import LegalDocumentsManager from "@/components/admin/LegalDocumentsManager";
import { Scale } from "lucide-react";

const AdminDocuments = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentos Legais</h1>
            <p className="text-gray-600">Gerencie termos de uso, políticas e documentos legais</p>
          </div>
        </div>

        <LegalDocumentsManager />
      </div>
    </UniversalDashboardLayout>
  );
};

export default AdminDocuments;
