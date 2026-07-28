import { useState } from "react";
import supabase from "../../services/supabase";
import Heading from "../../components/Heading";
import MainContainer from "../../components/MainContainer";
import FormContainer from "../../components/FormContainer";
import InputBox from "../../components/InputBox";
import SubmitBtn from "../../components/SubmitBtn";
import TextLink from "../../components/TextLink";
import LogoLarge from "../../components/LogoLarge";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/new-password",
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <MainContainer>
      <LogoLarge />
      <FormContainer onSubmit={handleSubmit}>
        {sent ? (
          <div className="text-center">
            <Heading>Cek email kamu</Heading>
            <p className="text-sm text-gray-500 mt-2">Link reset password sudah dikirim ke {email}</p>
            <TextLink to="/signin" addClass="mt-4 block">Kembali ke Sign in</TextLink>
          </div>
        ) : (
          <>
            <Heading>Reset password</Heading>
            <p className="mb-4 text-center text-sm text-gray-500">Masukkan email untuk reset password</p>
            <InputBox type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" htmlFor="email" error={error} disabled={loading} />
            <SubmitBtn disabled={loading}>{loading ? "Mengirim..." : "Kirim"}</SubmitBtn>
            <TextLink to="/signin" addClass="mt-3 text-center block">Kembali ke Sign in</TextLink>
          </>
        )}
      </FormContainer>
    </MainContainer>
  );
}
export default ResetPasswordPage;
