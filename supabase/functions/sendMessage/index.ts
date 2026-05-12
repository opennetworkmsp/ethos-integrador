import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Unauthorized: Authorization header is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid JWT')
    }

    const payload = await req.json()
    const { nome_condominio, id_condominio_interno, id_condominio_externo } = payload

    if (!nome_condominio || !id_condominio_interno || !id_condominio_externo) {
      throw new Error(
        'Bad Request: Missing required fields (nome_condominio, id_condominio_interno, id_condominio_externo)',
      )
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL')

    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not configured.')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Simulated webhook, N8N_WEBHOOK_URL not configured',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome_condominio,
        id_condominio_interno,
        id_condominio_externo,
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`N8N responded with status: ${response.status} - ${responseText}`)
    }

    return new Response(JSON.stringify({ success: true, data: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in sendMessage function:', error)
    const status = error.message?.includes('Unauthorized') ? 401 : 400
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
