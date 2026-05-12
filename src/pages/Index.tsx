import { useEffect, useState } from 'react'
import { getCondominios, Condominio, triggerN8nWebhook } from '@/services/condominios'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, Code2, Loader2, Search, Send } from 'lucide-react'
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

export default function Index() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 10

  // Reset pagination when search changes
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

  const handleTriggerWebhook = async () => {
    if (!selectedCondominio) return

    setIsSending(true)

    try {
      const payload = {
        nome_condominio: selectedCondominio.nome_condominio,
        id_condominio_interno: selectedCondominio.id_condominio_interno,
        id_condominio_externo: selectedCondominio.id_condominio_externo,
      }

      await triggerN8nWebhook(payload)

      console.log('Dados enviados para o webhook n8n:', selectedCondominio)

      toast.success('Webhook disparado com sucesso!', {
        description: `Os dados do condomínio ${selectedCondominio.nome_condominio} foram enviados para o N8N.`,
      })

      setSelectedCondominio(null)
    } catch (error) {
      console.error('Erro ao disparar webhook:', error)
      toast.error('Erro ao disparar webhook', {
        description: 'Ocorreu um erro ao enviar os dados para o servidor.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Condomínios</h1>
          <p className="text-muted-foreground mt-1">
            Selecione um condomínio para visualizar os dados e disparar o webhook.
          </p>
        </div>
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
                      <TableRow key={condominio.id}>
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
        onOpenChange={(open) => !open && setSelectedCondominio(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes para Disparo (N8N)</DialogTitle>
            <DialogDescription>
              Revise os dados antes de enviar a requisição para o fluxo do N8N.
            </DialogDescription>
          </DialogHeader>

          {selectedCondominio && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Condomínio</p>
                  <p className="font-medium">{selectedCondominio.nome_condominio}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Registro ID</p>
                  <p className="font-mono text-sm">{selectedCondominio.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID Interno</p>
                  <p className="font-medium">{selectedCondominio.id_condominio_interno}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID Externo</p>
                  <p className="font-medium">{selectedCondominio.id_condominio_externo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Payload do Webhook (JSON)
                  </p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm text-foreground overflow-x-auto">
                    <code>
                      {JSON.stringify(
                        {
                          nome_condominio: selectedCondominio.nome_condominio,
                          id_condominio_interno: selectedCondominio.id_condominio_interno,
                          id_condominio_externo: selectedCondominio.id_condominio_externo,
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
                      Disparar Webhook
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
