import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/cliente.module.css";

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});

  // Cargar clientes desde Supabase
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id_interno, nombre, correo, telefono, whatsapp, direccion")
        .order("id_interno", { ascending: true });

      if (error) {
        console.error("Error al obtener clientes:", error);
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

  // Cargar datos del cliente seleccionado
  useEffect(() => {
    if (editando !== null) {
      const cliente = clientes.find((c) => c.id_interno === editando);
      if (cliente) {
        setFormData({
          nombre: cliente.nombre ?? "",
          correo: cliente.correo ?? "",
          telefono: cliente.telefono ?? "",
          whatsapp: cliente.whatsapp ?? "",
          direccion: cliente.direccion ?? "",
        });
      }
    }
  }, [editando, clientes]);

  const handleEdit = (cliente) => setEditando(cliente.id_interno);
  const handleCancel = () => {
    setEditando(null);
    setFormData({});
  };

  const handleChange = (e, campo) => {
    setFormData({ ...formData, [campo]: e.target.value });
  };

  // Guardar cambios en Supabase
  const handleSave = async (id_interno) => {
    const { error } = await supabase
      .from("clientes")
      .update({
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        whatsapp: formData.whatsapp, // ✅ directamente el número
        direccion: formData.direccion,
      })
      .eq("id_interno", id_interno);

    if (error) {
      console.error("Error al guardar cambios:", error);
      alert("No tienes permisos para editar este cliente o ocurrió un error.");
    } else {
      // Actualizar vista sin recargar
      setClientes((prev) =>
        prev.map((c) =>
          c.id_interno === id_interno
            ? { ...c, ...formData }
            : c
        )
      );
      setEditando(null);
    }
  };

  return (
    <div className={styles.clientesContainer}>
      <div className={styles.clientesPanel}>
        <h2 className={styles.titulo}>Gestión de Clientes</h2>

        <div className={styles.tablaResponsive}>
          <table className={styles.tablaClientes}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>WhatsApp</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.sinRegistros}>
                    No hay clientes registrados.
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id_interno}>
                    <td>{cliente.id_interno}</td>

                    {/* Nombre */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => handleChange(e, "nombre")}
                        />
                      ) : (
                        cliente.nombre || "—"
                      )}
                    </td>

                    {/* Correo */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <input
                          className={styles.inputEdit}
                          type="email"
                          value={formData.correo}
                          onChange={(e) => handleChange(e, "correo")}
                        />
                      ) : (
                        cliente.correo || "—"
                      )}
                    </td>

                    {/* Teléfono */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          value={formData.telefono}
                          onChange={(e) => handleChange(e, "telefono")}
                        />
                      ) : (
                        cliente.telefono || "—"
                      )}
                    </td>

                    {/* WhatsApp — SIN “Sí/No” */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          placeholder="Número de WhatsApp"
                          value={formData.whatsapp}
                          onChange={(e) => handleChange(e, "whatsapp")}
                        />
                      ) : (
                        cliente.whatsapp || "—"
                      )}
                    </td>

                    {/* Dirección */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          value={formData.direccion}
                          onChange={(e) => handleChange(e, "direccion")}
                        />
                      ) : (
                        cliente.direccion || "—"
                      )}
                    </td>

                    {/* Acciones */}
                    <td>
                      {editando === cliente.id_interno ? (
                        <div className={styles.acciones}>
                          <button
                            className={styles.guardar}
                            onClick={() => handleSave(cliente.id_interno)}
                          >
                            Guardar
                          </button>
                          <button
                            className={styles.cancelar}
                            onClick={handleCancel}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.editar}
                          onClick={() => handleEdit(cliente)}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
