import { useState } from "react";
import SidebarTecnico from "./SidebarTecnico"; // Sidebar con las opciones del técnico
import MisOrdenes from "./TecnicoServicios"; // Ejemplo de sección
import DispositivosAsignados from "./TecnicoDispositivos"; // Otra sección

import styles from "./css/tecnico.module.css";
import AuthGuard from "../Proteccion/AuthGuard";


export default function TecnicoDashboard() {
  const [seccion, setSeccion] = useState("mis-ordenes"); // sección activa

  return (
        <AuthGuard>
    
    <div className={styles.panelContainer}>
      {/* Sidebar izquierda */}
      <div className={styles.sidebarContainer}>
        <SidebarTecnico seccion={seccion} setSeccion={setSeccion} />
      </div>

      {/* Contenido derecha */}
      <div className={styles.contentContainer}>
        <div className={styles.seccionesDinamicas}>
          {seccion === "perfil" && <PerfilTecnico />}
          {seccion === "mis-ordenes" && <MisOrdenes />}
          {seccion === "dispositivos" && <DispositivosAsignados />}
        </div>
      </div>
    </div>
        </AuthGuard>
    
  );
}
