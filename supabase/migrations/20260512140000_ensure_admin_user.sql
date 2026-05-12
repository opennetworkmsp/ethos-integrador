DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'administrador'
  WHERE email = 'wesley.garcia@opennetwork.com.br';
END $$;
