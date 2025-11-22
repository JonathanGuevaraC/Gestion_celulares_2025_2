import React from "react";
import styles from "../css/tecnico.module.css";

export default function TablaServicios({ ordenes = [], loading = false, onVerDetalle = () => {}, onRefresh = () => {} }) {
  if (loading) return <div className={styles.loading}>Cargando órdenes...</div>;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#Orden</th>
            <th>Dispositivo</th>
            <th>Cliente</th>
            <th>Recepción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 && (
            <tr><td colSpan="6">No hay órdenes asignadas</td></tr>
          )}
          {ordenes.map(o => (
            <tr key={o.id_orden}>
              <td>{o.id_orden}</td>
              <td>{o.dispositivos ? `${o.dispositivos.marca} ${o.dispositivos.modelo}` : "—"}</td>
              <td>{o.cliente ? o.cliente.nombre : (o.dispositivos?.id_cliente || "—")}</td>
              <td>{o.fecha_recepcion}</td>
              <td>{o.estado}</td>
              <td>
                <button className={styles.smallBtn} onClick={() => onVerDetalle(o.id_orden)}>Ver</button>
                <button className={styles.smallBtn} onClick={onRefresh}>Refrescar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
