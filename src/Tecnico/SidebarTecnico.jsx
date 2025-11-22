import { useState } from "react";
import styles from "./css/SidebarTecnico.module.css";

import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function SidebarTecnico({ seccion, setSeccion }) {
  const [open, setOpen] = useState(false);
    const navigate = useNavigate();


  const handleSelect = (id) => {
    setSeccion(id);
    setOpen(false); // cierra el sidebar en móvil
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <>
      {/* Botón móvil */}
      <button
        className={styles.sidebarToggleTecnico}
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      <div className={`${styles.sidebarTecnico} ${open ? styles.open : ""}`}>
        <h2 className={styles.titulo}>Panel Técnico</h2>

        <ul className={styles.sidebarMenuTecnico}>
          <li
            className={`${styles.item} ${
              seccion === "perfil" ? styles.activo : ""
            }`}
            onClick={() => handleSelect("perfil")}
          >
            Mi Perfil
          </li>

          <li
            className={`${styles.item} ${
              seccion === "mis-ordenes" ? styles.activo : ""
            }`}
            onClick={() => handleSelect("mis-ordenes")}
          >
            Mis Órdenes
          </li>

          <li
            className={`${styles.item} ${
              seccion === "dispositivos" ? styles.activo : ""
            }`}
            onClick={() => handleSelect("dispositivos")}
          >
            Dispositivos Asignados
          </li>
          <li
                      className={styles.item}
                      onClick={logOut}
                      style={{ color: "#ff5c5c" }}
                    >
                      Cerrar sesión
                    </li>
        </ul>
      </div>
    </>
  );
}
