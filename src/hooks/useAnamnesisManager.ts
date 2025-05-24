
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Anamnesis {
  id: string;
  status: string;
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
  };
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
      const { data, error } = await supabase
        .from('anamnesis')
        .select(`
          *,
          patient:profiles!anamnesis_patient_id_fkey(name, email),
          template:anamnesis_templates(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnamneses(data || []);
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
        .from('anamnesis')
        .update(updateData)
        .eq('id', anamnesisId);

      if (error) throw error;

      const anamnesis = anamneses.find(a => a.id === anamnesisId);
      if (anamnesis) {
        await supabase
          .from('anamnesis_notifications')
          .insert({
            anamnesis_id: anamnesisId,
            recipient_id: anamnesis.patient ? Object.values(anamnesis.patient)[0] : null,
            type: newStatus,
            message: `Anamnese ${newStatus === 'locked' ? 'bloqueada' : 'finalizada'}`
          });
      }

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
        .from('anamnesis')
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
        .from('anamnesis')
        .select('*')
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const { error: insertError } = await supabase
        .from('anamnesis')
        .insert({
          patient_id: originalAnamnesis.patient_id,
          psychologist_id: originalAnamnesis.psychologist_id,
          template_id: originalAnamnesis.template_id,
          data: originalAnamnesis.data,
          status: 'draft'
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
      const { data: anamnesis, error: fetchError } = await supabase
        .from('anamnesis')
        .select(`
          *,
          template:anamnesis_templates(fields)
        `)
        .eq('id', anamnesisId)
        .single();

      if (fetchError) throw fetchError;

      const templateName = `Template baseado em ${new Date().toLocaleDateString('pt-BR')}`;
      
      const { error: insertError } = await supabase
        .from('anamnesis_templates')
        .insert({
          psychologist_id: anamnesis.psychologist_id,
          name: templateName,
          description: 'Template criado a partir de anamnese existente',
          fields: anamnesis.template?.fields || {},
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
