
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Anamnesis {
  id: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
  patient: {
    name: string;
    email: string;
  } | null;
  template: {
    name: string;
  } | null;
}

export const useAnamnesisManager = () => {
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [filteredAnamneses, setFilteredAnamneses] = useState<Anamnesis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnamneses();
  }, []);

  useEffect(() => {
    filterAnamneses();
  }, [searchTerm, anamneses]);

  const loadAnamneses = async () => {
    try {
      // Use anamnesis_applications instead of anamnesis for the new structure
      const { data, error } = await supabase
        .from('anamnesis_applications')
        .select(`
          *,
          patient:profiles!anamnesis_applications_patient_id_fkey(name, email),
          template:anamnesis_templates!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const convertedAnamneses: Anamnesis[] = (data || []).map(app => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        sent_at: app.sent_at,
        completed_at: app.completed_at,
        locked_at: app.locked_at,
        patient: app.patient ? {
          name: app.patient.name,
          email: app.patient.email,
        } : null,
        template: app.template ? {
          name: app.template.name,
        } : null,
      }));
      
      setAnamneses(convertedAnamneses);
    } catch (error) {
      console.error('Erro ao carregar anamneses:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as anamneses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnamneses = () => {
    if (!searchTerm) {
      setFilteredAnamneses(anamneses);
      return;
    }

    const filtered = anamneses.filter(anamnesis =>
      anamnesis.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.patient?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAnamneses(filtered);
  };

  const handleStatusChange = async (anamnesisId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'locked') {
        updateData.locked_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('anamnesis_applications')
        .update(updateData)
        .eq('id', anamnesisId);

      if (error) throw error;

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: `Anamnese ${newStatus === 'locked' ? 'bloqueada' : 'finalizada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da anamnese",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnamnesis = async (anamnesisId: string) => {
    try {
      const { error } = await supabase
        .from('anamnesis_applications')
        .delete()
        .eq('id', anamnesisId);

      if (error) throw error;

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: "Anamnese deletada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a anamnese",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateAnamnesis = async (anamnesisId: string) => {
    try {
      const { data: originalAnamnesis, error: fetchError } = await supabase
        .from('anamnesis_applications')
        .select('*')
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error: insertError } = await supabase
        .from('anamnesis_applications')
        .insert({
          patient_id: originalAnamnesis.patient_id,
          psychologist_id: user.user.id,
          template_id: originalAnamnesis.template_id,
          responses: originalAnamnesis.responses,
          status: 'sent'
        });

      if (insertError) throw insertError;

      await loadAnamneses();
      toast({
        title: "Sucesso",
        description: "Anamnese duplicada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao duplicar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar a anamnese",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsTemplate = async (anamnesisId: string) => {
    try {
      const { data: application, error: fetchError } = await supabase
        .from('anamnesis_applications')
        .select(`
          *,
          template:anamnesis_templates!inner(sections)
        `)
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const templateName = `Template baseado em ${new Date().toLocaleDateString('pt-BR')}`;
      
      const { error: insertError } = await supabase
        .from('anamnesis_templates')
        .insert({
          psychologist_id: user.user.id,
          name: templateName,
          description: 'Template criado a partir de anamnese existente',
          sections: application.template?.sections || [],
          is_default: false
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Template criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar como template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar como template",
        variant: "destructive",
      });
    }
  };

  return {
    anamneses: filteredAnamneses,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleStatusChange,
    handleDeleteAnamnesis,
    handleDuplicateAnamnesis,
    handleSaveAsTemplate,
    loadAnamneses,
  };
};
