import { supabase } from '@/lib/supabase/client'

export interface AuditoriaMensagem {
  id: string
  telefone_origem: string | null
  telefone_destino: string | null
  organizacao_id: string | null
  template_id: string | null
  nome_cliente: string | null
  condominio: string | null
  vencimento: string | null
  link_boleto: string | null
  unidade: string | null
  created_at: string
  user_id: string | null
}

export async function getAuditoriaMensagens(): Promise<AuditoriaMensagem[]> {
  const { data, error } = await supabase
    .from('auditoria_mensagens')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as AuditoriaMensagem[]
}
