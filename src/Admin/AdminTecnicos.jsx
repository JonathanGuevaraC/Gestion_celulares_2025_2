import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/tecnicos.module.css";

export default function TecnicosTable() {
  const [tecnicos, setTecnicos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [nuevoTecnico, setNuevoTecnico] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    especialidad: "",
    rol: "Técnico",
    clave: "",
  });

  useEffect(() => {
    obtenerTecnicos();
  }, []);

  const obtenerTecnicos = async () => {
    const { data, error } = await supabase
      .from("tecnicos")
      .select("*")
      .order("orden", { ascending: true });
    if (error) console.error("Error al obtener técnicos:", error);
    else setTecnicos(data);
  };

  const handleEdit = (tecnico) => {
    setEditando(tecnico.id_tecnico);
    setFormData({ ...tecnico });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id_tecnico) => {
    const { error } = await supabase
      .from("tecnicos")
      .update(formData)
      .eq("id_tecnico", id_tecnico);

    if (error) console.error("Error al actualizar técnico:", error);
    else {
      setEditando(null);
      obtenerTecnicos();
    }
  };

  const handleDelete = async (id_tecnico) => {
    if (!window.confirm("¿Seguro que deseas eliminar este técnico?")) return;
    const { error } = await supabase
      .from("tecnicos")
      .delete()
      .eq("id_tecnico", id_tecnico);

    if (error) console.error("Error al eliminar técnico:", error);
    else obtenerTecnicos();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke("crear_tecnico", {
        body: {
          email: nuevoTecnico.correo,
          password: nuevoTecnico.clave,
          nombre: nuevoTecnico.nombre,
          telefono: nuevoTecnico.telefono,
          especialidad: nuevoTecnico.especialidad,
          rol: nuevoTecnico.rol,
        },
      });

      if (error) {
        console.error("Error en edge function:", error);
        alert("❌ No se pudo crear el técnico.");
        return;
      }

      alert("✅ Técnico creado correctamente.");
      setShowModal(false);

      setNuevoTecnico({
        nombre: "",
        correo: "",
        telefono: "",
        especialidad: "",
        rol: "Técnico",
        clave: "",
      });

      obtenerTecnicos();
    } catch (err) {
      console.error("Error general:", err);
      alert("❌ Fallo al crear técnico.");
    }
  };

  return (
    <div className={styles.tecnicosContainer}>
      <div className={styles.tecnicosPanel}>
        {/* Encabezado: título + botón */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className={styles.titulo}>Técnicos</h2>
          <button
            className={`${styles.btn} ${styles.guardar}`}
            onClick={() => setShowModal(true)}
          >
            + Crear Técnico
          </button>
        </div>

        {/* Tabla responsive */}
        <div className={styles.tablaResponsive}>
          <table className={styles.tecnicosTable}>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tecnicos.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.sinRegistros}>
                    No hay técnicos registrados.
                  </td>
                </tr>
              ) : (
                tecnicos.map((tec) => (
                  <tr key={tec.id_tecnico}>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <input
                          className={styles.inputEdit}
                          type="number"
                          name="orden"
                          value={formData.orden}
                          onChange={handleChange}
                        />
                      ) : (
                        tec.orden
                      )}
                    </td>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                        />
                      ) : (
                        tec.nombre
                      )}
                    </td>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <input
                          className={styles.inputEdit}
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                        />
                      ) : (
                        tec.correo
                      )}
                    </td>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                        />
                      ) : (
                        tec.telefono
                      )}
                    </td>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <input
                          className={styles.inputEdit}
                          type="text"
                          name="especialidad"
                          value={formData.especialidad}
                          onChange={handleChange}
                        />
                      ) : (
                        tec.especialidad
                      )}
                    </td>
                    <td>
                      {editando === tec.id_tecnico ? (
                        <select
                          className={styles.selectEdit}
                          name="rol"
                          value={formData.rol}
                          onChange={handleChange}
                        >
                          <option value="Técnico">Técnico</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                      ) : (
                        tec.rol
                      )}
                    </td>
                    <td className={styles.acciones}>
                      {editando === tec.id_tecnico ? (
                        <button
                          className={`${styles.btn} ${styles.guardar}`}
                          onClick={() => handleSave(tec.id_tecnico)}
                        >
                          Guardar
                        </button>
                      ) : (
                        <>
                          <button
                            className={`${styles.btn} ${styles.editar}`}
                            onClick={() => handleEdit(tec)}
                          >
                            Editar
                          </button>
                          <button
                            className={`${styles.btn} ${styles.eliminar}`}
                            onClick={() => handleDelete(tec.id_tecnico)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Crear Nuevo Técnico</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={nuevoTecnico.nombre}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Correo:</label>
                <input
                  type="email"
                  value={nuevoTecnico.correo}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, correo: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Contraseña:</label>
                <input
                  type="password"
                  value={nuevoTecnico.clave}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, clave: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Teléfono:</label>
                <input
                  type="text"
                  value={nuevoTecnico.telefono}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, telefono: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Especialidad:</label>
                <input
                  type="text"
                  value={nuevoTecnico.especialidad}
                  onChange={(e) =>
                    setNuevoTecnico({
                      ...nuevoTecnico,
                      especialidad: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Rol:</label>
                <select
                  value={nuevoTecnico.rol}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, rol: e.target.value })
                  }
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={`${styles.btn} ${styles.guardar}`}>
                  Crear
                </button>
                <button
                  type="button"
                  className={styles.btnCancelar}
                  onClick={() => setShowModal(false)}
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
