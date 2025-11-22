import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/repuestos.module.css";

export default function AdminRepuestos() {
  const [repuestos, setRepuestos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [nuevoRepuesto, setNuevoRepuesto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    precio_unitario: "",
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarRepuestos();
  }, []);

  const cargarRepuestos = async () => {
    const { data, error } = await supabase
      .from("repuestos")
      .select("*")
      .order("id_repuesto", { ascending: true });
    if (error) console.error(error);
    else setRepuestos(data);
  };

  const handleEdit = (rep) => {
    setEditandoId(rep.id_repuesto);
    setFormData({ ...rep });
    setMensaje("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    const { error } = await supabase
      .from("repuestos")
      .update({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        cantidad: parseInt(formData.cantidad, 10),
        precio_unitario: parseFloat(formData.precio_unitario),
      })
      .eq("id_repuesto", id);

    if (error) setMensaje("Error al actualizar: " + error.message);
    else {
      setEditandoId(null);
      cargarRepuestos();
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoRepuesto.nombre || !nuevoRepuesto.cantidad || !nuevoRepuesto.precio_unitario) {
      setMensaje("Completa los campos obligatorios.");
      return;
    }
    const { error } = await supabase.from("repuestos").insert([{
      nombre: nuevoRepuesto.nombre,
      descripcion: nuevoRepuesto.descripcion,
      cantidad: parseInt(nuevoRepuesto.cantidad, 10),
      precio_unitario: parseFloat(nuevoRepuesto.precio_unitario),
    }]);
    if (error) setMensaje("Error al crear: " + error.message);
    else {
      setShowModal(false);
      setNuevoRepuesto({ nombre: "", descripcion: "", cantidad: "", precio_unitario: "" });
      cargarRepuestos();
    }
  };

  return (
    <div className={styles.repuestosContainer}>
      <div className={styles.repuestosPanel}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className={styles.titulo}>Repuestos</h2>
          <button className={`${styles.btn} ${styles.guardar}`} onClick={() => setShowModal(true)}>
            + Crear Repuesto
          </button>
        </div>

        {/* Tabla */}
        <div className={styles.tablaResponsive}>
          <table className={styles.repuestosTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {repuestos.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.sinRegistros}>No hay repuestos registrados.</td>
                </tr>
              ) : (
                repuestos.map((rep) => (
                  <tr key={rep.id_repuesto}>
                    <td>{rep.id_repuesto}</td>
                    {editandoId === rep.id_repuesto ? (
                      <>
                        <td>
                          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={styles.inputEdit}/>
                        </td>
                        <td>
                          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className={styles.inputEdit}/>
                        </td>
                        <td>
                          <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} className={styles.inputEdit}/>
                        </td>
                        <td>
                          <input type="number" name="precio_unitario" step="0.01" value={formData.precio_unitario} onChange={handleChange} className={styles.inputEdit}/>
                        </td>
                        <td className={styles.acciones}>
                          <button className={`${styles.btn} ${styles.guardar}`} onClick={() => handleSave(rep.id_repuesto)}>Guardar</button>
                          <button className={styles.btnCancelar} onClick={() => setEditandoId(null)}>Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{rep.nombre}</td>
                        <td>{rep.descripcion}</td>
                        <td>{rep.cantidad}</td>
                        <td>{rep.precio_unitario}</td>
                        <td className={styles.acciones}>
                          <button className={`${styles.btn} ${styles.editar}`} onClick={() => handleEdit(rep)}>Editar</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleCrear} className={styles.modal}>
            <h3>Crear Nuevo Repuesto</h3>

            <div className={styles.formGroup}>
              <label>Nombre:</label>
              <input
                type="text"
                value={nuevoRepuesto.nombre}
                onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, nombre: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descripción:</label>
              <input
                type="text"
                value={nuevoRepuesto.descripcion}
                onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, descripcion: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Cantidad:</label>
              <input
                type="number"
                value={nuevoRepuesto.cantidad}
                onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, cantidad: e.target.value })}
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Precio Unitario:</label>
              <input
                type="number"
                step="0.01"
                value={nuevoRepuesto.precio_unitario}
                onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, precio_unitario: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className={styles.modalButtons}>
              <button type="submit" className={`${styles.btn} ${styles.guardar}`}>Crear</button>
              <button type="button" className={styles.btnCancelar} onClick={() => setShowModal(false)}>Cancelar</button>
            </div>

            {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
