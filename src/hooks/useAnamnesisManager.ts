
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Load both old anamnesis table and new applications table
      const [oldAnamnesisResult, applicationsResult] = await Promise.all([
        supabase
          .from('anamnesis')
          .select(`
            *,
            patient:profiles!anamnesis_patient_id_fkey(name, email),
            template:anamnesis_templates(name)
          `)
          .eq('psychologist_id', user.user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('anamnesis_applications')
          .select(`
            *,
            patient:profiles!anamnesis_applications_patient_id_fkey(name, email),
            template:anamnesis_templates(name)
          `)
          .eq('psychologist_id', user.user.id)
          .order('created_at', { ascending: false })
      ]);

      const combinedData = [
        ...(oldAnamnesisResult.data || []),
        ...(applicationsResult.data || [])
      ];

      const typedAnamneses: Anamnesis[] = combinedData.map(item => ({
        id: item.id,
        status: item.status || 'draft',
        created_at: item.created_at,
        sent_at: item.sent_at,
        completed_at: item.completed_at,
        locked_at: item.locked_at,
        patient: {
          name: item.patient?.name || 'Paciente não encontrado',
          email: item.patient?.email || ''
        },
        template: {
          name: item.template?.name || 'Template não encontrado'
        }
      }));

      setAnamneses(typedAnamneses);
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

      // Try to update in both tables (one will succeed, one will fail gracefully)
      await Promise.allSettled([
        supabase.from('anamnesis').update(updateData).eq('id', anamnesisId),
        supabase.from('anamnesis_applications').update(updateData).eq('id', anamnesisId)
      ]);

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
      // Try to delete from both tables
      await Promise.allSettled([
        supabase.from('anamnesis').delete().eq('id', anamnesisId),
        supabase.from('anamnesis_applications').delete().eq('id', anamnesisId)
      ]);

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
      // This function would need to be implemented based on requirements
      toast({
        title: "Info",
        description: "Funcionalidade de duplicação será implementada em breve",
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
      // This function would need to be implemented based on requirements
      toast({
        title: "Info",
        description: "Funcionalidade de salvar como template será implementada em breve",
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
