import { useState } from "react";
import styles from "./css/Sidebar.module.css";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("clientes");
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
      <button className={styles.sidebarToggle} onClick={() => setOpen(!open)}>
        ☰
      </button>

      <div className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <h2 className={styles.sidebarTitle}>Panel Admin</h2>

        <ul className={styles.sidebarMenu}>
          <li
            className={`${styles.menuItem} ${
              active === "clientes" ? styles.active : ""
            }`}
            onClick={() => handleSelect("clientes")}
          >
            Clientes
          </li>

          <li
            className={`${styles.menuItem} ${
              active === "tecnico" ? styles.active : ""
            }`}
            onClick={() => handleSelect("tecnico")}
          >
            Técnicos
          </li>

          <li
            className={`${styles.menuItem} ${
              active === "dispositivos" ? styles.active : ""
            }`}
            onClick={() => handleSelect("dispositivos")}
          >
            Dispositivos
          </li>

          <li
            className={`${styles.menuItem} ${
              active === "repuestos" ? styles.active : ""
            }`}
            onClick={() => handleSelect("repuestos")}
          >
            Repuestos
          </li>

          <li
            className={`${styles.menuItem} ${
              active === "ordenes" ? styles.active : ""
            }`}
            onClick={() => handleSelect("ordenes")}
          >
            Órdenes
          </li>

          <li
            className={`${styles.menuItem} ${
              active === "reportes" ? styles.active : ""
            }`}
            onClick={() => handleSelect("reportes")}
          >
            Reportes
          </li>

          <li
            className={styles.menuItem}
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
