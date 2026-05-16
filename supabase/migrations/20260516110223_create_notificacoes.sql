CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id TEXT NOT NULL REFERENCES public.condominios(id_condominio_interno) ON DELETE CASCADE,
  data_infracao DATE NOT NULL,
  unidade TEXT NOT NULL,
  descricao TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_select_notificacoes" ON public.notificacoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_insert_notificacoes" ON public.notificacoes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_update_notificacoes" ON public.notificacoes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_delete_notificacoes" ON public.notificacoes
  FOR DELETE TO authenticated USING (true);
