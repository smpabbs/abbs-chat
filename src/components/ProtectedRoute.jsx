import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";
import MainContainer from "./MainContainer";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        navigate("/signin", { replace: true });
      } else {
        setUser(data.session.user);
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <MainContainer>
        <div className="flex h-screen items-center justify-center"><p className="text-gray-500">Loading...</p></div>
      </MainContainer>
    );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

// Simple context to share user across components
import { createContext, useContext } from "react";
const AuthContext = createContext(null);
export function useUser() {
  return useContext(AuthContext);
}

export default ProtectedRoute;
