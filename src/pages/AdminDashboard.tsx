
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/admin/AdminStats";
import UsersTable from "@/components/admin/UsersTable";
import BillingMetrics from "@/components/admin/BillingMetrics";
import SystemLogs from "@/components/admin/SystemLogs";
import ReportExport from "@/components/admin/ReportExport";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  FileText, 
  Download,
  Shield
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <DashboardLayout userType="admin" userName="Admin Master">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gestão completa da plataforma</p>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        <AdminStats />
        
        {/* Tabs for different admin functions */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cobrança
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable />
          </TabsContent>

          <TabsContent value="billing">
            <BillingMetrics />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>

          <TabsContent value="reports">
            <ReportExport />
          </TabsContent>

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
