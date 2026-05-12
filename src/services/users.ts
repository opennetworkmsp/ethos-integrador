import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/hooks/use-auth'

export const getProfiles = async () => {
  const { data, error } = await supabase.from('profiles').select('*').order('email')
  if (error) throw error
  return data as Profile[]
}

export const updateProfileRole = async (id: string, role: string) => {
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
  return data
}

export const manageUser = async (payload: any) => {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    body: payload,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
