
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnamnesisApplication } from "@/types/anamnesis";

export const useAnamnesisApplications = () => {
  const [applications, setApplications] = useState<AnamnesisApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('anamnesis_applications')
        .select(`
          *,
          template:anamnesis_templates(name, description),
          patient:profiles!anamnesis_applications_patient_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert the data to match our types
      const convertedApplications: AnamnesisApplication[] = (data || []).map(app => ({
        ...app,
        responses: app.responses as Record<string, any>,
        psychologist_notes: app.psychologist_notes as Record<string, string>,
        template: app.template ? {
          name: app.template.name,
          description: app.template.description || undefined,
        } : undefined,
        patient: app.patient ? {
          name: app.patient.name,
          email: app.patient.email,
        } : undefined,
      }));
      
      setApplications(convertedApplications);
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aplicações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createApplication = async (templateId: string, patientId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('anamnesis_applications')
        .insert({
          template_id: templateId,
          patient_id: patientId,
          psychologist_id: user.user.id,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;

      await loadApplications();
      toast({
        title: "Sucesso",
        description: "Anamnese enviada para o paciente",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar aplicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a anamnese",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'locked') {
        updates.locked_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('anamnesis_applications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadApplications();
      toast({
        title: "Sucesso",
        description: `Status atualizado para ${status}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addPsychologistNote = async (applicationId: string, fieldId: string, note: string) => {
    try {
      // Primeiro, buscar as notas atuais
      const { data: currentApp, error: fetchError } = await supabase
        .from('anamnesis_applications')
        .select('psychologist_notes')
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      const currentNotes = (currentApp.psychologist_notes as Record<string, string>) || {};
      currentNotes[fieldId] = note;

      const { error } = await supabase
        .from('anamnesis_applications')
        .update({ psychologist_notes: currentNotes })
        .eq('id', applicationId);

      if (error) throw error;

      await loadApplications();
      toast({
        title: "Sucesso",
        description: "Anotação salva",
      });
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anotação",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    applications,
    isLoading,
    loadApplications,
    createApplication,
    updateApplicationStatus,
    addPsychologistNote,
  };
};
