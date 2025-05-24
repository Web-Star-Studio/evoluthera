
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnamnesisField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

interface AnamnesisSection {
  id: string;
  title: string;
  description?: string;
  fields: AnamnesisField[];
}

interface AnamnesisTemplate {
  id: string;
  name: string;
  description?: string;
  sections: AnamnesisSection[];
  psychologist_id: string;
  is_default: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useAnamnesisTemplates = () => {
  const [templates, setTemplates] = useState<AnamnesisTemplate[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadDefaultTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('anamnesis_templates')
        .select('*')
        .eq('psychologist_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedTemplates: AnamnesisTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        sections: Array.isArray(template.sections) ? template.sections : [],
        psychologist_id: template.psychologist_id,
        is_default: template.is_default,
        is_published: template.is_published,
        created_at: template.created_at,
        updated_at: template.updated_at
      }));
      
      setTemplates(typedTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis_default_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setDefaultTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates padrão:', error);
    }
  };

  const createTemplate = async (templateData: Omit<AnamnesisTemplate, 'id' | 'created_at' | 'updated_at' | 'psychologist_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('anamnesis_templates')
        .insert({
          ...templateData,
          psychologist_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadTemplates();
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<AnamnesisTemplate>) => {
    try {
      const { error } = await supabase
        .from('anamnesis_templates')
        .update(updates)
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('anamnesis_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      toast({
        title: "Sucesso",
        description: "Template deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template não encontrado');

      await createTemplate({
        name: `${template.name} (Cópia)`,
        description: template.description,
        sections: template.sections,
        is_default: false,
        is_published: false,
      });
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar o template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createFromDefault = async (defaultTemplateId: string) => {
    try {
      const defaultTemplate = defaultTemplates.find(t => t.id === defaultTemplateId);
      if (!defaultTemplate) throw new Error('Template padrão não encontrado');

      await createTemplate({
        name: `${defaultTemplate.name} (Personalizado)`,
        description: defaultTemplate.description,
        sections: defaultTemplate.sections || [],
        is_default: false,
        is_published: false,
      });
    } catch (error) {
      console.error('Erro ao criar template a partir do padrão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar template a partir do padrão",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    templates,
    defaultTemplates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createFromDefault,
    loadTemplates,
  };
};
