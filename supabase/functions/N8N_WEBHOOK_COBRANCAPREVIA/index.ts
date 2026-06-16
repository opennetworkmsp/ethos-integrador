import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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
    const { nome_condominio, id_condominio_interno, id_condominio_externo, data_inicio, data_fim } =
      payload

    if (!nome_condominio || !id_condominio_interno || !id_condominio_externo) {
      throw new Error(
        'Bad Request: Missing required fields (nome_condominio, id_condominio_interno, id_condominio_externo)',
      )
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_COBRANCAPREVIA')

    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_COBRANCAPREVIA is not configured.')
      // Retornar mock para fins de desenvolvimento quando a URL não estiver configurada
      return new Response(
        JSON.stringify({
          success: true,
          data: Array.from({ length: 45 }).map((_, i) => ({
            NomeCliente: `Morador Simulado ${i + 1}`,
            Unidade: `${100 + i}`,
            Valor: `R$ ${(150 + i * 10).toFixed(2)}`,
            Vencimento: new Date().toLocaleDateString('pt-BR'),
            Telefone: `119999999${i.toString().padStart(2, '0')}`,
          })),
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
        data_inicio,
        data_fim,
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`N8N responded with status: ${response.status} - ${responseText}`)
    }

    let responseData = null
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.warn('N8N response is not JSON:', responseText)
    }

    return new Response(JSON.stringify({ success: true, data: responseData || responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in N8N_WEBHOOK_COBRANCAPREVIA function:', error)
    const status = error.message?.includes('Unauthorized') ? 401 : 400
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
