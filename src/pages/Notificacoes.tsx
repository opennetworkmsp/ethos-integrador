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
import { Plus, Search, Trash2 } from 'lucide-react'

interface Notificacao {
  id: string
  condominio_id: string
  data_infracao: string
  unidade: string
  descricao: string
  created_at: string
  condominios?: {
    nome_condominio: string
  }
}

interface Condominio {
  id_condominio_interno: string
  nome_condominio: string
}

export default function Notificacoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')

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
        .select('*, condominios(nome_condominio)')
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
    const { error } = await supabase.from('notificacoes').insert({
      condominio_id: condominioId,
      data_infracao: dataInfracao,
      unidade,
      descricao,
      user_id: user?.id,
    })
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
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta notificação?')) return

    const { error } = await supabase.from('notificacoes').delete().eq('id', id)
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

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    if (year && month && day) return `${day}/${month}/${year}`
    return dateString
  }

  const filteredNotificacoes = notificacoes.filter((n) => {
    const term = search.toLowerCase()
    return (
      n.condominios?.nome_condominio?.toLowerCase().includes(term) ||
      n.unidade.toLowerCase().includes(term) ||
      n.descricao.toLowerCase().includes(term)
    )
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
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Histórico de Ocorrências</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar registros..."
                className="pl-8"
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
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[80px] text-right">Ações</TableHead>
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
                      <TableCell className="max-w-[300px] truncate" title={notificacao.descricao}>
                        {notificacao.descricao}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notificacao.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
