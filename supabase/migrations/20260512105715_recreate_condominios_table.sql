CREATE TABLE IF NOT EXISTS public.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_condominio_interno TEXT NOT NULL,
  id_condominio_externo TEXT NOT NULL,
  nome_condominio TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_condominios" ON public.condominios;
CREATE POLICY "authenticated_select_condominios" ON public.condominios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_condominios" ON public.condominios;
CREATE POLICY "authenticated_insert_condominios" ON public.condominios FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_condominios" ON public.condominios;
CREATE POLICY "authenticated_update_condominios" ON public.condominios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_condominios" ON public.condominios;
CREATE POLICY "authenticated_delete_condominios" ON public.condominios FOR DELETE TO authenticated USING (true);

-- Seed some initial data
INSERT INTO public.condominios (id, id_condominio_interno, id_condominio_externo, nome_condominio)
VALUES 
  ('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d'::uuid, 'INT-001', 'EXT-901', 'Condomínio Residencial Parque das Flores'),
  ('b2c3d4e5-f6a1-4b2c-8d3e-4f5a6b7c8d9e'::uuid, 'INT-002', 'EXT-902', 'Edifício Costa Azul'),
  ('c3d4e5f6-a1b2-4c3d-8e4f-5a6b7c8d9e0f'::uuid, 'INT-003', 'EXT-903', 'Residencial Vila Verde'),
  ('d4e5f6a1-b2c3-4d4e-8f5a-6b7c8d9e0f1a'::uuid, 'INT-004', 'EXT-904', 'Condomínio Bosque dos Pássaros')
ON CONFLICT (id) DO NOTHING;
