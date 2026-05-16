ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Aguardando';
