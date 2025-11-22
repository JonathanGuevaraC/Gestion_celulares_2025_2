import { Outlet, Link } from "react-router-dom";
import styles from "./css/tecnico.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export default function TecnicoPanel() {
  const [tecnico, setTecnico] = useState(null);
  

  useEffect(() => {
    obtenerTecnico();
  }, []);

  const obtenerTecnico = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("id_tecnico", user.id)
        .single();

      setTecnico(data);
    }
  };

  return (
    <div className={styles.layout}>
      
      {/* SIDEBAR FIJO */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Panel Técnico</h2>

        <nav className={styles.menu}>
          <Link to="/tecnico">Dashboard</Link>
          <Link to="/tecnico/ordenes">Órdenes</Link>
          <Link to="/tecnico/dispositivos">Dispositivos</Link>
          <Link to="/tecnico/perfil">Mi Perfil</Link>
        </nav>
      </aside>

      {/* CONTENEDOR DERECHO */}
      <div className={styles.mainContainer}>
        
        {/* HEADER FIJO */}
        <header className={styles.header}>
          {tecnico ? (
            <div>
              <h3>{tecnico.nombre}</h3>
              <p>Especialidad: {tecnico.especialidad}</p>
            </div>
          ) : (
            <p>Cargando técnico...</p>
          )}
        </header>

        {/* CONTENIDO CAMBIA SEGÚN RUTA */}
        <main className={styles.content}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
