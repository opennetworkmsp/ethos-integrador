import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Tratamento de requisições de preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Unauthorized: Authorization header is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Server configuration error: Missing Supabase variables')
    }

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

    const payload = await req.json().catch(() => null)
    if (!payload) {
      throw new Error('Bad Request: Invalid JSON body')
    }

    const {
      nome_condominio,
      id_condominio_interno,
      id_condominio_externo,
      arquivo_base64,
      filename,
      contentType,
    } = payload

    if (!nome_condominio || !id_condominio_interno || !id_condominio_externo || !arquivo_base64) {
      throw new Error(
        'Bad Request: Missing required fields (nome_condominio, id_condominio_interno, id_condominio_externo, arquivo_base64)',
      )
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_UPLOAD_FILES')

    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_UPLOAD_FILES is not configured.')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Simulated webhook upload, N8N_WEBHOOK_UPLOAD_FILES not configured',
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
        arquivo_base64,
        filename: filename || 'document.pdf',
        contentType: contentType || 'application/pdf',
        user_id: user.id,
        user_email: user.email,
      }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`Erro ao comunicar com o N8n. Status: ${response.status} - ${responseText}`)
    }

    let responseData: any = responseText
    try {
      if (responseText) {
        responseData = JSON.parse(responseText)
      }
    } catch (e) {
      // Retorna como texto se a resposta não for um JSON válido
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in upload-files-agent function:', error)

    let status = 400
    if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid JWT')) {
      status = 401
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Erro inesperado no servidor.' }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
