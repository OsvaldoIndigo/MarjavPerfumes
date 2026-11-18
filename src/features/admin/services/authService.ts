import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supbase/client';
import type { AdminProfileRow } from '@/types/database';

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminProfileRow> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (authError || !authData.user) {
    throw new Error('Correo electrónico o contraseña incorrectos.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, email, full_name, is_active, created_at')
    .eq('id', authData.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error(
      'Esta cuenta no tiene permisos de administrador activos.'
    );
  }

  return profile as AdminProfileRow;
}

export async function logoutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('No se pudo cerrar la sesión correctamente.');
  }
}

export async function getCurrentAdminProfile(): Promise<AdminProfileRow | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, email, full_name, is_active, created_at')
    .eq('id', session.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return null;
  }

  return profile as AdminProfileRow;
}

export function onAdminAuthStateChange(
  callback: (hasSession: boolean) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      callback(Boolean(session?.user));
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}