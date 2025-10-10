-- Better approach: Auto-create user profile via database trigger
-- This runs in the database context, so RLS doesn't apply

-- First, drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to create user profile automatically
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
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate insert errors
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Could not create user_profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow profile insertion (mainly for trigger, but also allows manual if needed)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
