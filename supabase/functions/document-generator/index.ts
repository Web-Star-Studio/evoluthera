
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionData, patientId, documentType, customPrompt } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Preparar dados para análise
    const contextData = {
      mood_records: sessionData.moodRecords || [],
      diary_entries: sessionData.diaryEntries || [],
      tasks_completed: sessionData.tasksCompleted || [],
      chat_messages: sessionData.chatMessages || [],
      session_notes: sessionData.sessionNotes || '',
      patient_profile: sessionData.patientProfile || {}
    }

    // Prompt baseado no tipo de documento
    const prompts = {
      sessao: `Como psicólogo, gere um relatório de sessão baseado nos seguintes dados:
        ${JSON.stringify(contextData, null, 2)}
        
        O relatório deve incluir:
        1. Resumo da sessão
        2. Estado emocional observado
        3. Principais temas discutidos
        4. Progressos identificados
        5. Plano para próxima sessão
        6. Observações clínicas relevantes
        
        Formato: Texto estruturado e profissional, conforme normas do CFP.`,
      
      progresso: `Analise os dados do paciente e gere um relatório de progresso:
        ${JSON.stringify(contextData, null, 2)}
        
        O relatório deve incluir:
        1. Evolução do quadro clínico
        2. Análise de tendências de humor
        3. Aderência às atividades terapêuticas
        4. Marcos de progresso alcançados
        5. Áreas que necessitam atenção
        6. Recomendações para continuidade do tratamento`,
      
      laudo: `Gere um laudo psicológico baseado nos dados coletados:
        ${JSON.stringify(contextData, null, 2)}
        
        O laudo deve seguir as normas do CFP e incluir:
        1. Identificação do paciente
        2. Motivo da avaliação
        3. Procedimentos utilizados
        4. Análise dos resultados
        5. Conclusões
        6. Recomendações`,
      
      parecer: `Elabore um parecer psicológico técnico:
        ${JSON.stringify(contextData, null, 2)}
        
        O parecer deve conter:
        1. Situação analisada
        2. Fundamentação teórica
        3. Análise técnica
        4. Conclusão
        5. Recomendações específicas`,
      
      relatorio: `Crie um relatório clínico abrangente:
        ${JSON.stringify(contextData, null, 2)}
        
        O relatório deve abordar:
        1. Histórico do atendimento
        2. Evolução do paciente
        3. Intervenções realizadas
        4. Resultados obtidos
        5. Prognóstico
        6. Continuidade do tratamento`
    }

    const selectedPrompt = customPrompt || prompts[documentType as keyof typeof prompts] || prompts.sessao

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em documentação clínica psicológica. Mantenha sempre o sigilo profissional e siga as diretrizes éticas do CFP. Gere documentos técnicos, objetivos e profissionais.'
          },
          {
            role: 'user',
            content: selectedPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API do OpenAI')
    }

    const generatedContent = data.choices[0]?.message?.content

    // Verificar conformidade com CFP (análise básica)
    const complianceCheck = await checkCFPCompliance(generatedContent)

    return new Response(
      JSON.stringify({
        content: generatedContent,
        compliance: complianceCheck,
        wordCount: generatedContent.split(' ').length,
        generated_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in document-generator:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function checkCFPCompliance(content: string) {
  const complianceRules = [
    { rule: 'Sigilo profissional', check: !content.includes('nome real') && !content.includes('CPF') },
    { rule: 'Linguagem técnica', check: content.includes('observação clínica') || content.includes('processo terapêutico') },
    { rule: 'Estrutura profissional', check: content.length > 200 },
    { rule: 'Objetividade', check: !content.includes('eu acho') && !content.includes('talvez') }
  ]

  const passedRules = complianceRules.filter(rule => rule.check)
  const complianceScore = (passedRules.length / complianceRules.length) * 100

  return {
    score: complianceScore,
    status: complianceScore >= 80 ? 'compliant' : 'needs_review',
    details: complianceRules.map(rule => ({
      rule: rule.rule,
      passed: rule.check
    }))
  }
}
