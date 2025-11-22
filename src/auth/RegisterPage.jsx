import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";
import styles from "./css/RegisterPage.module.css";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const navigate = useNavigate();

  // Activar fondo especial para esta página
  useEffect(() => {
    document.body.classList.add("register-bg");
    return () => document.body.classList.remove("register-bg");
  }, []);

const handleRegister = async (e) => {
  e.preventDefault();
  setMensaje("Registrando...");

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: clave,
  });

  // Si autentica pero con error
  if (error) {
    setMensaje(traducirErrorAuth(error.message));
    return;
  }

  const user = data?.user;
  if (!user) {
    setMensaje("Revisa tu correo para confirmar la cuenta.");
    return;
  }

  // Insertar en tabla clientes
  const { error: insertError } = await supabase
    .from("clientes")
    .insert([{ nombre, correo }]);

  if (insertError) {
    // Borrar usuario creado para evitar inconsistencias
    await supabase.auth.admin.deleteUser(user.id);

    setMensaje("No se pudo guardar el cliente: " + traducirErrorAuth(insertError.message));
    return;
  }

  setMostrarPopup(true);
};


function traducirErrorAuth(errorMessage) {
  if (!errorMessage) return "Ocurrió un error desconocido.";

  const msg = errorMessage.toLowerCase();

  if (msg.includes("password should be at least"))
    return "La clave debe tener al menos 6 caracteres.";

  if (msg.includes("invalid email"))
    return "El correo ingresado no es válido.";

  if (msg.includes("email rate limit"))
    return "Has intentado registrarte muchas veces. Espera un momento.";

  if (msg.includes("user already registered") || msg.includes("duplicate"))
    return "Este correo ya está registrado.";

  if (msg.includes("email not confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";

  return "Error: " + errorMessage;
}


  return (
  <div className={styles.registerContainer}>
    <div className={styles.registerPage}>
      <h2 className={styles.title}>Registro de Cliente</h2>

      <form onSubmit={handleRegister}>
        <input
          className={styles.input}
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />

        <button className={styles.button} type="submit">
          Crear cuenta
        </button>

        {/* 🔵 Botón nuevo */}
        <button
          className={styles.button}
          type="button"
          onClick={() => navigate("/")}
        >
          Volver al Login
        </button>
      </form>

      {mensaje && <p className={styles.message}>{mensaje}</p>}

      {mostrarPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <h3>✔ Usuario registrado</h3>
            <p>Tu cuenta fue creada correctamente.</p>
            <button className={styles.button} onClick={() => navigate("/")}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

}
