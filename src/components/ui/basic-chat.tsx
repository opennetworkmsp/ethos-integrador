import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  content: string
  sender: 'me' | 'other'
}

interface BasicChatProps {
  userName?: string
  userAvatar?: string
  clientName?: string
  clientAvatar?: string
  userOnline?: boolean
  messages: Message[]
  onSendMessage: (message: string) => void
  isSending?: boolean
}

export function BasicChat({
  userName = 'Assistente',
  userAvatar,
  clientName,
  clientAvatar,
  userOnline = false,
  messages,
  onSendMessage,
  isSending = false,
}: BasicChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim() || isSending) return
    onSendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <Card className="w-full max-w-3xl h-full min-h-[400px] max-h-[800px] flex flex-col rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover p-1.5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="font-semibold text-sm leading-none mb-1.5">{userName}</p>
          {userOnline && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300',
              msg.sender === 'me' ? 'justify-end' : 'justify-start',
            )}
          >
            {msg.sender === 'other' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover p-1.5"
                  />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
            )}

            <div
              className={cn(
                'px-4 py-2.5 rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap break-words',
                msg.sender === 'me'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-background border shadow-sm rounded-bl-sm',
              )}
            >
              {msg.content}
            </div>

            {msg.sender === 'me' && (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 overflow-hidden text-xs font-medium uppercase">
                {clientAvatar ? (
                  <img src={clientAvatar} alt={clientName} className="w-full h-full object-cover" />
                ) : clientName ? (
                  clientName.substring(0, 2)
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover p-1.5 opacity-70"
                />
              ) : (
                <Bot className="h-4 w-4 opacity-70" />
              )}
            </div>
            <div className="px-4 py-3.5 rounded-2xl bg-background border shadow-sm rounded-bl-sm flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-card flex gap-2 items-center shrink-0">
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isSending}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          size="icon"
          className="shrink-0 rounded-full h-10 w-10"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 -ml-0.5" />
          )}
        </Button>
      </div>
    </Card>
  )
}
