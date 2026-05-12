import { supabase } from '@/lib/supabase/client'

export interface Condominio {
  id: string
  id_condominio_interno: string
  id_condominio_externo: string
  nome_condominio: string
  created_at: string
}

export const getCondominios = async () => {
  // Using 'as any' since condominios table is dynamically created via migration
  // and not present in auto-generated types
  const { data, error } = await supabase
    .from('condominios' as any)
    .select('*')
    .order('nome_condominio', { ascending: true })

  if (error) throw error
  return data as Condominio[]
}
