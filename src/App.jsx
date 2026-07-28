import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./styles/index.css";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signin from "./features/authentication/Signin";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ChatView from "./features/messageArea/ChatView";
import { UiProvider } from "./contexts/UiContext";
import NewPasswordPage from "./features/authentication/NewPasswordPage";
import ResetPasswordPage from "./features/authentication/ResetPasswordPage";
import NotFound from "./components/NotFound";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <UiProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" toastOptions={{ error: { duration: 5000 }, style: { maxWidth: "500px" } }} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<div className="flex h-full items-center justify-center p-8 text-center text-gray-400"><div><p className="text-2xl mb-2">💬</p><p>Pilih ruang chat untuk mulai diskusi</p></div></div>} />
              <Route path=":roomId" element={<ChatView />} />
            </Route>
            <Route path="signin" element={<Signin />} />
            <Route path="new-password" element={<NewPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </UiProvider>
  );
}
export default App;
