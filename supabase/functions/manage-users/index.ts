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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const payload = await req.json()
    const { action } = payload

    if (action === 'update-profile') {
      const { full_name, password } = payload

      const updateData: any = {}
      if (password) updateData.password = password
      if (full_name !== undefined) {
        updateData.user_metadata = { full_name }
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, updateData)
        if (error) throw error
      }

      if (full_name !== undefined) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ full_name })
          .eq('id', user.id)
        if (profileError) throw profileError
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'administrador') {
      throw new Error('Forbidden: Only admins can manage users')
    }

    if (action === 'create') {
      const { email, password, full_name, role } = payload
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      })
      if (error) throw error
      return new Response(JSON.stringify({ success: true, user: newUser }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      const { id, email, password, full_name, role } = payload
      const updateData: any = {}
      if (email) updateData.email = email
      if (password) updateData.password = password

      const metaUpdate: any = {}
      if (full_name !== undefined) metaUpdate.full_name = full_name
      if (role !== undefined) metaUpdate.role = role

      if (Object.keys(metaUpdate).length > 0) {
        updateData.user_metadata = metaUpdate
      }

      const { data: updatedUser, error } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateData,
      )
      if (error) throw error

      const profileUpdate: any = {}
      if (full_name !== undefined) profileUpdate.full_name = full_name
      if (role !== undefined) profileUpdate.role = role
      if (email !== undefined) profileUpdate.email = email

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id)
      if (profileError) throw profileError

      return new Response(JSON.stringify({ success: true, user: updatedUser }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { id } = payload
      if (id === user.id) {
        throw new Error('Cannot delete your own user')
      }
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
