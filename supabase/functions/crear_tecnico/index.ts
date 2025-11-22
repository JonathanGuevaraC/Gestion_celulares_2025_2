import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 🟢 Permitir preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    // Obtener variables de entorno
    const SUPABASE_URL = Deno.env.get("LA_SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("LA_SUPABASE_SERVICE_ROLE")!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { email, password, nombre, telefono, especialidad, rol } =
      await req.json();

    // Crear usuario en Auth
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError) throw userError;

    const user = userData.user;

    // Insertar en tabla tecnicos
    const { error: dbError } = await supabase.from("tecnicos").insert({
      id_tecnico: user.id,
      nombre,
      correo: email,
      telefono,
      especialidad,
      rol,
    });

    if (dbError) throw dbError;

    // Respuesta OK + CORS
    return new Response(
      JSON.stringify({ message: "Técnico creado correctamente", id: user.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
