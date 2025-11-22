import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function AuthGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate("/");
    };

    checkSession();

    // Escuchar cambios en la sesión (logout, expiración)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return children;
}
