import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import TablaDispositivos from "./Tablas/TablaDispositivos";
import styles from "./css/tecnico.module.css";

export default function TecnicoDispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Clientes existentes
  const [clientes, setClientes] = useState([]);
  const [buscarCliente, setBuscarCliente] = useState("");

  // Formulario para crear
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    imei: "",
    id_cliente: "",
    descripcion_problema: "",
  });

  useEffect(() => {
    fetchDispositivos();
    fetchClientes();
  }, []);

  const fetchDispositivos = async () => {
  setLoading(true);

  // Trae todos los dispositivos con su información de cliente
  const { data, error } = await supabase
    .from("dispositivos")
    .select(`
      id_dispositivo,
      marca,
      modelo,
      imei,
      descripcion_problema,
      clientes (
        id_interno,
        nombre,
        correo
      )
    `)
    .order("id_dispositivo", { ascending: true });

  if (error) {
    console.error("Error al obtener dispositivos:", error.message);
    setDispositivos([]);
  } else {
    setDispositivos(data || []);
  }

  setLoading(false);
};

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("id_interno, nombre, correo");

    if (!error) setClientes(data || []);
  };

  // Actualización inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear dispositivo
  const handleCreate = async () => {
    const { marca, modelo, imei, id_cliente, descripcion_problema } = form;

    if (!marca || !modelo || !id_cliente) {
      alert("Marca, modelo y cliente son obligatorios");
      return;
    }

    const { error } = await supabase.from("dispositivos").insert([
      {
        marca,
        modelo,
        imei,
        id_cliente: Number(id_cliente),
        descripcion_problema,
      },
    ]);

    if (error) {
      alert("Error al crear: " + error.message);
      return;
    }

    // Reiniciar formulario
    setForm({
      marca: "",
      modelo: "",
      imei: "",
      id_cliente: "",
      descripcion_problema: "",
    });

    setShowModal(false);
    fetchDispositivos();
  };

  // Filtrar clientes según la búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.correo}`
      .toLowerCase()
      .includes(buscarCliente.toLowerCase())
  );

  return (
    <div className={styles.panelModule}>
      <h3>Dispositivos que atiendes</h3>

      {/* Botón para crear */}
      <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
        Crear dispositivo
      </button>

      {/* Tabla */}
      <TablaDispositivos dispositivos={dispositivos} loading={loading} />

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Registrar dispositivo</h2>

            <input
              type="text"
              name="marca"
              placeholder="Marca"
              value={form.marca}
              onChange={handleChange}
            />

            <input
              type="text"
              name="modelo"
              placeholder="Modelo"
              value={form.modelo}
              onChange={handleChange}
            />

            <input
              type="text"
              name="imei"
              placeholder="IMEI (opcional)"
              value={form.imei}
              onChange={handleChange}
            />

            <textarea
              name="descripcion_problema"
              placeholder="Descripción del problema"
              value={form.descripcion_problema}
              onChange={handleChange}
            />

            {/* Buscador de clientes */}
            <label>Seleccionar cliente</label>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={buscarCliente}
              onChange={(e) => setBuscarCliente(e.target.value)}
              className={styles.inputSearch}
            />

            <select
              name="id_cliente"
              value={form.id_cliente}
              onChange={handleChange}
              className={styles.selectScrollable}
              size={5}
            >
              {clientesFiltrados.map((c) => (
                <option key={c.id_interno} value={c.id_interno}>
                  {c.nombre} — {c.correo}
                </option>
              ))}
            </select>

            <div className={styles.modalButtons}>
              <button className={styles.btnPrimary} onClick={handleCreate}>
                Guardar
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
