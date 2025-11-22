import { useState } from "react";
import SidebarCliente from "./SidebarCliente";
import MiCuenta from "./MiCuenta";
import DispositivosCliente from "./DispositivosCliente";
import OrdenesCliente from "./OrdenesCliente";

import styles from "./css/DashboardClientes.module.css";
import AuthGuard from "../Proteccion/AuthGuard";


export default function PanelCliente() {
  const [seccion, setSeccion] = useState("ordenes");

  return (
        <AuthGuard>
    
    <div className={styles.panelContainer}>
      
      {/* Sidebar izquierda */}
      <div className={styles.sidebarContainer}>
        <SidebarCliente onSelect={setSeccion} />
      </div>

      {/* Contenido derecha */}
      <div className={styles.contentContainer}>
        
        {/* Información fija de la cuenta */}
        <div className={styles.infoFija}>
          <MiCuenta />
        </div>

        {/* Secciones que cambian */}
        <div className={styles.seccionesDinamicas}>
          {seccion === "dispositivos" && <DispositivosCliente />}
          {seccion === "ordenes" && <OrdenesCliente />}
        </div>

      </div>

    </div>
        </AuthGuard>
    
  );
}
