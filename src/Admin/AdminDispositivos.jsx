import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/dispositivos.module.css";

export default function AdminDispositivo() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrear, setShowCrear] = useState(false);

  // Campos del formulario
  const [clientes, setClientes] = useState([]);
  const [idCliente, setIdCliente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [imei, setImei] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Traer dispositivos
  const fetchDispositivos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dispositivos")
      .select(
        `id_dispositivo, marca, modelo, imei, descripcion_problema, id_cliente`
      )
      .order("id_dispositivo", { ascending: true });

    if (error) console.error(error);
    else setDispositivos(data);
    setLoading(false);
  };

  // Traer clientes para el select
  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("id_interno, nombre")
      .order("nombre");

    if (error) console.error(error);
    else setClientes(data);
  };

  useEffect(() => {
    fetchDispositivos();
    fetchClientes();
  }, []);

  // Crear dispositivo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!idCliente) {
      setMensaje("Selecciona un cliente");
      return;
    }

    const { error } = await supabase.from("dispositivos").insert([
      {
        id_cliente: idCliente,
        marca,
        modelo,
        imei,
        descripcion_problema: descripcion,
      },
    ]);

    if (error) {
      setMensaje("Error al crear dispositivo: " + error.message);
    } else {
      setMensaje("Dispositivo creado correctamente!");
      setIdCliente("");
      setMarca("");
      setModelo("");
      setImei("");
      setDescripcion("");
      setShowCrear(false);
      fetchDispositivos();
    }
  };

  return (
    <div className={styles.dispositivosContainer}>
      <div className={styles.dispositivosPanel}>
        {/* Encabezado: nombre y botón */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className={styles.titulo}>Dispositivos</h2>
          <button
            className={`${styles.btn} ${styles.guardar}`}
            onClick={() => setShowCrear(true)}
          >
            + Crear Dispositivo
          </button>
        </div>

        {/* Tabla */}
        <div className={styles.tablaResponsive}>
          {loading ? (
            <p>Cargando dispositivos...</p>
          ) : (
            <table className={styles.tablaDispositivos}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente (ID)</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>IMEI</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.sinRegistros}>
                      No hay dispositivos registrados.
                    </td>
                  </tr>
                ) : (
                  dispositivos.map((d) => (
                    <tr key={d.id_dispositivo}>
                      <td>{d.id_dispositivo}</td>
                      <td>{d.id_cliente}</td>
                      <td>{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td>{d.imei}</td>
                      <td>{d.descripcion_problema}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de creación */}
      {showCrear && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Crear Dispositivo</h3>
            {mensaje && <p>{mensaje}</p>}
            <form onSubmit={handleSubmit}>
              <label>Cliente:</label>
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                required
              >
                <option value="">--Selecciona un cliente--</option>
                {clientes.map((c) => (
                  <option key={c.id_interno} value={c.id_interno}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label>Marca:</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
              />

              <label>Modelo:</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
              />

              <label>IMEI:</label>
              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
              />

              <label>Descripción del problema:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />

              <div
                style={{ marginTop: 10, display: "flex", gap: 10 }}
              >
                <button className={`${styles.btn} ${styles.guardar}`} type="submit">
                  Crear
                </button>
                <button
                  className={`${styles.btn} ${styles.cancelar}`}
                  type="button"
                  onClick={() => setShowCrear(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}