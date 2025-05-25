
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, AlertTriangle, Mic } from "lucide-react";
import DocumentationAssistant from "./DocumentationAssistant";
import CrisisPredictor from "./CrisisPredictor";
import SessionRecorder from "./SessionRecorder";

interface AIAssistantDashboardProps {
  patientId: string;
  sessionData?: any;
}

const AIAssistantDashboard = ({ patientId, sessionData }: AIAssistantDashboardProps) => {
  const [activeTab, setActiveTab] = useState("documentation");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          Assistente de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="crisis" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Predição de Crises
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Análise de Sessão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="mt-6">
            <DocumentationAssistant 
              patientId={patientId} 
              sessionData={sessionData}
            />
          </TabsContent>

          <TabsContent value="crisis" className="mt-6">
            <CrisisPredictor patientId={patientId} />
          </TabsContent>

          <TabsContent value="session" className="mt-6">
            <SessionRecorder 
              patientId={patientId}
              onAnalysisComplete={(analysis) => {
                console.log('Session analysis completed:', analysis);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAssistantDashboard;
