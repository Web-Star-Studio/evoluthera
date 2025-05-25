
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patientId, psychologistId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Buscar dados do paciente dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [moodData, diaryData, chatData, tasksData] = await Promise.all([
      supabaseClient
        .from('mood_records')
        .select('mood_score, created_at, notes')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabaseClient
        .from('diary_entries')
        .select('content, mood_score, created_at')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabaseClient
        .from('chat_messages')
        .select('message_content, created_at')
        .eq('sender_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabaseClient
        .from('tasks')
        .select('status, completed_at, created_at')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo.toISOString())
    ])

    // Calcular indicadores de risco
    const riskIndicators = calculateRiskIndicators({
      moodRecords: moodData.data || [],
      diaryEntries: diaryData.data || [],
      chatMessages: chatData.data || [],
      tasks: tasksData.data || []
    })

    // Calcular score de risco total
    const riskScore = calculateOverallRiskScore(riskIndicators)
    const riskLevel = getRiskLevel(riskScore)

    // Gerar plano de intervenção se necessário
    let interventionPlan = null
    if (riskScore >= 30) {
      interventionPlan = generateInterventionPlan(riskLevel, riskIndicators)
    }

    // Salvar predição no banco
    const { data: prediction, error } = await supabaseClient
      .from('crisis_predictions')
      .insert({
        patient_id: patientId,
        psychologist_id: psychologistId,
        risk_score: riskScore,
        risk_level: riskLevel,
        indicators: riskIndicators,
        intervention_plan: interventionPlan,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        prediction,
        alert: riskScore >= 70,
        recommendations: generateRecommendations(riskLevel)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in crisis-prediction:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function calculateRiskIndicators(data: any) {
  const indicators = []

  // Análise de humor
  const moodScores = data.moodRecords.map((r: any) => r.mood_score)
  if (moodScores.length > 0) {
    const avgMood = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length
    const moodTrend = calculateTrend(moodScores)
    
    if (avgMood < 3) {
      indicators.push({ type: 'low_mood', severity: 'alto', value: avgMood })
    }
    if (moodTrend < -0.5) {
      indicators.push({ type: 'declining_mood', severity: 'medio', value: moodTrend })
    }
  }

  // Análise de atividade no diário
  const recentEntries = data.diaryEntries.filter((entry: any) => {
    const entryDate = new Date(entry.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  })

  if (recentEntries.length === 0) {
    indicators.push({ type: 'no_diary_activity', severity: 'medio', value: 0 })
  }

  // Análise de comunicação
  const recentMessages = data.chatMessages.filter((msg: any) => {
    const msgDate = new Date(msg.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return msgDate >= weekAgo
  })

  if (recentMessages.length === 0) {
    indicators.push({ type: 'communication_drop', severity: 'medio', value: 0 })
  }

  // Análise de tarefas
  const completedTasks = data.tasks.filter((task: any) => task.status === 'completed')
  const completionRate = data.tasks.length > 0 ? completedTasks.length / data.tasks.length : 0
  
  if (completionRate < 0.3) {
    indicators.push({ type: 'low_task_completion', severity: 'medio', value: completionRate })
  }

  return indicators
}

function calculateTrend(values: number[]) {
  if (values.length < 2) return 0
  
  const n = values.length
  const sumX = n * (n - 1) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
  const sumXX = n * (n - 1) * (2 * n - 1) / 6
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
}

function calculateOverallRiskScore(indicators: any[]) {
  const weights = {
    'low_mood': 25,
    'declining_mood': 20,
    'no_diary_activity': 15,
    'communication_drop': 15,
    'low_task_completion': 10
  }

  let totalScore = 0
  indicators.forEach(indicator => {
    const weight = weights[indicator.type as keyof typeof weights] || 5
    const severityMultiplier = {
      'baixo': 0.5,
      'medio': 1.0,
      'alto': 1.5,
      'critico': 2.0
    }[indicator.severity] || 1.0

    totalScore += weight * severityMultiplier
  })

  return Math.min(100, Math.max(0, totalScore))
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critico'
  if (score >= 60) return 'alto'
  if (score >= 30) return 'medio'
  return 'baixo'
}

function generateInterventionPlan(riskLevel: string, indicators: any[]) {
  const plans = {
    critico: `INTERVENÇÃO IMEDIATA NECESSÁRIA:
      1. Contato telefônico em 24h
      2. Avaliação presencial urgente
      3. Ativação de rede de apoio
      4. Monitoramento diário
      5. Considerar encaminhamento psiquiátrico`,
    
    alto: `INTERVENÇÃO PRIORITÁRIA:
      1. Reagendar sessão para esta semana
      2. Aumentar frequência de contato
      3. Atividades de estabilização emocional
      4. Revisão do plano terapêutico
      5. Envolvimento de familiares se apropriado`,
    
    medio: `MONITORAMENTO ATIVO:
      1. Check-in em 2-3 dias
      2. Atividades de autorregulação
      3. Reforço de estratégias de enfrentamento
      4. Acompanhar evolução dos indicadores
      5. Ajustar plano de tarefas`
  }

  return plans[riskLevel as keyof typeof plans] || plans.medio
}

function generateRecommendations(riskLevel: string) {
  const recommendations = {
    critico: [
      'Contato imediato com o paciente',
      'Considere atendimento presencial urgente',
      'Avalie necessidade de suporte psiquiátrico',
      'Ative rede de apoio do paciente'
    ],
    alto: [
      'Agendar sessão adicional esta semana',
      'Intensificar comunicação com o paciente',
      'Revisar estratégias terapêuticas',
      'Monitorar evolução diariamente'
    ],
    medio: [
      'Fazer check-in em 2-3 dias',
      'Propor atividades de estabilização',
      'Reforçar técnicas de enfrentamento',
      'Acompanhar indicadores'
    ],
    baixo: [
      'Manter cronograma regular',
      'Continuar monitoramento',
      'Reforçar progressos positivos'
    ]
  }

  return recommendations[riskLevel as keyof typeof recommendations] || recommendations.baixo
}
