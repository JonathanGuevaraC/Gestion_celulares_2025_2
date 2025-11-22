import { useState } from "react";
import { supabase } from "../supabase/client";

export default function DispositivoForm({ clienteId, dispositivos, setDispositivos, setDispositivoSeleccionado }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [imei, setImei] = useState("");
  const [descripcion, setDescripcion] = useState("");

  async function handleAgregar(e) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("dispositivos")
      .insert([{ id_cliente: clienteId, marca, modelo, imei, descripcion_problema: descripcion }])
      .select()
      .single();
    if (!error) {
      setDispositivos([...dispositivos, data]);
      setDispositivoSeleccionado(data);
      setMarca(""); setModelo(""); setImei(""); setDescripcion("");
    }
  }

  return (
    <div>
      <form onSubmit={handleAgregar}>
        <input placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} required />
        <input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} required />
        <input placeholder="IMEI" value={imei} onChange={e => setImei(e.target.value)} required />
        <textarea placeholder="Descripción del problema" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <button type="submit">Agregar Dispositivo</button>
      </form>

      <ul>
        {dispositivos.filter(d => d.id_cliente === clienteId).map(d => (
          <li key={d.id_dispositivo} onClick={() => setDispositivoSeleccionado(d)}>
            {d.marca} {d.modelo} - {d.imei}
          </li>
        ))}
      </ul>
    </div>
  );
}
