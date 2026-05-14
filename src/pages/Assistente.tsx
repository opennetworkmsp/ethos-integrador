import { useState } from 'react'
import { BasicChat, Message } from '@/components/ui/basic-chat'
import { invokeChatAgent } from '@/services/chat'
import { toast } from 'sonner'

export default function Assistente() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: 'Olá! Sou o seu assistente virtual. Como posso ajudar você hoje?',
      sender: 'other',
    },
  ])
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'me',
    }
    setMessages((prev) => [...prev, userMessage])
    setIsSending(true)

    try {
      const response = await invokeChatAgent(content)

      let replyText = 'Não entendi a resposta do servidor.'
      if (response && typeof response === 'object') {
        if (response.reply) {
          replyText = response.reply
        } else if (response.data) {
          if (typeof response.data === 'string') {
            replyText = response.data
          } else if (response.data.output) {
            replyText = response.data.output
          } else if (response.data.reply) {
            replyText = response.data.reply
          } else {
            replyText = JSON.stringify(response.data)
          }
        } else if (Array.isArray(response) && response.length > 0 && response[0].output) {
          replyText = response[0].output
        } else {
          replyText = JSON.stringify(response)
        }
      } else if (typeof response === 'string') {
        replyText = response
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: replyText,
        sender: 'other',
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error invoking chat agent:', error)
      toast.error('Erro ao enviar mensagem')

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          'Desculpe, ocorreu um erro ao conectar com o servidor. Verifique se o n8n está configurado corretamente.',
        sender: 'other',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[calc(100vh-4rem)]">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Assistente Virtual</h1>
        <p className="text-muted-foreground mt-1">
          Interaja com seus fluxos e automações diretamente pelo chat.
        </p>
      </div>

      <div className="flex-1 flex justify-center pb-8 min-h-0">
        <BasicChat
          userName="Agente Operacional"
          userOnline={true}
          messages={messages}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  )
}
