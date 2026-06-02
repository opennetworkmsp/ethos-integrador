import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

export default function DisparoTeste() {
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefone.trim()) {
      toast.error('Informe um número de telefone.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('N8N_MENSAGEM_TESTE', {
        body: { telefone },
      })

      if (error) throw error

      toast.success('Mensagem de teste disparada com sucesso!')
      setTelefone('')
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao disparar mensagem de teste. Verifique os logs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Disparo de Mensagem de Teste
          </CardTitle>
          <CardDescription>
            Envie uma mensagem de teste para um número de telefone específico para validar a
            integração e template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Número de Telefone</Label>
              <Input
                id="telefone"
                placeholder="+55..."
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !telefone.trim()}>
              {loading ? 'Enviando...' : 'Enviar Mensagem de Teste'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
