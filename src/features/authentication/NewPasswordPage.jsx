import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabase";
import FormContainer from "../../components/FormContainer";
import SubmitBtn from "../../components/SubmitBtn";
import MainContainer from "../../components/MainContainer";
import InputBox from "../../components/InputBox";
import Heading from "../../components/Heading";
import { MIN_PASSWORD_LENGTH } from "../../config";
import toast from "react-hot-toast";
import LogoLarge from "../../components/LogoLarge";

function NewPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setValidSession(!!data.session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Password tidak sama"); return; }
    if (password.length < MIN_PASSWORD_LENGTH) { setError("Minimal " + MIN_PASSWORD_LENGTH + " karakter"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else { toast.success("Password berhasil diupdate!"); navigate("/signin"); }
    setLoading(false);
  }

  if (checking) return <MainContainer><div className="flex items-center justify-center p-8"><p className="text-gray-500">Loading...</p></div></MainContainer>;

  if (!validSession) {
    return (
      <MainContainer>
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-3xl mb-2">🔗</p>
          <p className="text-gray-500">Link reset password sudah kadaluarsa atau tidak valid.</p>
          <a href="/reset-password" className="mt-4 text-blue-500">Kirim ulang reset password</a>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <LogoLarge />
      <FormContainer onSubmit={handleSubmit}>
        <Heading>Buat password baru</Heading>
        <InputBox type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password baru" htmlFor="newPassword" error={error} disabled={loading} />
        <InputBox type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Konfirmasi password" htmlFor="confirmPassword" disabled={loading} />
        <SubmitBtn disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</SubmitBtn>
      </FormContainer>
    </MainContainer>
  );
}
export default NewPasswordPage;
