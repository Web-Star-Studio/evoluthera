
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDemoPatients = async (psychologistId: string) => {
    const patients = [
      {
        name: 'Maria Silva Santos',
        email: 'maria.silva@demo.com',
        moodPattern: [4, 3, 4, 5, 4, 3, 4, 4, 3, 4, 5, 4, 3, 2], // Estável com leve queda
        scenario: 'stable',
        lastActivity: 1
      },
      {
        name: 'João Pedro Costa',
        email: 'joao.costa@demo.com',
        moodPattern: [2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 1, 2, 1, 1], // Crítico
        scenario: 'critical',
        lastActivity: 0
      },
      {
        name: 'Ana Carolina Lima',
        email: 'ana.lima@demo.com',
        moodPattern: [2, 3, 3, 4, 4, 5, 4, 5, 5, 4, 5, 5, 4, 5], // Em melhora
        scenario: 'improving',
        lastActivity: 2
      },
      {
        name: 'Carlos Eduardo Rocha',
        email: 'carlos.rocha@demo.com',
        moodPattern: [3, 2, 3, 2, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2], // Humor baixo
        scenario: 'low_mood',
        lastActivity: 3
      },
      {
        name: 'Fernanda Oliveira',
        email: 'fernanda.oliveira@demo.com',
        moodPattern: [5, 4, 5, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5, 4], // Muito estável
        scenario: 'very_stable',
        lastActivity: 1
      },
      {
        name: 'Roberto Santos Junior',
        email: 'roberto.junior@demo.com',
        moodPattern: [3, 4, 2, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 2], // Inconsistente
        scenario: 'inconsistent',
        lastActivity: 4
      },
      {
        name: 'Patrícia Mendes',
        email: 'patricia.mendes@demo.com',
        moodPattern: [1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1], // Muito crítico
        scenario: 'very_critical',
        lastActivity: 0
      },
      {
        name: 'Lucas Gabriel Ferreira',
        email: 'lucas.ferreira@demo.com',
        moodPattern: [3, 3, 4, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4], // Progresso lento
        scenario: 'slow_progress',
        lastActivity: 2
      }
    ];

    const createdPatients = [];

    for (const patient of patients) {
      try {
        // Criar usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: patient.email,
          password: 'demo123',
          options: {
            data: {
              name: patient.name,
              user_type: 'patient'
            }
          }
        });

        if (signUpError && signUpError.message !== 'User already registered') {
          console.error('Erro criando paciente:', patient.name, signUpError);
          continue;
        }

        let userId = signUpData.user?.id;
        
        if (!userId) {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', patient.email)
            .single();
          userId = existingUser?.id;
        }

        if (!userId) continue;

        // Criar perfil
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: patient.name,
            email: patient.email,
            user_type: 'patient'
          });

        // Criar vínculo com psicólogo
        await supabase
          .from('patients')
          .upsert({
            patient_id: userId,
            psychologist_id: psychologistId,
            status: 'active'
          });

        // Limpar dados existentes
        await supabase.from('mood_records').delete().eq('patient_id', userId);
        await supabase.from('tasks').delete().eq('patient_id', userId);
        await supabase.from('diary_entries').delete().eq('patient_id', userId);

        // Criar registros de humor dos últimos 14 dias
        const moodRecords = patient.moodPattern.map((score, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (13 - index));
          
          const notes = {
            1: 'Dia muito difícil, sentindo-me desanimado(a)',
            2: 'Humor baixo, mas tentando manter a rotina',
            3: 'Dia neutro, algumas oscilações de humor',
            4: 'Sentindo-me bem, mais motivado(a)',
            5: 'Excelente dia, muito positivo(a) e produtivo(a)'
          };

          return {
            patient_id: userId,
            mood_score: score,
            notes: notes[score as keyof typeof notes],
            created_at: date.toISOString()
          };
        });

        await supabase.from('mood_records').insert(moodRecords);

        // Criar tarefas baseadas no cenário
        const tasks = [];
        
        if (patient.scenario === 'critical' || patient.scenario === 'very_critical') {
          tasks.push(
            {
              patient_id: userId,
              psychologist_id: psychologistId,
              title: 'Técnicas de Estabilização',
              description: 'Pratique exercícios de respiração e grounding quando sentir ansiedade',
              status: 'pending',
              priority: 'high',
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
              patient_id: userId,
              psychologist_id: psychologistId,
              title: 'Monitoramento de Humor',
              description: 'Registre seu humor 3x ao dia com observações detalhadas',
              status: 'pending',
              priority: 'high',
              due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            }
          );
        }

        if (patient.scenario === 'improving' || patient.scenario === 'slow_progress') {
          tasks.push(
            {
              patient_id: userId,
              psychologist_id: psychologistId,
              title: 'Diário de Conquistas',
              description: 'Liste 3 pequenas conquistas ou momentos positivos do dia',
              status: patient.lastActivity <= 1 ? 'completed' : 'pending',
              completed_at: patient.lastActivity <= 1 ? new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() : null
            }
          );
        }

        // Tarefas gerais
        tasks.push(
          {
            patient_id: userId,
            psychologist_id: psychologistId,
            title: 'Atividade Física',
            description: 'Caminhe por 20 minutos ao ar livre',
            status: patient.lastActivity <= 2 ? 'completed' : 'pending',
            completed_at: patient.lastActivity <= 2 ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() : null
          },
          {
            patient_id: userId,
            psychologist_id: psychologistId,
            title: 'Reflexão Semanal',
            description: 'Reflita sobre os progressos e desafios da semana',
            status: 'pending',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        );

        if (tasks.length > 0) {
          await supabase.from('tasks').insert(tasks);
        }

        // Criar entradas de diário
        const diaryEntries = [];
        
        if (patient.scenario !== 'very_critical') {
          diaryEntries.push({
            patient_id: userId,
            content: patient.scenario === 'improving' 
              ? 'Hoje foi um dia melhor. Consegui completar minhas tarefas e me senti mais motivado(a).'
              : patient.scenario === 'critical'
              ? 'Dia difícil. Tentei usar as técnicas que aprendemos, mas ainda me sinto sobrecarregado(a).'
              : 'Dia normal. Algumas altas e baixas, mas no geral consegui manter o equilíbrio.',
            mood_score: patient.moodPattern[patient.moodPattern.length - 1],
            created_at: new Date(Date.now() - patient.lastActivity * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        if (diaryEntries.length > 0) {
          await supabase.from('diary_entries').insert(diaryEntries);
        }

        // Criar estatísticas do paciente
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const streakDays = patient.scenario === 'very_stable' ? 14 : 
                          patient.scenario === 'improving' ? 7 :
                          patient.scenario === 'critical' ? 2 : 5;

        await supabase.from('patient_stats').upsert({
          patient_id: userId,
          tasks_completed: completedTasks,
          streak_days: streakDays,
          mood_records_count: patient.moodPattern.length,
          diary_entries_count: diaryEntries.length,
          total_points: completedTasks * 10 + streakDays * 5,
          last_activity: new Date(Date.now() - patient.lastActivity * 24 * 60 * 60 * 1000).toISOString()
        });

        createdPatients.push({ name: patient.name, email: patient.email, scenario: patient.scenario });

      } catch (error) {
        console.error('Erro criando paciente demo:', patient.name, error);
      }
    }

    return createdPatients;
  };

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

        // Criar pacientes demo
        const demoPatients = await createDemoPatients(userId);

        toast({
          title: "Conta demo de psicólogo criada",
          description: `Login: ${testEmail} | Senha: ${testPassword} | ${demoPatients.length} pacientes criados`,
        });

        return { email: testEmail, password: testPassword, patients: demoPatients };
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
    createDemoPatients,
    loading 
  };
};
