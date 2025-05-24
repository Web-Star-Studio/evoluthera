
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAnamnesisActions = (loadAnamneses: () => Promise<void>) => {
  const { toast } = useToast();

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
    handleStatusChange,
    handleDeleteAnamnesis,
    handleDuplicateAnamnesis,
    handleSaveAsTemplate,
  };
};
