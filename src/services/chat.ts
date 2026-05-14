import { supabase } from '@/lib/supabase/client'

export const invokeChatAgent = async (message: string) => {
  const { data, error } = await supabase.functions.invoke('chat-agent', {
    body: { message },
  })

  if (error) throw error
  return data
}
