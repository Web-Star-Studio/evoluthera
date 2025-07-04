
import UniversalDashboardLayout from "@/components/layout/UniversalDashboardLayout";
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
import CommunicationManager from "@/components/admin/CommunicationManager";
import { Shield, BarChart3, Users, DollarSign, FileText, Download, TrendingUp, Receipt, Settings, Scale, MessageSquare, Megaphone } from "lucide-react";

const AdminDashboard = () => {
  return (
    <UniversalDashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header limpo */}
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
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <TrendingUp className="h-5 w-5" />
                Resumo de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900">Meta de Crescimento</h4>
                  <p className="text-sm text-blue-700">Objetivo: 20% ao mês</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900">Receita por Paciente</h4>
                  <p className="text-sm text-green-700">R$ 5,00 por paciente ativo</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900">Projeção Mensal</h4>
                  <p className="text-sm text-purple-700">Baseada em ativações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <MonthlyEvolutionChart />
        
        {/* Tabs simplificados - removido navegação duplicada */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-white border border-red-200">
            <TabsTrigger value="overview" data-tab="overview" className="data-[state=active]:bg-red-100">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" data-tab="users" className="data-[state=active]:bg-blue-100">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="billing" data-tab="billing" className="data-[state=active]:bg-green-100">
              Cobrança
            </TabsTrigger>
            <TabsTrigger value="billing-full" data-tab="billing-full" className="data-[state=active]:bg-emerald-100">
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="support" data-tab="support" className="data-[state=active]:bg-yellow-100">
              Suporte
            </TabsTrigger>
            <TabsTrigger value="communications" data-tab="communications" className="data-[state=active]:bg-purple-100">
              Comunicados
            </TabsTrigger>
            <TabsTrigger value="documents" data-tab="documents" className="data-[state=active]:bg-indigo-100">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="settings" data-tab="settings" className="data-[state=active]:bg-gray-100">
              Configurações
            </TabsTrigger>
            <TabsTrigger value="logs" data-tab="logs" className="data-[state=active]:bg-orange-100">
              Logs
            </TabsTrigger>
            <TabsTrigger value="reports" data-tab="reports" className="data-[state=active]:bg-pink-100">
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
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm font-medium">Novo psicólogo cadastrado</p>
                        <p className="text-xs text-gray-600">Dr. Maria Oliveira - há 2 horas</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm font-medium">Sistema atualizado</p>
                        <p className="text-xs text-gray-600">Versão 2.1.3 - há 1 dia</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border border-blue-200">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">Gerenciar Usuários</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border border-green-200">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Ver Faturamento</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border border-purple-200">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium">Logs do Sistema</p>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border border-orange-200">
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

          <TabsContent value="communications">
            <CommunicationManager />
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
    </UniversalDashboardLayout>
  );
};

export default AdminDashboard;
