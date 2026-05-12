DO $$
BEGIN
  -- Create table for auditoria_mensagens
  CREATE TABLE IF NOT EXISTS public.auditoria_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefone_origem TEXT,
    telefone_destino TEXT,
    organizacao_id TEXT,
    template_id TEXT,
    nome_cliente TEXT,
    condominio TEXT,
    vencimento TEXT,
    link_boleto TEXT,
    unidade TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
  );

  -- Ensure RLS is enabled
  ALTER TABLE public.auditoria_mensagens ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to remain idempotent
  DROP POLICY IF EXISTS "authenticated_select_auditoria" ON public.auditoria_mensagens;
  DROP POLICY IF EXISTS "authenticated_insert_auditoria" ON public.auditoria_mensagens;

  -- Create policies
  CREATE POLICY "authenticated_select_auditoria" ON public.auditoria_mensagens
    FOR SELECT TO authenticated USING (true);

  CREATE POLICY "authenticated_insert_auditoria" ON public.auditoria_mensagens
    FOR INSERT TO authenticated WITH CHECK (true);
END $$;
