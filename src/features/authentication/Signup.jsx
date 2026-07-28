import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabase";
import { toEmail } from "./apiAuth";
import Heading from "../../components/Heading";
import MainContainer from "../../components/MainContainer";
import FormContainer from "../../components/FormContainer";
import InputBox from "../../components/InputBox";
import SubmitBtn from "../../components/SubmitBtn";
import TextLink from "../../components/TextLink";
import LogoLarge from "../../components/LogoLarge";
import { MIN_PASSWORD_LENGTH } from "../../config";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) navigate("/chat", { replace: true });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    if (password.length < MIN_PASSWORD_LENGTH) { setError(`Min ${MIN_PASSWORD_LENGTH} karakter`); return; }
    
    setLoading(true);
    setError("");
    
    try {
      const email = toEmail(username);
      const { error: signupErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { fullname: fullname || username, role: "student", display_name: username } }
      });
      if (signupErr) throw new Error(signupErr.message);
      
      // Add to all rooms
      const { data: rooms } = await supabase.from("rooms").select("id");
      if (rooms?.length) {
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const vals = rooms.map(r => ({ room_id: r.id, user_id: session.user.id, role: "student" }));
          await supabase.from("room_members").insert(vals);
        }
      }
      setDone(true);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <MainContainer>
        <LogoLarge />
        <FormContainer>
          <Heading>Pendaftaran Berhasil!</Heading>
          <p className="text-center text-sm text-gray-500 mb-4">
            Akun <strong>{username}</strong> sudah aktif. Silakan login.
          </p>
          <SubmitBtn onClick={() => navigate("/signin")} disabled={false}>Login</SubmitBtn>
        </FormContainer>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <LogoLarge />
      <FormContainer onSubmit={handleSubmit}>
        <Heading>Daftar Baru</Heading>
        <p className="text-center text-sm text-gray-500 mb-2">Buat akun dengan username & password</p>
        
        <InputBox type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/g,'').toLowerCase())} placeholder="Username" htmlFor="username" disabled={loading} />
        
        <InputBox type="text" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Nama lengkap (opsional)" htmlFor="fullname" disabled={loading} />
        
        <InputBox type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" htmlFor="password" error={error} disabled={loading} />
        
        <SubmitBtn disabled={loading}>{loading ? "Mendaftar..." : "Daftar"}</SubmitBtn>
        
        <p className="text-center text-xs text-gray-500 mt-2">Sudah punya akun? <TextLink to="/signin">Login</TextLink></p>
      </FormContainer>
    </MainContainer>
  );
}
export default Signup;
