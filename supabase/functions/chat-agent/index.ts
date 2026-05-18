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
    const { message, action, id, id_condominio_externo, descricao } = payload

    if (!message && action !== 'analyze_notification') {
      throw new Error('Bad Request: Missing required field (message)')
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_CHAT')

    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_CHAT is not configured.')
      return new Response(
        JSON.stringify({
          success: true,
          reply: `Esta é uma resposta simulada. Para o funcionamento real, configure N8N_WEBHOOK_CHAT nas variáveis de ambiente.`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const bodyPayload =
      action === 'analyze_notification'
        ? {
            action,
            id,
            id_condominio_externo,
            descricao,
            user_id: user.id,
            timestamp: new Date().toISOString(),
          }
        : {
            message,
            user_id: user.id,
            timestamp: new Date().toISOString(),
          }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`N8N responded with status: ${response.status} - ${responseText}`)
    }

    let responseData = null
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = responseText
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in chat-agent function:', error)
    const status = error.message?.includes('Unauthorized') ? 401 : 400
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
