
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/admin/AdminStats";
import MonthlyEvolutionChart from "@/components/admin/MonthlyEvolutionChart";
import RevenueChart from "@/components/admin/RevenueChart";
import UsersTable from "@/components/admin/UsersTable";
import BillingMetrics from "@/components/admin/BillingMetrics";
import BillingDashboard from "@/components/admin/BillingDashboard";
import SystemLogs from "@/components/admin/SystemLogs";
import AdminLogs from "@/components/admin/AdminLogs";
import ReportExport from "@/components/admin/ReportExport";
import AdminSettings from "@/components/admin/AdminSettings";
import LegalDocumentsManager from "@/components/admin/LegalDocumentsManager";
import SupportTickets from "@/components/admin/SupportTickets";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  FileText, 
  Download,
  Shield,
  TrendingUp,
  Receipt,
  Settings,
  Scale,
  MessageSquare
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <DashboardLayout userType="admin" userName="Admin Master">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gestão completa da plataforma Evoluthera</p>
          </div>
        </div>
        
        {/* KPIs Principais */}
        <AdminStats />
        
        {/* Gráficos de Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Resumo de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Meta de Crescimento</h4>
                  <p className="text-sm text-blue-700">Objetivo: 20% ao mês</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Receita por Paciente</h4>
                  <p className="text-sm text-green-700">R$ 5,00 por paciente ativo</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Projeção Mensal</h4>
                  <p className="text-sm text-purple-700">Baseada em ativações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <MonthlyEvolutionChart />
        
        {/* Tabs para diferentes funcionalidades administrativas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cobrança
            </TabsTrigger>
            <TabsTrigger value="billing-full" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Suporte
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Novo psicólogo cadastrado</p>
                        <p className="text-xs text-gray-600">Dr. Maria Oliveira - há 2 horas</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Sistema atualizado</p>
                        <p className="text-xs text-gray-600">Versão 2.1.3 - há 1 dia</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Backup realizado</p>
                        <p className="text-xs text-gray-600">Dados seguros - há 1 dia</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Ferramentas administrativas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">Gerenciar Usuários</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Ver Faturamento</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium">Logs do Sistema</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <Download className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-sm font-medium">Exportar Dados</p>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UsersTable />
          </TabsContent>

          <TabsContent value="billing">
            <BillingMetrics />
          </TabsContent>

          <TabsContent value="billing-full">
            <BillingDashboard />
          </TabsContent>

          <TabsContent value="support">
            <SupportTickets />
          </TabsContent>

          <TabsContent value="documents">
            <LegalDocumentsManager />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>

          <TabsContent value="reports">
            <ReportExport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
