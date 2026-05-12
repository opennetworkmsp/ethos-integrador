import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL')

    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not configured in Edge Function.')
      return new Response(
        JSON.stringify({ success: true, message: 'Simulated webhook, URL not configured' }),
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
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`N8N responded with status: ${response.status} - ${responseText}`)
    }

    return new Response(JSON.stringify({ success: true, data: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error triggering webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
