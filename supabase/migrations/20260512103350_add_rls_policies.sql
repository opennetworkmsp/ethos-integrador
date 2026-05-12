-- Enable RLS for all required tables
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CRM_geral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convencoes_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_infracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Condominios Policies
DROP POLICY IF EXISTS "authenticated_select_condominios" ON public.condominios;
CREATE POLICY "authenticated_select_condominios" ON public.condominios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_condominios" ON public.condominios;
CREATE POLICY "authenticated_insert_condominios" ON public.condominios FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_condominios" ON public.condominios;
CREATE POLICY "authenticated_update_condominios" ON public.condominios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_condominios" ON public.condominios;
CREATE POLICY "authenticated_delete_condominios" ON public.condominios FOR DELETE TO authenticated USING (true);

-- CRM_geral Policies
DROP POLICY IF EXISTS "authenticated_select_crm" ON public."CRM_geral";
CREATE POLICY "authenticated_select_crm" ON public."CRM_geral" FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_crm" ON public."CRM_geral";
CREATE POLICY "authenticated_insert_crm" ON public."CRM_geral" FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_crm" ON public."CRM_geral";
CREATE POLICY "authenticated_update_crm" ON public."CRM_geral" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_crm" ON public."CRM_geral";
CREATE POLICY "authenticated_delete_crm" ON public."CRM_geral" FOR DELETE TO authenticated USING (true);

-- convencoes_chunks Policies
DROP POLICY IF EXISTS "authenticated_select_chunks" ON public.convencoes_chunks;
CREATE POLICY "authenticated_select_chunks" ON public.convencoes_chunks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_chunks" ON public.convencoes_chunks;
CREATE POLICY "authenticated_insert_chunks" ON public.convencoes_chunks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_chunks" ON public.convencoes_chunks;
CREATE POLICY "authenticated_update_chunks" ON public.convencoes_chunks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_chunks" ON public.convencoes_chunks;
CREATE POLICY "authenticated_delete_chunks" ON public.convencoes_chunks FOR DELETE TO authenticated USING (true);

-- historico_infracoes Policies
DROP POLICY IF EXISTS "authenticated_select_infracoes" ON public.historico_infracoes;
CREATE POLICY "authenticated_select_infracoes" ON public.historico_infracoes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_infracoes" ON public.historico_infracoes;
CREATE POLICY "authenticated_insert_infracoes" ON public.historico_infracoes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_infracoes" ON public.historico_infracoes;
CREATE POLICY "authenticated_update_infracoes" ON public.historico_infracoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_infracoes" ON public.historico_infracoes;
CREATE POLICY "authenticated_delete_infracoes" ON public.historico_infracoes FOR DELETE TO authenticated USING (true);

-- n8n_chat_histories Policies
DROP POLICY IF EXISTS "authenticated_select_n8n" ON public.n8n_chat_histories;
CREATE POLICY "authenticated_select_n8n" ON public.n8n_chat_histories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_n8n" ON public.n8n_chat_histories;
CREATE POLICY "authenticated_insert_n8n" ON public.n8n_chat_histories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_n8n" ON public.n8n_chat_histories;
CREATE POLICY "authenticated_update_n8n" ON public.n8n_chat_histories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_n8n" ON public.n8n_chat_histories;
CREATE POLICY "authenticated_delete_n8n" ON public.n8n_chat_histories FOR DELETE TO authenticated USING (true);
