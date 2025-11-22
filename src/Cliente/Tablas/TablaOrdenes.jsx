import styles from "../css/TablaOrdenes.module.css";

export default function TablaOrdenes({ ordenes }) {
  // Función para asignar clase de estado según valor
  const getEstadoClass = (estado) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return styles.amarillo;
      case "completado":
        return styles.verde;
      case "cancelado":
        return styles.rojo;
      default:
        return "";
    }
  };

  return (
    <div className={styles.tablaContainer}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Estado</th>
            <th>Dispositivo</th>
            <th>Técnico</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id_orden}>
              <td>{o.codigo_seguimiento}</td>
              <td>
                <span className={`${styles.estado} ${getEstadoClass(o.estado)}`}>
                  {o.estado}
                </span>
              </td>
              <td>{o.dispositivos?.marca} {o.dispositivos?.modelo}</td>
              <td>{o.tecnicos?.nombre || "Sin asignar"}</td>
              <td>{o.fecha_recepcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
