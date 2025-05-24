
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Settings, MessageCircle, Clock, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ChatSettings as ChatSettingsType } from "@/types/chat";

interface ChatSettingsProps {
  psychologistId: string;
}

const ChatSettings = ({ psychologistId }: ChatSettingsProps) => {
  const [settings, setSettings] = useState<ChatSettingsType>({
    id: '',
    psychologist_id: psychologistId,
    chat_enabled: true,
    daily_message_limit: 10,
    max_message_length: 1000,
    auto_response_enabled: false,
    auto_response_message: '',
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, [psychologistId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        psychologist_id: psychologistId,
        chat_enabled: settings.chat_enabled,
        daily_message_limit: settings.daily_message_limit,
        max_message_length: settings.max_message_length,
        auto_response_enabled: settings.auto_response_enabled,
        auto_response_message: settings.auto_response_message || null
      };

      const { data, error } = await supabase
        .from('chat_settings')
        .upsert(settingsData, {
          onConflict: 'psychologist_id'
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ChatSettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Chat
        </CardTitle>
        <CardDescription>
          Configure como o chat funcionará para seus pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chat Enabled */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Habilitado
            </Label>
            <p className="text-sm text-gray-500">
              Permitir que pacientes enviem mensagens
            </p>
          </div>
          <Switch
            checked={settings.chat_enabled}
            onCheckedChange={(checked) => updateSetting('chat_enabled', checked)}
          />
        </div>

        {settings.chat_enabled && (
          <>
            {/* Daily Message Limit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Limite de mensagens por dia
              </Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings.daily_message_limit}
                onChange={(e) => updateSetting('daily_message_limit', parseInt(e.target.value) || 10)}
                className="w-32"
              />
              <p className="text-sm text-gray-500">
                Quantas mensagens cada paciente pode enviar por dia
              </p>
            </div>

            {/* Max Message Length */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Tamanho máximo da mensagem
              </Label>
              <Input
                type="number"
                min="100"
                max="2000"
                value={settings.max_message_length}
                onChange={(e) => updateSetting('max_message_length', parseInt(e.target.value) || 1000)}
                className="w-32"
              />
              <p className="text-sm text-gray-500">
                Quantidade máxima de caracteres por mensagem
              </p>
            </div>

            {/* Auto Response */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resposta Automática</Label>
                  <p className="text-sm text-gray-500">
                    Enviar uma mensagem automática quando pacientes escrevem
                  </p>
                </div>
                <Switch
                  checked={settings.auto_response_enabled}
                  onCheckedChange={(checked) => updateSetting('auto_response_enabled', checked)}
                />
              </div>

              {settings.auto_response_enabled && (
                <div className="space-y-2">
                  <Label>Mensagem automática</Label>
                  <Textarea
                    value={settings.auto_response_message || ''}
                    onChange={(e) => updateSetting('auto_response_message', e.target.value)}
                    placeholder="Ex: Obrigado pela sua mensagem. Responderei assim que possível."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChatSettings;
