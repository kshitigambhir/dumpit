-- ==============================================================================
-- COMPLETE FIX FOR RLS POLICY ISSUES
-- Run this entire script in Supabase SQL Editor
-- ==============================================================================

-- Step 1: Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;

-- Step 2: Create permissive policies (for development/hackathon)
CREATE POLICY "Allow authenticated users to insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Create database trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, share_by_default)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Could not create user_profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the setup
SELECT 'RLS Policies on user_profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

SELECT 'Trigger on auth.users:' as info;
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Done! Now test signup in your app
