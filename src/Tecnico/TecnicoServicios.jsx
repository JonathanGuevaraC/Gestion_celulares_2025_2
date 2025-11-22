import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/tecnico.module.css";

export default function TecnicoServicios() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showDetalle, setShowDetalle] = useState(false);
  const [showCrear, setShowCrear] = useState(false);
  const [showAgregarRepuesto, setShowAgregarRepuesto] = useState(false);

  const [ordenDetalle, setOrdenDetalle] = useState(null);

  // Repuestos
  const [repuestos, setRepuestos] = useState([]);
  const [repuestosUsados, setRepuestosUsados] = useState([]);

  const [selectedRepuesto, setSelectedRepuesto] = useState("");
  const [cantidadRepuesto, setCantidadRepuesto] = useState(1);

  const [nuevoEstado, setNuevoEstado] = useState("");

  // Crear orden
  const [dispositivoId, setDispositivoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dispositivosCliente, setDispositivosCliente] = useState([]);

  const [mensaje, setMensaje] = useState("");

  // ============================================
  // Cargar órdenes del técnico
  // ============================================
  const fetchOrdenes = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const tech = userData?.user;

    if (!tech) return;

    const { data, error } = await supabase
      .from("ordenes")
      .select(`
        id_orden,
        fecha_recepcion,
        fecha_entrega,
        estado,
        costo_final,
        codigo_seguimiento,
        dispositivos (
          marca,
          modelo,
          clientes:clientes (nombre)
        )
      `)
      .eq("id_tecnico", tech.id)
      .order("fecha_recepcion", { ascending: false });

    if (!error) setOrdenes(data);
    setLoading(false);
  };

  const fetchRepuestos = async () => {
    const { data } = await supabase.from("repuestos").select("*");
    setRepuestos(data);
  };

  const fetchDispositivosCliente = async () => {
    const { data } = await supabase
      .from("dispositivos")
      .select("id_dispositivo, marca, modelo");

    setDispositivosCliente(data || []);
  };

  useEffect(() => {
    fetchOrdenes();
    fetchRepuestos();
    fetchDispositivosCliente();
  }, []);

  // ============================================
  // Abrir detalle
  // ============================================
  const abrirDetalleOrden = async (idOrden) => {
    const { data: orden } = await supabase
      .from("ordenes")
      .select(`
        *,
        dispositivos (
          marca,
          modelo,
          clientes:clientes (nombre)
        )
      `)
      .eq("id_orden", idOrden)
      .single();

    const { data: repList } = await supabase
      .from("orden_repuestos")
      .select(`
        cantidad_usada,
        repuestos (nombre)
      `)
      .eq("id_orden", idOrden);

    setOrdenDetalle(orden);
    setRepuestosUsados(repList || []);
    setNuevoEstado(orden?.estado);
    setShowDetalle(true);
  };

  // ============================================
  // Cambiar estado
  // ============================================
  const actualizarEstado = async () => {
    if (!ordenDetalle) return;

    const { error } = await supabase
      .from("ordenes")
      .update({ estado: nuevoEstado })
      .eq("id_orden", ordenDetalle.id_orden);

    if (error) {
      setMensaje("Error al actualizar estado.");
      return;
    }

    fetchOrdenes();
    setShowDetalle(false);
  };

  // ============================================
  // Agregar repuesto
  // ============================================
  const agregarRepuestoAOrden = async () => {
    if (!selectedRepuesto || cantidadRepuesto <= 0) return;

    await supabase.from("orden_repuestos").insert([
      {
        id_orden: ordenDetalle.id_orden,
        id_repuesto: selectedRepuesto,
        cantidad_usada: cantidadRepuesto,
      },
    ]);

    await supabase.rpc("restar_stock_repuesto", {
      id_repuesto_input: selectedRepuesto,
      cantidad_input: cantidadRepuesto,
    });

    abrirDetalleOrden(ordenDetalle.id_orden);
    setShowAgregarRepuesto(false);
  };

  // ============================================
  // Crear orden (CORREGIDO)
  // ============================================
  const crearOrden = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const tech = userData?.user;

    if (!dispositivoId || !descripcion) {
      setMensaje("Completa todos los campos");
      return;
    }

    const hoy = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("ordenes").insert([
      {
        observaciones: descripcion,
        id_dispositivo: dispositivoId,
        id_tecnico: tech.id,
        estado: "Pendiente",
        fecha_recepcion: hoy,
        codigo_seguimiento: crypto.randomUUID().slice(0, 8),
      },
    ]);

    if (error) {
      console.log(error);
      setMensaje("Error al crear la orden");
      return;
    }

    fetchOrdenes();
    setShowCrear(false);
    setDescripcion("");
    setDispositivoId("");
  };

  return (
    <div className={styles.panelModule}>
      <div className={styles.panelHeader}>
        <h3>Órdenes asignadas</h3>

        <button className={styles.btn} onClick={() => setShowCrear(true)}>
          Crear Orden
        </button>
      </div>

      <div className={styles.tablaResponsive}>
        {loading ? (
          <p>Cargando órdenes...</p>
        ) : (
          <table className={styles.tablaServicios}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Dispositivo</th>
                <th>Estado</th>
                <th>Recepción</th>
                <th>Entrega</th>
                <th>Seguimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan="8">No tienes órdenes asignadas.</td>
                </tr>
              ) : (
                ordenes.map((o) => (
                  <tr key={o.id_orden}>
                    <td>{o.id_orden}</td>
                    <td>{o.dispositivos?.clientes?.nombre}</td>
                    <td>
                      {o.dispositivos?.marca} {o.dispositivos?.modelo}
                    </td>
                    <td>{o.estado}</td>
                    <td>{o.fecha_recepcion}</td>
                    <td>{o.fecha_entrega || "—"}</td>
                    <td>{o.codigo_seguimiento}</td>
                    <td>
                      <button
                        className={styles.btn}
                        onClick={() => abrirDetalleOrden(o.id_orden)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ================== MODAL DETALLE ================== */}
      {showDetalle && ordenDetalle && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Orden #{ordenDetalle.id_orden}</h3>

            <p><b>Cliente:</b> {ordenDetalle.dispositivos.clientes.nombre}</p>
            <p>
              <b>Dispositivo:</b> {ordenDetalle.dispositivos.marca}{" "}
              {ordenDetalle.dispositivos.modelo}
            </p>

            <p><b>Estado actual:</b> {ordenDetalle.estado}</p>

            <hr />

            <h4>Repuestos usados</h4>
            {repuestosUsados.length === 0 ? (
              <p>No se han usado repuestos.</p>
            ) : (
              <ul>
                {repuestosUsados.map((r, i) => (
                  <li key={i}>
                    {r.repuestos.nombre} — {r.cantidad_usada} unidades
                  </li>
                ))}
              </ul>
            )}

            <hr />

            <h4>Cambiar Estado</h4>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Entregada">Entregada</option>
            </select>

            <button
              className={styles.btn}
              onClick={actualizarEstado}
              style={{ marginTop: "10px" }}
            >
              Guardar
            </button>

            <button
              className={styles.btn}
              onClick={() => setShowAgregarRepuesto(true)}
              style={{ marginTop: "10px" }}
            >
              Agregar Repuestos
            </button>

            <button
              className={styles.btnCancelar}
              onClick={() => setShowDetalle(false)}
              style={{ marginTop: "10px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ================== MODAL AGREGAR REPUESTO ================== */}
      {showAgregarRepuesto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Agregar Repuesto</h3>

            <label>Repuesto:</label>
            <select
              value={selectedRepuesto}
              onChange={(e) => setSelectedRepuesto(e.target.value)}
            >
              <option value="">--Selecciona--</option>
              {repuestos.map((r) => (
                <option key={r.id_repuesto} value={r.id_repuesto}>
                  {r.nombre} (Stock: {r.cantidad})
                </option>
              ))}
            </select>

            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              value={cantidadRepuesto}
              onChange={(e) => setCantidadRepuesto(e.target.value)}
            />

            <button
              className={styles.btn}
              onClick={agregarRepuestoAOrden}
              style={{ marginTop: "10px" }}
            >
              Agregar
            </button>

            <button
              className={styles.btnCancelar}
              onClick={() => setShowAgregarRepuesto(false)}
              style={{ marginTop: "10px" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ================== MODAL CREAR ORDEN ================== */}
      {showCrear && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Crear nueva orden</h3>

            <label>Selecciona dispositivo:</label>
            <select
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
            >
              <option value="">--Seleccionar--</option>
              {dispositivosCliente.map((d) => (
                <option key={d.id_dispositivo} value={d.id_dispositivo}>
                  {d.marca} {d.modelo}
                </option>
              ))}
            </select>

            <label>Descripción:</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <button className={styles.btn} onClick={crearOrden}>
              Crear
            </button>

            <button
              className={styles.btnCancelar}
              onClick={() => setShowCrear(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
