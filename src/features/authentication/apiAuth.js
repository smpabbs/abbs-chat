import supabase from "../../services/supabase";

export async function signin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 400) throw new Error("Email atau password salah.");
    else throw new Error(error.message);
  }
  return data;
}

export async function signout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data;
}
