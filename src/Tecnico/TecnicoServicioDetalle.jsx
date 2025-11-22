import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/tecnico.module.css";
import { useParams, useNavigate } from "react-router-dom";

export default function TecnicoServicioDetalle() {
  const { id } = useParams(); // id_orden
  const [orden, setOrden] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [observacion, setObservacion] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [repuestoId, setRepuestoId] = useState("");
  const [cantidadRepuesto, setCantidadRepuesto] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetchDetalle();
  }, [id]);

  const fetchDetalle = async () => {
    setLoading(true);
    const { data: ordenData, error } = await supabase
      .from("ordenes")
      .select("*, dispositivos(*)")
      .eq("id_orden", id)
      .single();

    if (error || !ordenData) {
      console.error(error);
      setLoading(false);
      return;
    }

    setOrden(ordenData);

    if (ordenData.dispositivos?.id_cliente) {
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id_interno, nombre, telefono, correo, direccion")
        .eq("id_interno", ordenData.dispositivos.id_cliente)
        .single();
      setCliente(clienteData || null);
    }

    setNuevoEstado(ordenData.estado || "");
    setObservacion(ordenData.observaciones || "");
    setLoading(false);
  };

  const actualizarEstado = async () => {
    const { error } = await supabase
      .from("ordenes")
      .update({ estado: nuevoEstado, observaciones: observacion })
      .eq("id_orden", id);

    if (error) return alert("Error actualizando: " + error.message);
    alert("Estado actualizado");
    fetchDetalle();
  };

  const registrarRepuesto = async () => {
    if (!repuestoId) return alert("Selecciona un repuesto");
    const { error } = await supabase
      .from("orden_repuestos")
      .insert([{ id_orden: Number(id), id_repuesto: Number(repuestoId), cantidad_usada: Number(cantidadRepuesto) }]);

    if (error) return alert("Error registrando repuesto: " + error.message);
    alert("Repuesto registrado");
  };

  const generarReporte = async () => {
    // crea un reporte básico con fecha y observación (satisfacción opcional)
    const { error } = await supabase.from("reportes").insert([{
      id_orden: Number(id),
      tiempo_reparacion: null,
      satisfaccion_cliente: null,
      comentarios: observacion
    }]);
    if (error) return alert("Error creando reporte: " + error.message);
    alert("Reporte creado");
    navigate("/tecnico");
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!orden) return <div className={styles.loading}>Orden no encontrada</div>;

  return (
    <div className={styles.detalleContainer}>
      <h2>Orden #{orden.id_orden}</h2>

      <section className={styles.detalleCard}>
        <h4>Dispositivo</h4>
        <p><strong>Marca/Modelo:</strong> {orden.dispositivos?.marca} {orden.dispositivos?.modelo}</p>
        <p><strong>IMEI:</strong> {orden.dispositivos?.imei}</p>
        <p><strong>Problema:</strong> {orden.dispositivos?.descripcion_problema}</p>
      </section>

      <section className={styles.detalleCard}>
        <h4>Cliente</h4>
        {cliente ? (
          <>
            <p><strong>Nombre:</strong> {cliente.nombre}</p>
            <p><strong>Tel:</strong> {cliente.telefono}</p>
            <p><strong>Correo:</strong> {cliente.correo}</p>
            <p><strong>Dirección:</strong> {cliente.direccion}</p>
          </>
        ) : <p>No hay cliente asociado</p>}
      </section>

      <section className={styles.detalleCard}>
        <h4>Actualizar</h4>
        <label>Estado</label>
        <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
          <option value="Pendiente">Pendiente</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Finalizada">Finalizada</option>
          <option value="Entregada">Entregada</option>
        </select>

        <label>Observaciones</label>
        <textarea value={observacion} onChange={e => setObservacion(e.target.value)} rows={4} />

        <div style={{ marginTop: 12 }}>
          <button className={styles.btn} onClick={actualizarEstado}>Guardar cambios</button>
          <button className={styles.btnAlt} onClick={generarReporte}>Generar reporte</button>
        </div>
      </section>

      <section className={styles.detalleCard}>
        <h4>Registrar repuesto usado</h4>
        <input type="number" placeholder="ID repuesto" value={repuestoId} onChange={e => setRepuestoId(e.target.value)} />
        <input type="number" min="1" placeholder="cantidad" value={cantidadRepuesto} onChange={e => setCantidadRepuesto(e.target.value)} />
        <button className={styles.btn} onClick={registrarRepuesto}>Registrar repuesto</button>
      </section>
    </div>
  );
}
