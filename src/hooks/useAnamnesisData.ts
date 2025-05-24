
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Anamnesis } from "@/types/anamnesis";

export const useAnamnesisData = () => {
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    loadAnamneses();
  }, []);

  return {
    anamneses,
    isLoading,
    loadAnamneses,
  };
};
