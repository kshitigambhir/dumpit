-- TEMPORARY FIX: Very permissive RLS for development
-- Use this to get signup working, then tighten security later

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- PERMISSIVE policies for development (allows signup to work)
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

-- NOTE: After signup works, replace with more restrictive policies:
-- WITH CHECK (auth.uid() = id) for INSERT
-- USING (auth.uid() = id) for SELECT
