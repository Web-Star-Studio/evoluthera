
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <DashboardLayout userType="patient" userName="Maria Silva">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e informações da conta</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="Maria Silva" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="maria@exemplo.com" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 99999-9999" />
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="w-full" variant="outline">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="session-reminders">Lembretes de Sessão</Label>
                <Switch id="session-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="activity-notifications">Notificações de Atividades</Label>
                <Switch id="activity-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="progress-reports">Relatórios de Progresso</Label>
                <Switch id="progress-reports" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>Controle suas configurações de privacidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility">Perfil Visível</Label>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing">Compartilhar Dados para Pesquisa</Label>
                <Switch id="data-sharing" />
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  Excluir Conta
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
