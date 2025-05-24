
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTestPatient = async () => {
    try {
      setLoading(true);

      // Create a test patient account
      const testEmail = `paciente.teste@evolut.com`;
      const testPassword = 'teste123';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Paciente Teste',
            user_type: 'patient'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating test patient:', signUpError);
        throw signUpError;
      }

      if (signUpData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signUpData.user.id,
            name: 'Paciente Teste',
            email: testEmail,
            user_type: 'patient'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Create some test mood records
        const moodRecords = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          moodRecords.push({
            patient_id: signUpData.user.id,
            mood_score: Math.floor(Math.random() * 5) + 1,
            notes: `Humor do dia ${7 - i}`,
            created_at: date.toISOString()
          });
        }

        const { error: moodError } = await supabase
          .from('mood_records')
          .insert(moodRecords);

        if (moodError) {
          console.error('Error creating mood records:', moodError);
        }

        // Create some test tasks
        const tasks = [
          {
            patient_id: signUpData.user.id,
            psychologist_id: signUpData.user.id, // Using same ID for simplicity
            title: 'Diário de Gratidão',
            description: 'Escreva 3 coisas pelas quais você é grato hoje',
            status: 'pending',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          {
            patient_id: signUpData.user.id,
            psychologist_id: signUpData.user.id,
            title: 'Exercício de Respiração',
            description: 'Pratique a respiração profunda por 10 minutos',
            status: 'completed',
            completed_at: new Date().toISOString()
          }
        ];

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasks);

        if (tasksError) {
          console.error('Error creating tasks:', tasksError);
        }

        toast({
          title: "Dados de teste criados",
          description: `Paciente teste criado: ${testEmail} / ${testPassword}`,
        });

        return { email: testEmail, password: testPassword };
      }
    } catch (error: any) {
      console.error('Error creating test data:', error);
      toast({
        title: "Erro ao criar dados de teste",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createTestPatient, loading };
};
