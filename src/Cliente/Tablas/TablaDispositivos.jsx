import styles from "../css/TablaDispositivos.module.css";

export default function TablaDispositivos({ dispositivos }) {
  return (
    <div className={styles.tablaContainer}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>IMEI</th>
          </tr>
        </thead>
        <tbody>
          {dispositivos.map((d) => (
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
