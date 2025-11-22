import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/dispositivos.module.css";

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrear, setShowCrear] = useState(false);

  // Datos del formulario
  const [clientes, setClientes] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [repuestos, setRepuestos] = useState([]);

  const [idCliente, setIdCliente] = useState("");
  const [idDispositivo, setIdDispositivo] = useState("");
  const [idTecnico, setIdTecnico] = useState("");

  const [fechaRecepcion, setFechaRecepcion] = useState("");
  const [costoEstimado, setCostoEstimado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [selectedRepuesto, setSelectedRepuesto] = useState("");
  const [cantidadRepuesto, setCantidadRepuesto] = useState(1);
  const [listaRepuestos, setListaRepuestos] = useState([]);

  // =============================
  // MODALES PARA DETALLE Y REPUESTOS
  // =============================
  const [showDetalle, setShowDetalle] = useState(false);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [repuestosUsados, setRepuestosUsados] = useState([]);

  const [showAgregarRepuesto, setShowAgregarRepuesto] = useState(false);

  // Estado editable en el modal de detalle
  const [nuevoEstado, setNuevoEstado] = useState("");

  // =============================
  // 🔹 Cargar datos
  // =============================
  const fetchOrdenes = async () => {
    setLoading(true);

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
          id_dispositivo,
          marca,
          modelo,
          clientes (
            id_interno,
            nombre
          )
        ),

        tecnicos (
          nombre
        )
      `)
      .order("id_orden", { ascending: true });

    if (!error) setOrdenes(data);
    setLoading(false);
  };

  const fetchClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id_interno, nombre")
      .order("nombre");
    setClientes(data);
  };

  const fetchDispositivos = async (id) => {
    const { data } = await supabase
      .from("dispositivos")
      .select("id_dispositivo, marca, modelo")
      .eq("id_cliente", id);

    setDispositivos(data);
  };

  const fetchTecnicos = async () => {
    const { data } = await supabase
      .from("tecnicos")
      .select("id_tecnico, nombre")
      .order("nombre");
    setTecnicos(data);
  };

  const fetchRepuestos = async () => {
    const { data } = await supabase
      .from("repuestos")
      .select("id_repuesto, nombre, cantidad");

    setRepuestos(data);
  };

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
    fetchTecnicos();
    fetchRepuestos();
  }, []);

  // =============================
  // 🔹 Agregar repuesto temporal en creación
  // =============================
  const agregarRepuesto = () => {
    if (!selectedRepuesto || cantidadRepuesto <= 0) {
      setMensaje("Debes seleccionar un repuesto y una cantidad válida.");
      return;
    }

    const repuesto = repuestos.find(r => r.id_repuesto == selectedRepuesto);
    if (!repuesto) return;

    if (cantidadRepuesto > repuesto.cantidad) {
      setMensaje("La cantidad solicitada supera el stock disponible.");
      return;
    }

    const item = {
      id_repuesto: repuesto.id_repuesto,
      nombre: repuesto.nombre,
      cantidad: cantidadRepuesto
    };

    setListaRepuestos([...listaRepuestos, item]);

    setSelectedRepuesto("");
    setCantidadRepuesto(1);
  };

  // =============================
  // 🔹 Crear orden
  // =============================
  const handleCrearOrden = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!idCliente || !idDispositivo || !fechaRecepcion) {
      setMensaje("Todos los campos obligatorios deben ser llenados.");
      return;
    }

    const codigoSeguimiento =
      "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: ordenCreada, error: errorOrden } = await supabase
      .from("ordenes")
      .insert([
        {
          id_dispositivo: idDispositivo,
          id_tecnico: idTecnico || null,
          fecha_recepcion: fechaRecepcion,
          estado: "Pendiente",
          costo_estimado: costoEstimado || null,
          observaciones,
          codigo_seguimiento: codigoSeguimiento,
        },
      ])
      .select("id_orden")
      .single();

    if (errorOrden) {
      setMensaje("Error al crear orden: " + errorOrden.message);
      return;
    }

    const idOrden = ordenCreada.id_orden;

    for (const item of listaRepuestos) {
      await supabase.from("orden_repuestos").insert([
        {
          id_orden: idOrden,
          id_repuesto: item.id_repuesto,
          cantidad_usada: item.cantidad,
        },
      ]);

      await supabase.rpc("restar_stock_repuesto", {
        id_repuesto_input: item.id_repuesto,
        cantidad_input: item.cantidad,
      });
    }

    setMensaje("¡Orden creada correctamente!");

    setListaRepuestos([]);
    setShowCrear(false);

    fetchOrdenes();
    fetchRepuestos();
  };

  // =============================
  // 🔹 Abrir detalle completo (inicializa nuevoEstado)
  // =============================
  const abrirDetalleOrden = async (idOrden) => {
    const { data: orden } = await supabase
      .from("ordenes")
      .select(`
        *,
        dispositivos (marca, modelo, clientes (nombre)),
        tecnicos (nombre)
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
    // inicializa el select de estado con el estado actual de la orden
    setNuevoEstado(orden?.estado || "");
    setShowDetalle(true);
  };

  // =============================
  // 🔹 Actualizar estado desde el modal de detalle (select + guardar)
  // =============================
  const actualizarEstado = async () => {
    if (!ordenDetalle) return;

    // no intentar si es el mismo estado
    if (nuevoEstado === ordenDetalle.estado) {
      setShowDetalle(false);
      return;
    }

    const { error } = await supabase
      .from("ordenes")
      .update({ estado: nuevoEstado })
      .eq("id_orden", ordenDetalle.id_orden);

    if (error) {
      setMensaje("Error actualizando estado: " + error.message);
      return;
    }

    // actualizar localmente el detalle para reflejar cambio inmediato
    setOrdenDetalle({ ...ordenDetalle, estado: nuevoEstado });

    // refrescar tabla principal
    fetchOrdenes();

    setShowDetalle(false);
  };

  // =============================
  // 🔹 Agregar repuestos a una orden existente
  // =============================
  const agregarRepuestoAOrdenExistente = async (idOrden) => {
    if (!selectedRepuesto || cantidadRepuesto <= 0) {
      alert("Selecciona repuesto y cantidad válida.");
      return;
    }

    await supabase.from("orden_repuestos").insert([
      {
        id_orden: idOrden,
        id_repuesto: selectedRepuesto,
        cantidad_usada: cantidadRepuesto
      }
    ]);

    await supabase.rpc("restar_stock_repuesto", {
      id_repuesto_input: selectedRepuesto,
      cantidad_input: cantidadRepuesto,
    });

    abrirDetalleOrden(idOrden);
    setShowAgregarRepuesto(false);
  };

  // ======================================================================================
  //                                     RETORNO UI
  // ======================================================================================
  return (
    <div className={styles.dispositivosContainer}>
      <div className={styles.dispositivosPanel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className={styles.titulo}>Órdenes</h2>

          <button
            className={`${styles.btn} ${styles.guardar}`}
            onClick={() => setShowCrear(true)}
          >
            + Crear Orden
          </button>
        </div>

        <div className={styles.tablaResponsive}>
          {loading ? (
            <p>Cargando órdenes...</p>
          ) : (
            <table className={styles.tablaDispositivos}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Dispositivo</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>F. Recepción</th>
                  <th>F. Entrega</th>
                  <th>Costo Final</th>
                  <th>Seguimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ordenes.length === 0 ? (
                  <tr>
                    <td colSpan="10" className={styles.sinRegistros}>
                      No hay órdenes registradas.
                    </td>
                  </tr>
                ) : (
                  ordenes.map((o) => (
                    <tr key={o.id_orden}>
                      <td>{o.id_orden}</td>
                      <td>{o.dispositivos?.clientes?.nombre}</td>
                      <td>
                        {o.dispositivos?.marca} {o.dispositivos?.modelo}
                      </td>
                      <td>{o.tecnicos?.nombre || "Sin asignar"}</td>
                      <td>{o.estado}</td>
                      <td>{o.fecha_recepcion}</td>
                      <td>{o.fecha_entrega || "—"}</td>
                      <td>{o.costo_final || "—"}</td>
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
      </div>

      {/* ============================
            MODAL CREAR ORDEN
        ============================ */}
      {showCrear && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Crear Orden</h3>
            {mensaje && <p>{mensaje}</p>}

            <form onSubmit={handleCrearOrden}>
              <label>Cliente:</label>
              <select
                value={idCliente}
                onChange={(e) => {
                  setIdCliente(e.target.value);
                  fetchDispositivos(e.target.value);
                }}
                required
              >
                <option value="">--Selecciona un cliente--</option>
                {clientes.map((c) => (
                  <option key={c.id_interno} value={c.id_interno}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label>Dispositivo:</label>
              <select
                value={idDispositivo}
                onChange={(e) => setIdDispositivo(e.target.value)}
                required
              >
                <option value="">--Selecciona un dispositivo--</option>
                {dispositivos.map((d) => (
                  <option key={d.id_dispositivo} value={d.id_dispositivo}>
                    {d.marca} {d.modelo}
                  </option>
                ))}
              </select>

              <label>Técnico:</label>
              <select
                value={idTecnico}
                onChange={(e) => setIdTecnico(e.target.value)}
              >
                <option value="">--Sin asignar--</option>
                {tecnicos.map((t) => (
                  <option key={t.id_tecnico} value={t.id_tecnico}>
                    {t.nombre}
                  </option>
                ))}
              </select>

              <label>Fecha de Recepción:</label>
              <input
                type="date"
                value={fechaRecepcion}
                onChange={(e) => setFechaRecepcion(e.target.value)}
                required
              />

              <label>Costo Estimado:</label>
              <input
                type="number"
                value={costoEstimado}
                onChange={(e) => setCostoEstimado(e.target.value)}
              />

              <label>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />

              <hr />
              <h4>Repuestos usados</h4>

              <label>Repuesto:</label>
              <select
                value={selectedRepuesto}
                onChange={(e) => setSelectedRepuesto(e.target.value)}
              >
                <option value="">--Selecciona un repuesto--</option>
                {repuestos.map((r) => (
                  <option key={r.id_repuesto} value={r.id_repuesto}>
                    {r.nombre} (Stock: {r.cantidad})
                  </option>
                ))}
              </select>

              <label>Cantidad usada:</label>
              <input
                type="number"
                min="1"
                value={cantidadRepuesto}
                onChange={(e) => setCantidadRepuesto(e.target.value)}
              />

              <button
                type="button"
                className={`${styles.btn} ${styles.guardar}`}
                onClick={agregarRepuesto}
              >
                + Agregar repuesto
              </button>

              <div style={{ marginTop: "10px" }}>
                {listaRepuestos.length === 0 ? (
                  <p>No hay repuestos agregados.</p>
                ) : (
                  <ul>
                    {listaRepuestos.map((item, i) => (
                      <li key={i}>
                        {item.nombre} — Cantidad: {item.cantidad}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button
                  className={`${styles.btn} ${styles.guardar}`}
                  type="submit"
                >
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

      {/* ============================
            MODAL DETALLE ORDEN
        ============================ */}
      {showDetalle && ordenDetalle && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Detalle de Orden #{ordenDetalle.id_orden}</h3>

            <p><b>Cliente:</b> {ordenDetalle.dispositivos.clientes.nombre}</p>
            <p><b>Dispositivo:</b> {ordenDetalle.dispositivos.marca} {ordenDetalle.dispositivos.modelo}</p>
            <p><b>Técnico:</b> {ordenDetalle.tecnicos?.nombre || "Sin asignar"}</p>
            <p><b>Estado:</b> {ordenDetalle.estado}</p>

            <hr />
            <h4>Repuestos usados</h4>

            {repuestosUsados.length === 0 ? (
              <p>No se han usado repuestos.</p>
            ) : (
              <ul>
                {repuestosUsados.map((r, i) => (
                  <li key={i}>{r.repuestos.nombre} — {r.cantidad_usada} unidades</li>
                ))}
              </ul>
            )}

            {/* --- Cambio de estado (select + guardar) --- */}
            <div style={{ marginTop: 12 }}>
              <h4>Cambiar Estado</h4>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
              >
                <option value="">--Seleccionar estado--</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Listo">Listo</option>
                <option value="Entregado">Entregado</option>
              </select>

              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button
                  className={`${styles.btn} ${styles.guardar}`}
                  onClick={actualizarEstado}
                >
                  Guardar Cambios
                </button>

                <button
                  className={`${styles.btn} ${styles.cancelar}`}
                  onClick={() => setShowDetalle(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                className={styles.btn}
                onClick={() => setShowAgregarRepuesto(true)}
                style={{ marginTop: 8 }}
              >
                Agregar Repuestos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
            MODAL AGREGAR REPUESTO
        ============================ */}
      {showAgregarRepuesto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Agregar Repuesto a la Orden</h3>

            <label>Repuesto:</label>
            <select
              value={selectedRepuesto}
              onChange={(e) => setSelectedRepuesto(e.target.value)}
            >
              <option value="">--Selecciona un repuesto--</option>
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
              onClick={() =>
                agregarRepuestoAOrdenExistente(ordenDetalle.id_orden)
              }
            >
              Agregar
            </button>

            <button
              className={styles.btnCancelar}
              onClick={() => setShowAgregarRepuesto(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
