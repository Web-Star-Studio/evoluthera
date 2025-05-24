
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  DollarSign, 
  Mail, 
  Shield, 
  FileText, 
  Users, 
  Clock,
  Save,
  AlertTriangle
} from "lucide-react";

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string;
  is_public: boolean;
}

const AdminSettings = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState<{ [key: string]: any }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as configurações
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data as AdminSetting[];
    }
  });

  // Mutation para atualizar configuração
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase.rpc('update_admin_setting', {
        key_name: key,
        new_value: JSON.stringify(value)
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setHasChanges(false);
      setLocalSettings({});
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
      console.error('Error updating settings:', error);
    }
  });

  // Helper para obter valor da configuração
  const getSettingValue = (key: string, defaultValue: any = '') => {
    if (localSettings[key] !== undefined) {
      return localSettings[key];
    }
    
    const setting = settings?.find(s => s.setting_key === key);
    if (!setting) return defaultValue;
    
    try {
      return JSON.parse(setting.setting_value);
    } catch {
      return setting.setting_value;
    }
  };

  // Helper para atualizar configuração local
  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Salvar todas as alterações
  const saveAllChanges = async () => {
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        await updateSettingMutation.mutateAsync({ key, value });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
          </div>
        </div>
        
        {hasChanges && (
          <Button 
            onClick={saveAllChanges} 
            disabled={updateSettingMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateSettingMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        )}
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <p className="text-orange-800">Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Configurações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient_price">Valor por Paciente Ativo (R$)</Label>
              <Input
                id="patient_price"
                type="number"
                step="0.01"
                min="0"
                value={getSettingValue('patient_price_per_month', 5.00)}
                onChange={(e) => updateLocalSetting('patient_price_per_month', parseFloat(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor cobrado por paciente ativo por mês
              </p>
            </div>

            <div>
              <Label htmlFor="max_patients">Máximo de Pacientes por Psicólogo</Label>
              <Input
                id="max_patients"
                type="number"
                min="1"
                value={getSettingValue('max_patients_per_psychologist', 50)}
                onChange={(e) => updateLocalSetting('max_patients_per_psychologist', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Configurações de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="support_email">E-mail do Suporte</Label>
              <Input
                id="support_email"
                type="email"
                value={getSettingValue('support_email', 'suporte@evoluthera.com')}
                onChange={(e) => updateLocalSetting('support_email', e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                E-mail padrão para contato de suporte
              </p>
            </div>

            <div>
              <Label htmlFor="session_timeout">Timeout da Sessão (minutos)</Label>
              <Input
                id="session_timeout"
                type="number"
                min="15"
                max="480"
                value={getSettingValue('session_timeout_minutes', 60)}
                onChange={(e) => updateLocalSetting('session_timeout_minutes', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modo de Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Controle do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Modo de Manutenção</Label>
                <p className="text-xs text-gray-500">
                  Impede novos cadastros quando ativado
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={getSettingValue('maintenance_mode', false)}
                onCheckedChange={(checked) => updateLocalSetting('maintenance_mode', checked)}
              />
            </div>
            
            {getSettingValue('maintenance_mode', false) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">
                    Sistema em modo de manutenção
                  </p>
                </div>
                <p className="text-red-700 text-xs mt-1">
                  Novos cadastros estão bloqueados
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissões de Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Permissões de Administradores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'can_manage_users', label: 'Gerenciar Usuários' },
              { key: 'can_manage_billing', label: 'Gerenciar Faturamento' },
              { key: 'can_manage_settings', label: 'Gerenciar Configurações' },
              { key: 'can_view_reports', label: 'Visualizar Relatórios' }
            ].map((permission) => {
              const currentPermissions = getSettingValue('admin_permissions', {});
              return (
                <div key={permission.key} className="flex items-center justify-between">
                  <Label htmlFor={permission.key}>{permission.label}</Label>
                  <Switch
                    id={permission.key}
                    checked={currentPermissions[permission.key] || false}
                    onCheckedChange={(checked) => {
                      const newPermissions = {
                        ...currentPermissions,
                        [permission.key]: checked
                      };
                      updateLocalSetting('admin_permissions', newPermissions);
                    }}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Textos Institucionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Textos Institucionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Política de Privacidade */}
          <div>
            <Label htmlFor="privacy_title">Política de Privacidade - Título</Label>
            <Input
              id="privacy_title"
              value={getSettingValue('privacy_policy', {}).title || ''}
              onChange={(e) => {
                const current = getSettingValue('privacy_policy', {});
                updateLocalSetting('privacy_policy', { ...current, title: e.target.value });
              }}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="privacy_content">Política de Privacidade - Conteúdo</Label>
            <Textarea
              id="privacy_content"
              rows={4}
              value={getSettingValue('privacy_policy', {}).content || ''}
              onChange={(e) => {
                const current = getSettingValue('privacy_policy', {});
                updateLocalSetting('privacy_policy', { ...current, content: e.target.value });
              }}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Termos de Uso */}
          <div>
            <Label htmlFor="terms_title">Termos de Uso - Título</Label>
            <Input
              id="terms_title"
              value={getSettingValue('terms_of_service', {}).title || ''}
              onChange={(e) => {
                const current = getSettingValue('terms_of_service', {});
                updateLocalSetting('terms_of_service', { ...current, title: e.target.value });
              }}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="terms_content">Termos de Uso - Conteúdo</Label>
            <Textarea
              id="terms_content"
              rows={4}
              value={getSettingValue('terms_of_service', {}).content || ''}
              onChange={(e) => {
                const current = getSettingValue('terms_of_service', {});
                updateLocalSetting('terms_of_service', { ...current, content: e.target.value });
              }}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Rodapé */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="footer_company">Nome da Empresa</Label>
              <Input
                id="footer_company"
                value={getSettingValue('footer_text', {}).company || ''}
                onChange={(e) => {
                  const current = getSettingValue('footer_text', {});
                  updateLocalSetting('footer_text', { ...current, company: e.target.value });
                }}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="footer_year">Ano</Label>
              <Input
                id="footer_year"
                value={getSettingValue('footer_text', {}).year || ''}
                onChange={(e) => {
                  const current = getSettingValue('footer_text', {});
                  updateLocalSetting('footer_text', { ...current, year: e.target.value });
                }}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="footer_rights">Direitos</Label>
              <Input
                id="footer_rights"
                value={getSettingValue('footer_text', {}).rights || ''}
                onChange={(e) => {
                  const current = getSettingValue('footer_text', {});
                  updateLocalSetting('footer_text', { ...current, rights: e.target.value });
                }}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar fixo no final */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button 
            onClick={saveAllChanges} 
            disabled={updateSettingMutation.isPending}
            size="lg"
            className="flex items-center gap-2 shadow-lg"
          >
            <Save className="h-5 w-5" />
            {updateSettingMutation.isPending ? 'Salvando...' : 'Salvar Todas as Alterações'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
