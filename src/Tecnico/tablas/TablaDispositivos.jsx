import React from "react";
import styles from "../css/tecnico.module.css";

export default function TablaDispositivos({ dispositivos = [], loading = false, onEditar = () => {} }) {
  if (loading) return <div className={styles.loading}>Cargando dispositivos...</div>;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>IMEI</th>
          </tr>
        </thead>
        <tbody>
          {dispositivos.length === 0 && <tr><td colSpan="4">No hay dispositivos</td></tr>}
          {dispositivos.map(d => (
            <tr key={d.id_dispositivo}>
              <td>{d.id_dispositivo}</td>
              <td>{d.marca}</td>
              <td>{d.modelo}</td>
              <td>{d.imei}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
