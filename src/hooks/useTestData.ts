import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTestPatient = async () => {
    try {
      setLoading(true);

      const testEmail = 'paciente.demo@evolut.com';
      const testPassword = 'demo123';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Maria Silva',
            user_type: 'patient'
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      let userId = signUpData.user?.id;
      
      // Se usuário já existe, buscar o ID
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testEmail)
          .single();
        userId = existingUser?.id;
      }

      if (userId) {
        // Upsert profile
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: 'Maria Silva',
            email: testEmail,
            user_type: 'patient'
          });

        // Limpar dados existentes
        await supabase.from('mood_records').delete().eq('patient_id', userId);
        await supabase.from('tasks').delete().eq('patient_id', userId);
        await supabase.from('diary_entries').delete().eq('patient_id', userId);

        // Criar registros de humor dos últimos 14 dias
        const moodRecords = [];
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          moodRecords.push({
            patient_id: userId,
            mood_score: Math.floor(Math.random() * 5) + 1,
            notes: `Humor do dia ${14 - i}. ${i % 3 === 0 ? 'Dia produtivo!' : i % 2 === 0 ? 'Dia tranquilo.' : 'Sentindo-me bem.'}`,
            created_at: date.toISOString()
          });
        }

        await supabase.from('mood_records').insert(moodRecords);

        // Criar tarefas variadas
        const tasks = [
          {
            patient_id: userId,
            psychologist_id: userId,
            title: 'Diário de Gratidão',
            description: 'Escreva 3 coisas pelas quais você é grato hoje',
            status: 'pending',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          {
            patient_id: userId,
            psychologist_id: userId,
            title: 'Exercício de Respiração',
            description: 'Pratique a respiração profunda por 10 minutos',
            status: 'completed',
            completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            patient_id: userId,
            psychologist_id: userId,
            title: 'Caminhada ao Ar Livre',
            description: 'Faça uma caminhada de 30 minutos em contato com a natureza',
            status: 'completed',
            completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            patient_id: userId,
            psychologist_id: userId,
            title: 'Reflexão Semanal',
            description: 'Reflita sobre os pontos altos e baixos da semana',
            status: 'pending',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        await supabase.from('tasks').insert(tasks);

        // Criar entradas de diário
        const diaryEntries = [
          {
            patient_id: userId,
            content: 'Hoje foi um dia desafiador, mas consegui superar as dificuldades. Estou orgulhosa do meu progresso.',
            mood_score: 4,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            patient_id: userId,
            content: 'Senti muita ansiedade pela manhã, mas as técnicas de respiração ajudaram muito.',
            mood_score: 3,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        await supabase.from('diary_entries').insert(diaryEntries);

        toast({
          title: "Conta demo de paciente criada",
          description: `Login: ${testEmail} | Senha: ${testPassword}`,
        });

        return { email: testEmail, password: testPassword };
      }
    } catch (error: any) {
      console.error('Error creating test patient:', error);
      toast({
        title: "Erro ao criar conta demo",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTestPsychologist = async () => {
    try {
      setLoading(true);

      const testEmail = 'psicologo.demo@evolut.com';
      const testPassword = 'demo123';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Dr. João Santos',
            user_type: 'psychologist',
            crp: 'CRP 01/12345'
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      let userId = signUpData.user?.id;
      
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testEmail)
          .single();
        userId = existingUser?.id;
      }

      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: 'Dr. João Santos',
            email: testEmail,
            user_type: 'psychologist'
          });

        // Criar configurações de chat
        await supabase
          .from('chat_settings')
          .upsert({
            psychologist_id: userId,
            chat_enabled: true,
            daily_message_limit: 15,
            max_message_length: 1000,
            auto_response_enabled: true,
            auto_response_message: 'Obrigado pela sua mensagem. Responderei em breve!'
          });

        // Criar templates de tarefas
        const taskTemplates = [
          {
            psychologist_id: userId,
            name: 'Diário de Humor',
            description: 'Registre seu humor diário e reflita sobre os fatores que influenciam suas emoções',
            category: 'Automonitoramento',
            task_type: 'text',
            estimated_duration: 10,
            is_public: false
          },
          {
            psychologist_id: userId,
            name: 'Técnicas de Relaxamento',
            description: 'Pratique exercícios de respiração e relaxamento muscular progressivo',
            category: 'Técnicas Terapêuticas',
            task_type: 'text',
            estimated_duration: 20,
            is_public: false
          }
        ];

        await supabase.from('task_templates').upsert(taskTemplates);

        toast({
          title: "Conta demo de psicólogo criada",
          description: `Login: ${testEmail} | Senha: ${testPassword}`,
        });

        return { email: testEmail, password: testPassword };
      }
    } catch (error: any) {
      console.error('Error creating test psychologist:', error);
      toast({
        title: "Erro ao criar conta demo",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTestAdmin = async () => {
    try {
      setLoading(true);

      const testEmail = 'admin.demo@evolut.com';
      const testPassword = 'demo123';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Admin Sistema',
            user_type: 'admin'
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      let userId = signUpData.user?.id;
      
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testEmail)
          .single();
        userId = existingUser?.id;
      }

      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: 'Admin Sistema',
            email: testEmail,
            user_type: 'admin'
          });

        toast({
          title: "Conta demo de admin criada",
          description: `Login: ${testEmail} | Senha: ${testPassword}`,
        });

        return { email: testEmail, password: testPassword };
      }
    } catch (error: any) {
      console.error('Error creating test admin:', error);
      toast({
        title: "Erro ao criar conta demo",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = async (userType: 'patient' | 'psychologist' | 'admin') => {
    try {
      setLoading(true);
      
      const credentials = {
        patient: { email: 'paciente.demo@evolut.com', password: 'demo123' },
        psychologist: { email: 'psicologo.demo@evolut.com', password: 'demo123' },
        admin: { email: 'admin.demo@evolut.com', password: 'demo123' }
      };

      const { email, password } = credentials[userType];

      // Limpar estado de autenticação
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing with signin');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Login demo realizado",
          description: `Conectado como ${userType === 'patient' ? 'Paciente' : userType === 'psychologist' ? 'Psicólogo' : 'Admin'}`,
        });
        
        // Determine dashboard route based on user type
        const dashboardRoutes = {
          patient: '/patient-dashboard',
          psychologist: '/psychologist-dashboard',
          admin: '/admin-dashboard'
        };
        
        window.location.href = dashboardRoutes[userType];
      }
    } catch (error: any) {
      console.error('Error logging in as demo user:', error);
      toast({
        title: "Erro no login demo",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createTestPatient, 
    createTestPsychologist, 
    createTestAdmin, 
    loginAsDemoUser, 
    loading 
  };
};
