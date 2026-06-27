import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import { getSchoolVerification } from './schoolVerify.js';

const AuthContext = createContext();

function buildUser(session) {
  if (!session) return null;
  const { verified, school } = getSchoolVerification(session.user.email);
  return {
    email: session.user.email,
    name: session.user.user_metadata?.full_name
       ?? session.user.user_metadata?.name
       ?? session.user.email,
    verified,
    school,
    // undefined until fetchIsAdmin resolves — consumers must treat "unknown"
    // distinctly from "not an admin" to avoid bouncing admins mid-load.
    isAdmin: undefined,
  };
}

// is_admin lives in public.users (RLS lets a user read their own row by email).
// Failures (e.g. column not yet migrated) fall back to non-admin.
async function fetchIsAdmin(email) {
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('email', email)
    .maybeSingle();
  return data?.is_admin === true;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set the user from a session, then asynchronously merge in is_admin.
  const applySession = (session) => {
    const base = buildUser(session);
    setUser(base);
    if (base) {
      fetchIsAdmin(base.email).then((isAdmin) => {
        // Ignore if the session changed underneath us.
        setUser((prev) => (prev && prev.email === base.email ? { ...prev, isAdmin } : prev));
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setLoading(false);
    });

    // The public.users row is maintained server-side by a trigger on
    // auth.users (migration 0005) — the client never writes it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
