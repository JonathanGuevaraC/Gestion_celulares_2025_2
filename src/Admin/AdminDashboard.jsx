import { useState } from "react";
import Sidebar from "./Sidebar"; // mantengo tu import original
import Clientes from "./AdminClientes";
import Tecnicos from "./AdminTecnicos";
import Ordenes from "./AdminOrdenes";
import Dispositivos from "./AdminDispositivos";
import Repuestos from "./AdminRepuestos";

import styles from "./css/admin.module.css";
import AuthGuard from "../Proteccion/AuthGuard";


export default function AdminDashboard() {
  const [selected, setSelected] = useState("clientes");

  return (
    <AuthGuard>
    <div className={styles.adminContainer}>
      {/* sidebar wrapper (fija) */}
      <div className={styles.sidebarWrapper}>
        <Sidebar onSelect={setSelected} />
      </div>

      {/* main content */}
      <main className={styles.contentArea}>
        <div className={styles.sectionContainer}>
          {selected === "clientes" && <Clientes />}
          {selected === "tecnico" && <Tecnicos />}
          {selected === "dispositivos" && <Dispositivos />}
          {selected === "repuestos" && <Repuestos />}
          {selected === "ordenes" && <Ordenes />}
          {selected === "reportes" && <></>}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
