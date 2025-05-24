
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnamnesisTemplate, DefaultTemplate } from "@/types/anamnesis";

export const useAnamnesisTemplates = () => {
  const [templates, setTemplates] = useState<AnamnesisTemplate[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<DefaultTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadDefaultTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert the data to match our types
      const convertedTemplates: AnamnesisTemplate[] = (data || []).map(template => ({
        ...template,
        sections: template.sections as any, // Will be properly typed as AnamnesisSection[]
      }));
      
      setTemplates(convertedTemplates);
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
      
      // Convert the data to match our types
      const convertedDefaultTemplates: DefaultTemplate[] = (data || []).map(template => ({
        ...template,
        sections: template.sections as any, // Will be properly typed as AnamnesisSection[]
      }));
      
      setDefaultTemplates(convertedDefaultTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates padrão:', error);
    }
  };

  const createTemplate = async (template: Partial<AnamnesisTemplate>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('anamnesis_templates')
        .insert({
          ...template,
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

  const updateTemplate = async (id: string, updates: Partial<AnamnesisTemplate>) => {
    try {
      const { error } = await supabase
        .from('anamnesis_templates')
        .update(updates)
        .eq('id', id);

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

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anamnesis_templates')
        .delete()
        .eq('id', id);

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

  const duplicateTemplate = async (template: AnamnesisTemplate) => {
    try {
      const newTemplate = {
        name: `${template.name} (Cópia)`,
        description: template.description,
        sections: template.sections,
        is_default: false,
        is_published: false,
      };

      await createTemplate(newTemplate);
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      throw error;
    }
  };

  const createFromDefault = async (defaultTemplate: DefaultTemplate) => {
    try {
      const newTemplate = {
        name: defaultTemplate.name,
        description: defaultTemplate.description,
        sections: defaultTemplate.sections,
        is_default: false,
        is_published: false,
      };

      return await createTemplate(newTemplate);
    } catch (error) {
      console.error('Erro ao criar template a partir do padrão:', error);
      throw error;
    }
  };

  return {
    templates,
    defaultTemplates,
    isLoading,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createFromDefault,
  };
};
