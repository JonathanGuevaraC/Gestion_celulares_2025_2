// GenerarGarantia.jsx
import { useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/dispositivos.module.css";

export default function GenerarGarantia({ orden, onClose, onCreated }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCrearGarantia = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fechaInicio || !fechaFin) {
      setErrorMsg("Debes ingresar fecha inicio y fecha fin.");
      return;
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setErrorMsg("La fecha fin debe ser mayor o igual a la fecha inicio.");
      return;
    }

    setLoading(true);

    // 1) Insertar garantía
    const { data: garantiaData, error: garantiaError } = await supabase
      .from("garantias")
      .insert([
        {
          id_orden: orden.id_orden,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          descripcion: descripcion || null,
        }
      ])
      .select("id_garantia")
      .single();

    if (garantiaError) {
      setErrorMsg("Error creando garantía: " + garantiaError.message);
      setLoading(false);
      return;
    }

    const idGarantia = garantiaData.id_garantia;

    // 2) Insertar reporte automático (puedes adaptar campos según necesites)
    // dejamos tiempo_reparacion y satisfaccion_cliente null; guardamos comentario con referencia
    const comentario = `Garantía creada (id: ${idGarantia}) para orden ${orden.id_orden}. ${descripcion || ""}`;

    const { error: reporteError } = await supabase
      .from("reportes")
      .insert([
        {
          id_orden: orden.id_orden,
          comentarios: comentario
          // tiempo_reparacion y satisfaccion_cliente opcionales / null
        }
      ]);

    if (reporteError) {
      // no detenemos la creación de la garantía, pero avisamos
      console.warn("Error creando reporte automático: ", reporteError);
    }

    setLoading(false);
    // callback para que el padre refresque
    if (onCreated) onCreated();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Generar Garantía - Orden #{orden.id_orden}</h3>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        <form onSubmit={handleCrearGarantia}>
          <label>Fecha inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />

          <label>Fecha fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />

          <label>Descripción de la garantía:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles de la garantía (qué cubre, condiciones, etc.)"
          />

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button
              className={`${styles.btn} ${styles.guardar}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Garantía"}
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.cancelar}`}
              onClick={() => onClose && onClose()}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
