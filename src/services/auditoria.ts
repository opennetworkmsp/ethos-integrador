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

export interface AuditoriaFiltros {
  dataInicio?: string
  dataFim?: string
  condominio?: string
  termoBusca?: string
}

export async function searchAuditoriaMensagens(
  filtros: AuditoriaFiltros,
): Promise<AuditoriaMensagem[]> {
  let query = supabase
    .from('auditoria_mensagens')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros.dataInicio) {
    query = query.gte('created_at', filtros.dataInicio)
  }

  if (filtros.dataFim) {
    const endDate = new Date(filtros.dataFim)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt('created_at', endDate.toISOString())
  }

  if (filtros.condominio) {
    query = query.ilike('condominio', `%${filtros.condominio}%`)
  }

  if (filtros.termoBusca) {
    query = query.or(
      `nome_cliente.ilike.%${filtros.termoBusca}%,telefone_destino.ilike.%${filtros.termoBusca}%,telefone_origem.ilike.%${filtros.termoBusca}%`,
    )
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data as AuditoriaMensagem[]
}
