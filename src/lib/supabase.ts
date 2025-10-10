import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  link: string;
  note: string | null;
  tag: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  share_by_default: boolean;
  created_at: string;
  updated_at: string;
}
