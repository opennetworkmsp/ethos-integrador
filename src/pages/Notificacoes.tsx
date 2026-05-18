import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Trash2, CheckCircle, Eye, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Notificacao {
  id: string
  condominio_id: string
  data_infracao: string
  unidade: string
  descricao: string
  status: string
  created_at: string
  processado_em?: string
  analise_ia?: string
  condominios?: {
    nome_condominio: string
    id_condominio_externo: string
  }
}

interface Condominio {
  id_condominio_interno: string
  id_condominio_externo: string
  nome_condominio: string
}

export default function Notificacoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [iaDialogOpen, setIaDialogOpen] = useState(false)
  const [selectedNotificacao, setSelectedNotificacao] = useState<Notificacao | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Aguardando' | 'Processada'>('Todas')

  const [condominioId, setCondominioId] = useState('')
  const [dataInfracao, setDataInfracao] = useState('')
  const [unidade, setUnidade] = useState('')
  const [descricao, setDescricao] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    const [condsRes, notifsRes] = await Promise.all([
      supabase.from('condominios').select('*').order('nome_condominio'),
      supabase
        .from('notificacoes')
        .select('*, condominios(nome_condominio, id_condominio_externo)')
        .order('created_at', { ascending: false }),
    ])

    if (condsRes.data) setCondominios(condsRes.data)
    if (notifsRes.data) setNotificacoes(notifsRes.data as any)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!condominioId || !dataInfracao || !unidade || !descricao) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    const { data: novaNotificacao, error } = await supabase
      .from('notificacoes')
      .insert({
        condominio_id: condominioId,
        data_infracao: dataInfracao,
        unidade,
        descricao,
        user_id: user?.id,
      })
      .select()
      .single()
    setIsSaving(false)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a notificação.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Notificação registrada com sucesso.' })
      setOpen(false)
      setCondominioId('')
      setDataInfracao('')
      setUnidade('')
      setDescricao('')
      fetchData()

      const condominioSelecionado = condominios.find(
        (c) => c.id_condominio_interno === condominioId,
      )
      if (novaNotificacao && condominioSelecionado?.id_condominio_externo) {
        supabase.functions
          .invoke('chat-agent', {
            body: {
              action: 'analyze_notification',
              id: novaNotificacao.id,
              id_condominio_externo: condominioSelecionado.id_condominio_externo,
              descricao: novaNotificacao.descricao,
            },
          })
          .catch(console.error)
      }
    }
  }

  const handleDelete = async (notificacao: Notificacao) => {
    if (notificacao.status === 'Processada') {
      toast({
        title: 'Ação não permitida',
        description: 'Registros processados não podem ser excluídos.',
        variant: 'destructive',
      })
      return
    }

    if (!confirm('Deseja realmente excluir esta notificação?')) return

    const { error } = await supabase.from('notificacoes').delete().eq('id', notificacao.id)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notificação.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Notificação excluída com sucesso.' })
      fetchData()
    }
  }

  const handleToggleStatus = async (id: string, newStatus: string) => {
    const updateData: any = { status: newStatus }
    if (newStatus === 'Processada') {
      updateData.processado_em = new Date().toISOString()
    }

    const { error } = await supabase.from('notificacoes').update(updateData).eq('id', id)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: `Notificação marcada como ${newStatus}.` })
      if (selectedNotificacao?.id === id) {
        setSelectedNotificacao((prev) =>
          prev ? { ...prev, status: newStatus, processado_em: updateData.processado_em } : null,
        )
      }
      fetchData()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const datePart = dateString.split('T')[0]
    if (!datePart) return dateString
    const [year, month, day] = datePart.split('-')
    if (year && month && day) return `${day}/${month}/${year}`
    return dateString
  }

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleString('pt-BR')
  }

  const filteredNotificacoes = notificacoes.filter((n) => {
    const term = search.toLowerCase()
    const matchesSearch =
      n.condominios?.nome_condominio?.toLowerCase().includes(term) ||
      n.unidade.toLowerCase().includes(term) ||
      n.descricao.toLowerCase().includes(term)

    const matchesStatus =
      statusFilter === 'Todas' ? true : (n.status || 'Aguardando') === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registro de Notificações</h2>
          <p className="text-muted-foreground">
            Registre e gerencie as infrações dos moradores de forma centralizada.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Notificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Notificação</DialogTitle>
              <DialogDescription>
                Preencha os dados da ocorrência e clique em salvar para registrar no sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="condominio">
                  Condomínio <span className="text-red-500">*</span>
                </Label>
                <Select value={condominioId} onValueChange={setCondominioId}>
                  <SelectTrigger id="condominio">
                    <SelectValue placeholder="Selecione um condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios.map((c) => (
                      <SelectItem key={c.id_condominio_interno} value={c.id_condominio_interno}>
                        {c.nome_condominio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_infracao">
                    Data da Infração <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="data_infracao"
                    type="date"
                    value={dataInfracao}
                    onChange={(e) => setDataInfracao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidade">
                    Unidade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unidade"
                    placeholder="Ex: 11"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição da Infração <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Deixou toalhas expostas na janela da varanda..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Registro'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 space-y-4">
          <CardTitle className="text-lg font-medium">Histórico de Ocorrências</CardTitle>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={statusFilter === 'Todas' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Todas')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === 'Aguardando' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Aguardando')}
                size="sm"
              >
                Aguardando
              </Button>
              <Button
                variant={statusFilter === 'Processada' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Processada')}
                size="sm"
              >
                Processadas
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por condomínio ou unidade..."
                className="pl-8 bg-background w-full transition-all focus:w-full sm:focus:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead>Condomínio</TableHead>
                  <TableHead className="w-[100px]">Unidade</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Carregando notificações...
                    </TableCell>
                  </TableRow>
                ) : filteredNotificacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Nenhuma notificação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotificacoes.map((notificacao) => (
                    <TableRow key={notificacao.id}>
                      <TableCell className="font-medium">
                        {formatDate(notificacao.data_infracao)}
                      </TableCell>
                      <TableCell>
                        {notificacao.condominios?.nome_condominio || 'Condomínio não encontrado'}
                      </TableCell>
                      <TableCell>{notificacao.unidade}</TableCell>
                      <TableCell>
                        <Badge
                          variant={notificacao.status === 'Processada' ? 'default' : 'secondary'}
                          className={
                            notificacao.status === 'Processada'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
                          }
                        >
                          {notificacao.status || 'Aguardando'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {notificacao.analise_ia && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedNotificacao(notificacao)
                                setIaDialogOpen(true)
                              }}
                              title="Ver Análise da IA"
                              className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                            >
                              <Bot className="h-4 w-4" />
                              <span className="sr-only">Ver Análise da IA</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNotificacao(notificacao)
                              setViewDialogOpen(true)
                            }}
                            title="Visualizar Detalhes"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar Detalhes</span>
                          </Button>
                          {(!notificacao.status || notificacao.status === 'Aguardando') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(notificacao.id, 'Processada')}
                              title="Marcar como Processada"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Marcar como Processada</span>
                            </Button>
                          )}
                          {notificacao.status === 'Processada' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    className="h-8 w-8 text-muted-foreground pointer-events-none"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Excluir (Bloqueado)</span>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Registros processados não podem ser excluídos</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(notificacao)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Notificação</DialogTitle>
            <DialogDescription>
              {selectedNotificacao?.condominios?.nome_condominio} - Unidade{' '}
              {selectedNotificacao?.unidade}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Data da Infração</h4>
              <p>{selectedNotificacao ? formatDate(selectedNotificacao.data_infracao) : ''}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
              <Badge
                variant={selectedNotificacao?.status === 'Processada' ? 'default' : 'secondary'}
                className={
                  selectedNotificacao?.status === 'Processada'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
                }
              >
                {selectedNotificacao?.status || 'Aguardando'}
              </Badge>
            </div>
            {selectedNotificacao?.processado_em && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Processado em</h4>
                <p className="text-sm">{formatDateTime(selectedNotificacao.processado_em)}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Descrição da Infração
              </h4>
              <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                {selectedNotificacao?.descricao}
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <div>
              {selectedNotificacao &&
                (!selectedNotificacao.status || selectedNotificacao.status === 'Aguardando') && (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleToggleStatus(selectedNotificacao.id, 'Processada')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar Processada
                  </Button>
                )}
            </div>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={iaDialogOpen} onOpenChange={setIaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Análise da Inteligência Artificial
            </DialogTitle>
            <DialogDescription>
              Embasamento legal encontrado nas convenções do condomínio.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {selectedNotificacao?.analise_ia}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIaDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
