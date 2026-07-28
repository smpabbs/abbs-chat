import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabase";
import { toEmail } from "./apiAuth";
import Heading from "../../components/Heading";
import InputBox from "../../components/InputBox";
import TextLink from "../../components/TextLink";
import SubmitBtn from "../../components/SubmitBtn";
import MainContainer from "../../components/MainContainer";
import FormContainer from "../../components/FormContainer";
import LogoLarge from "../../components/LogoLarge";
import { APP_NAME } from "../../config";

function Signin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) navigate("/chat", { replace: true });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError("");
    
    const email = toEmail(username);
    const { error: signinErr } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signinErr) {
      setError("Username atau password salah");
    } else {
      navigate("/chat", { replace: true });
    }
    setLoading(false);
  }

  return (
    <MainContainer>
      <LogoLarge />
      <FormContainer onSubmit={handleSubmit}>
        <Heading>Masuk</Heading>
        <p className="text-center text-sm text-gray-500 mb-2">Gunakan username & password</p>
        <InputBox type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="Username" htmlFor="username" disabled={loading} />
        <InputBox type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" htmlFor="password" error={error} disabled={loading} />
        <SubmitBtn disabled={loading}>{loading ? "Masuk..." : "Masuk"}</SubmitBtn>
        <p className="text-center text-xs text-gray-500 mt-2">Belum punya akun? <TextLink to="/signup">Daftar</TextLink></p>
        <p className="text-center text-xs text-gray-400 mt-1">— Aplikasi Chat Pembelajaran —</p>
      </FormContainer>
    </MainContainer>
  );
}
export default Signin;
