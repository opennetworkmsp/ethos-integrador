import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Send, Loader2 } from 'lucide-react'
import { getCondominiosCount } from '@/services/condominios'
import { getAuditoriaCount } from '@/services/auditoria'
import { toast } from 'sonner'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [condominiosCount, setCondominiosCount] = useState(0)
  const [disparosCount, setDisparosCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [condominios, disparos] = await Promise.all([
          getCondominiosCount(),
          getAuditoriaCount(),
        ])
        setCondominiosCount(condominios)
        setDisparosCount(disparos)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema e indicadores principais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Condomínios</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{condominiosCount}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Condomínios administrados na base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disparos Realizados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{disparosCount}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Total de mensagens enviadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
