DO $$
BEGIN
  -- Drop existing recursive policies that cause infinite loops
  DROP POLICY IF EXISTS "Users can view their own profile or admins view all" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

  -- Create optimized non-recursive policies using JWT user_metadata
  CREATE POLICY "Users can view their own profile or admins view all" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() OR 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador'
    );

  CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador');

  CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador');

  CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'administrador');

  -- Users can update their own profile (e.g., if needed directly via client SDK)
  CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

END $$;

-- Sync existing profile roles to auth.users metadata to ensure JWT validation works correctly right away
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN SELECT id, role, full_name FROM public.profiles LOOP
    UPDATE auth.users 
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', profile_rec.role, 'full_name', profile_rec.full_name)
    WHERE id = profile_rec.id;
  END LOOP;
END $$;
