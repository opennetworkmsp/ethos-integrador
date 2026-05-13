import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadCloud, Search, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Condominio {
  id_condominio_interno: string
  id_condominio_externo: string
  nome_condominio: string
}

export default function BaseConhecimento() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [filteredCondominios, setFilteredCondominios] = useState<Condominio[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchCondominios()
  }, [])

  useEffect(() => {
    if (!search) {
      setFilteredCondominios(condominios)
      return
    }
    const lowerSearch = search.toLowerCase()
    setFilteredCondominios(
      condominios.filter(
        (c) =>
          c.nome_condominio.toLowerCase().includes(lowerSearch) ||
          c.id_condominio_interno.toLowerCase().includes(lowerSearch) ||
          c.id_condominio_externo.toLowerCase().includes(lowerSearch),
      ),
    )
  }, [search, condominios])

  const fetchCondominios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .order('nome_condominio')

      if (error) throw error

      setCondominios(data || [])
      setFilteredCondominios(data || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar condomínios',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (condominio: Condominio) => {
    setSelectedCondominio(condominio)
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '')
        if ((encoded?.length ?? 0) % 4 > 0) {
          encoded += '='.repeat(4 - ((encoded?.length ?? 0) % 4))
        }
        resolve(encoded || '')
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUpload = async () => {
    if (!selectedCondominio || !selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Selecione um arquivo para enviar.',
      })
      return
    }

    try {
      setUploading(true)

      const fileBase64 = await fileToBase64(selectedFile)

      const payload = {
        id_condominio_interno: selectedCondominio.id_condominio_interno,
        id_condominio_externo: selectedCondominio.id_condominio_externo,
        nome_condominio: selectedCondominio.nome_condominio,
        arquivo_base64: fileBase64,
        filename: selectedFile.name,
        contentType: selectedFile.type,
      }

      const { data, error } = await supabase.functions.invoke('upload-files-agent', {
        body: payload,
      })

      if (error) {
        throw new Error(error.message || 'Erro ao comunicar com a Edge Function')
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      toast({
        title: 'Sucesso!',
        description: 'Arquivo enviado com sucesso para a Base de Conhecimento.',
      })

      setIsDialogOpen(false)
      setSelectedFile(null)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar arquivo',
        description: error.message,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Base de Conhecimento</h2>
          <p className="text-muted-foreground">
            Gerencie e envie documentos para a base de conhecimento dos condomínios.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condomínios</CardTitle>
          <CardDescription>
            Selecione o condomínio para o qual deseja realizar o upload de documentos.
          </CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar condomínio..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>ID Interno</TableHead>
                  <TableHead>ID Externo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredCondominios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum condomínio encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCondominios.map((condominio) => (
                    <TableRow key={condominio.id_condominio_interno}>
                      <TableCell className="font-medium">{condominio.nome_condominio}</TableCell>
                      <TableCell>{condominio.id_condominio_interno}</TableCell>
                      <TableCell>{condominio.id_condominio_externo}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(condominio)}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Subir Arquivo
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subir Arquivo</DialogTitle>
            <DialogDescription>
              Envie um documento para a base de conhecimento de{' '}
              <span className="font-semibold text-foreground">
                {selectedCondominio?.nome_condominio}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? 'Enviando...' : 'Enviar Arquivo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
