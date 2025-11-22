import { useState } from "react";
import styles from "./css/SidebarCliente.module.css";

import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function SidebarCliente({ onSelect }) {
  const [active, setActive] = useState("dispositivos");
  const [open, setOpen] = useState(false);
    const navigate = useNavigate();


  const handleSelect = (option) => {
    setActive(option);
    onSelect(option);
    setOpen(false);
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <>
      {/* Botón móvil */}
      <button
        className={styles.sidebarToggleCliente}
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      <div className={`${styles.sidebarCliente} ${open ? styles.open : ""}`}>
        <h2 className={styles.titulo}>Panel Cliente</h2>

        <ul className={styles.sidebarMenuCliente}>
          <li
            className={`${styles.item} ${
              active === "dispositivos" ? styles.activo : ""
            }`}
            onClick={() => handleSelect("dispositivos")}
          >
            Dispositivos
          </li>

          <li
            className={`${styles.item} ${
              active === "ordenes" ? styles.activo : ""
            }`}
            onClick={() => handleSelect("ordenes")}
          >
            Órdenes
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
