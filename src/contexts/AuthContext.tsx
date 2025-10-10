import { createUserWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

/*
  Previous Supabase logic (kept here as comments for reference):

  - signUp(email, password, username):
    * called supabase.auth.signUp({ email, password })
    * on success inserted a row into `user_profiles` with id = data.user.id, username, email
+   * This required the `user_profiles` table and RLS policies to allow INSERT when auth.uid() = id.

  - signIn(email, password):
    * called supabase.auth.signInWithPassword({ email, password })

  - signOut():
    * called supabase.auth.signOut()

  Notes: When using Supabase Auth + RLS you needed to ensure the `user_profiles` row was created with the
  same `id` as the Supabase auth user (auth.users.id) so RLS policies would permit reads/updates.
*/

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Optionally: create a user_profiles record in your Postgres DB using the Firebase uid
      // Note: When switching to Firebase Auth, you must adapt your backend to accept Firebase UIDs
      // (they are different from Supabase auth UIDs). Your row-level security policies must
      // reference the authentication provider accordingly (or you can manage profiles without RLS).
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

