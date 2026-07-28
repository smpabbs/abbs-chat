import supabase from "../../services/supabase";
import { EMAIL_DOMAIN } from "../../config";

export function toEmail(username) {
  return username.includes("@") ? username : username + EMAIL_DOMAIN;
}

export async function signin({ username, password }) {
  const email = toEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signup({ username, password, fullname }) {
  const email = toEmail(username);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullname, role: "student", display_name: username } }
  });
  if (error) throw new Error(error.message);
  
  // Add to class & all rooms
  if (data?.user) {
    try {
      const { data: rooms } = await supabase.from("rooms").select("id");
      if (rooms && rooms.length > 0) {
        const vals = rooms.map(r => ({ room_id: r.id, user_id: data.user.id, role: "student" }));
        await supabase.from("room_members").insert(vals);
      }
    } catch (e) { console.error(e); }
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
