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
  page?: number
  pageSize?: number
}

export async function searchAuditoriaMensagens(
  filtros: AuditoriaFiltros,
): Promise<{ data: AuditoriaMensagem[]; total: number }> {
  let query = supabase
    .from('auditoria_mensagens')
    .select('*', { count: 'exact' })
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

  if (filtros.page && filtros.pageSize) {
    const from = (filtros.page - 1) * filtros.pageSize
    const to = from + filtros.pageSize - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return { data: data as AuditoriaMensagem[], total: count || 0 }
}
