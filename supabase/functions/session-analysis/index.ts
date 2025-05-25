
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
    const { transcript, sessionId, psychologistId } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Análise de sentimentos
    const sentimentAnalysis = await analyzeSentiment(transcript, openAIApiKey)
    
    // Identificação de padrões emocionais
    const emotionalPatterns = await identifyEmotionalPatterns(transcript, openAIApiKey)
    
    // Sugestões de intervenções
    const interventionSuggestions = await generateInterventionSuggestions(transcript, openAIApiKey)
    
    // Insights principais
    const keyInsights = await extractKeyInsights(transcript, openAIApiKey)

    const analysis = {
      sentiment: sentimentAnalysis,
      emotional_patterns: emotionalPatterns,
      interventions: interventionSuggestions,
      insights: keyInsights,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({
        analysis,
        sentiment_score: sentimentAnalysis.score,
        summary: keyInsights.summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in session-analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function analyzeSentiment(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analise o sentimento da sessão de terapia. Retorne um JSON com: score (0-10), dominant_emotion, secondary_emotions, confidence.'
        },
        {
          role: 'user',
          content: `Analise o sentimento desta transcrição: ${text}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    }),
  })

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0]?.message?.content || '{}')
  } catch {
    return { score: 5, dominant_emotion: 'neutral', confidence: 0.5 }
  }
}

async function identifyEmotionalPatterns(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Identifique padrões emocionais na sessão. Retorne JSON com: recurring_themes, emotional_triggers, coping_mechanisms, progress_indicators.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 600,
      temperature: 0.2
    }),
  })

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0]?.message?.content || '{}')
  } catch {
    return { recurring_themes: [], emotional_triggers: [], coping_mechanisms: [] }
  }
}

async function generateInterventionSuggestions(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Sugira intervenções terapêuticas baseadas na sessão. Retorne JSON com: immediate_interventions, homework_suggestions, follow_up_focus, techniques_to_explore.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 700,
      temperature: 0.3
    }),
  })

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0]?.message?.content || '{}')
  } catch {
    return { immediate_interventions: [], homework_suggestions: [], follow_up_focus: [] }
  }
}

async function extractKeyInsights(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extraia insights principais da sessão. Retorne JSON com: summary, breakthrough_moments, resistance_points, therapeutic_alliance, next_session_focus.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 800,
      temperature: 0.2
    }),
  })

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0]?.message?.content || '{}')
  } catch {
    return { summary: 'Sessão realizada', breakthrough_moments: [], resistance_points: [] }
  }
}
