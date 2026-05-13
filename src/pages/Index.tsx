import { useEffect, useState } from 'react'
import { getCondominios, Condominio, triggerN8nWebhook } from '@/services/condominios'
import { searchAuditoriaMensagens, AuditoriaMensagem } from '@/services/auditoria'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Code2, Loader2, Search, Send, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [showAuditoria, setShowAuditoria] = useState(false)
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaMensagem[]>([])
  const [loadingAuditoria, setLoadingAuditoria] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [totalAuditoria, setTotalAuditoria] = useState(0)

  // Filtros de Auditoria
  const [auditDateStart, setAuditDateStart] = useState('')
  const [auditDateEnd, setAuditDateEnd] = useState('')
  const [auditCondominio, setAuditCondominio] = useState('')
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const ITEMS_PER_PAGE = 10
  const AUDIT_ITEMS_PER_PAGE = 20

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    loadCondominios()
  }, [])

  const loadCondominios = async () => {
    try {
      setLoading(true)
      const data = await getCondominios()
      setCondominios(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar condomínios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!showAuditoria) {
      setAuditoriaLogs([])
      setTotalAuditoria(0)
      setHasSearched(false)
      setAuditDateStart('')
      setAuditDateEnd('')
      setAuditCondominio('')
      setAuditSearchTerm('')
      setAuditPage(1)
    }
  }, [showAuditoria])

  const handleSearchAuditoria = async (page = 1) => {
    setLoadingAuditoria(true)
    try {
      const { data, total } = await searchAuditoriaMensagens({
        dataInicio: auditDateStart,
        dataFim: auditDateEnd,
        condominio: auditCondominio,
        termoBusca: auditSearchTerm,
        page,
        pageSize: AUDIT_ITEMS_PER_PAGE,
      })
      setAuditoriaLogs(data)
      setTotalAuditoria(total)
      setHasSearched(true)
      setAuditPage(page)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao buscar logs de auditoria')
    } finally {
      setLoadingAuditoria(false)
    }
  }

  const filteredCondominios = condominios.filter(
    (c) =>
      c.nome_condominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.id_condominio_interno || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.id_condominio_externo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredCondominios.length / ITEMS_PER_PAGE)
  const paginatedCondominios = filteredCondominios.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  const formatToMMDDYYYY = (dateString: string) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-')
    if (!year || !month || !day) return dateString
    return `${month}/${day}/${year}`
  }

  const handleTriggerWebhook = async () => {
    if (!selectedCondominio) return

    if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
      toast.error('Datas incompletas', {
        description: 'Por favor, preencha ambas as datas (Início e Fim) ou deixe ambas em branco.',
      })
      return
    }

    if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
      toast.error('Período inválido', {
        description: 'A data de início não pode ser posterior à data de fim.',
      })
      return
    }

    setIsSending(true)

    try {
      const payload = {
        nome_condominio: selectedCondominio.nome_condominio,
        id_condominio_interno: selectedCondominio.id_condominio_interno,
        id_condominio_externo: selectedCondominio.id_condominio_externo,
        data_inicio: formatToMMDDYYYY(dataInicio),
        data_fim: formatToMMDDYYYY(dataFim),
      }

      await triggerN8nWebhook(payload)

      toast.success('Registro disparado com sucesso!', {
        description: `Os dados do condomínio ${selectedCondominio.nome_condominio} foram enviados para o N8N.`,
      })

      setSelectedCondominio(null)
      if (showAuditoria && hasSearched) {
        handleSearchAuditoria(1)
      }
    } catch (error) {
      console.error('Erro ao disparar Eventos:', error)
      toast.error('Erro ao disparar Eventos', {
        description: 'Ocorreu um erro ao enviar os dados para o servidor.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Condomínios</h1>
          <p className="text-muted-foreground mt-1">
            Selecione um condomínio para visualizar os dados e disparar o evento.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowAuditoria(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Histórico de Envios
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Base Cadastral</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCondominios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhum condomínio encontrado</h3>
              <p className="text-sm text-muted-foreground">Tente ajustar seus filtros de busca.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Condomínio</TableHead>
                      <TableHead>ID Interno</TableHead>
                      <TableHead>ID Externo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCondominios.map((condominio) => (
                      <TableRow key={(condominio as any).id || condominio.id_condominio_interno}>
                        <TableCell className="font-medium">{condominio.nome_condominio}</TableCell>
                        <TableCell>{condominio.id_condominio_interno}</TableCell>
                        <TableCell>{condominio.id_condominio_externo}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedCondominio(condominio)}
                          >
                            Visualizar e Disparar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, i) => (
                      <PaginationItem key={i}>
                        {page === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} até{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredCondominios.length)} de{' '}
                {filteredCondominios.length} resultados
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedCondominio}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCondominio(null)
            setDataInicio('')
            setDataFim('')
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes para Disparo</DialogTitle>
            <DialogDescription>Revise os dados antes de disparar o evento</DialogDescription>
          </DialogHeader>

          {selectedCondominio && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Condomínio</p>
                  <p className="font-medium">{selectedCondominio.nome_condominio}</p>
                </div>
                {(selectedCondominio as any).id && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Registro ID</p>
                    <p className="font-mono text-sm">{(selectedCondominio as any).id}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID Interno</p>
                  <p className="font-medium">{selectedCondominio.id_condominio_interno}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID Externo</p>
                  <p className="font-medium">{selectedCondominio.id_condominio_externo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio" className="text-sm font-medium text-muted-foreground">
                    Data Início
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim" className="text-sm font-medium text-muted-foreground">
                    Data Fim
                  </Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Dados Técnicos</p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm text-foreground overflow-x-auto">
                    <code>
                      {JSON.stringify(
                        {
                          nome_condominio: selectedCondominio.nome_condominio,
                          id_condominio_interno: selectedCondominio.id_condominio_interno,
                          id_condominio_externo: selectedCondominio.id_condominio_externo,
                          data_inicio: formatToMMDDYYYY(dataInicio),
                          data_fim: formatToMMDDYYYY(dataFim),
                        },
                        null,
                        2,
                      )}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCondominio(null)}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button onClick={handleTriggerWebhook} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Disparar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAuditoria} onOpenChange={setShowAuditoria}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Envios (Auditoria)</DialogTitle>
            <DialogDescription>
              Registro de respostas recebidas após os disparos. Utilize os filtros para buscar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 border-b mb-2 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="auditDateStart" className="text-xs">
                  Data Início
                </Label>
                <Input
                  id="auditDateStart"
                  type="date"
                  value={auditDateStart}
                  onChange={(e) => setAuditDateStart(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="auditDateEnd" className="text-xs">
                  Data Fim
                </Label>
                <Input
                  id="auditDateEnd"
                  type="date"
                  value={auditDateEnd}
                  onChange={(e) => setAuditDateEnd(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="auditCondominio" className="text-xs">
                  Condomínio
                </Label>
                <Input
                  id="auditCondominio"
                  placeholder="Ex: Edifício Itália"
                  value={auditCondominio}
                  onChange={(e) => setAuditCondominio(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAuditoria(1)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="auditSearchTerm" className="text-xs">
                  Cliente / Telefone
                </Label>
                <Input
                  id="auditSearchTerm"
                  placeholder="Nome ou número"
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAuditoria(1)}
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                onClick={() => handleSearchAuditoria(1)}
                disabled={loadingAuditoria}
                size="sm"
              >
                {loadingAuditoria ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Filtrar Resultados
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
            {!hasSearched ? (
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Faça uma busca</h3>
                <p className="text-sm text-muted-foreground max-w-[400px]">
                  Utilize os filtros acima para pesquisar os registros de auditoria retornados pelo
                  N8N.
                </p>
              </div>
            ) : loadingAuditoria ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : auditoriaLogs.length === 0 ? (
              <div className="flex flex-col flex-1 items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Nenhum registro encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar seus filtros de busca.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="rounded-md border flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                        <TableRow>
                          <TableHead className="w-[160px]">Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Condomínio</TableHead>
                          <TableHead>Telefone Destino</TableHead>
                          <TableHead className="w-[100px] text-right">Boleto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditoriaLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {log.nome_cliente || '-'}
                              {log.unidade && (
                                <Badge variant="outline" className="ml-2 text-[10px]">
                                  Un: {log.unidade}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell
                              className="text-sm max-w-[200px] truncate"
                              title={log.condominio || ''}
                            >
                              {log.condominio || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.telefone_destino || log.telefone_origem || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {log.link_boleto ? (
                                <Button variant="ghost" size="sm" asChild className="h-8">
                                  <a
                                    href={log.link_boleto}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Link
                                  </a>
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {totalAuditoria > AUDIT_ITEMS_PER_PAGE && (
                  <div className="flex justify-between items-center px-2 pt-2 border-t mt-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(auditPage - 1) * AUDIT_ITEMS_PER_PAGE + 1} até{' '}
                      {Math.min(auditPage * AUDIT_ITEMS_PER_PAGE, totalAuditoria)} de{' '}
                      {totalAuditoria}
                    </p>
                    <Pagination className="justify-end m-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handleSearchAuditoria(Math.max(1, auditPage - 1))}
                            className={
                              auditPage === 1 || loadingAuditoria
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handleSearchAuditoria(
                                Math.min(
                                  Math.ceil(totalAuditoria / AUDIT_ITEMS_PER_PAGE),
                                  auditPage + 1,
                                ),
                              )
                            }
                            className={
                              auditPage >= Math.ceil(totalAuditoria / AUDIT_ITEMS_PER_PAGE) ||
                              loadingAuditoria
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
