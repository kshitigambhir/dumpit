import { createUserWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  signUp: (email: string, password: string, username: string) => Promise<{ error: any | null }>;
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

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore (using 'users' collection to match Profile component)
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username,
        email,
        share_by_default: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log('User profile created successfully');
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
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

