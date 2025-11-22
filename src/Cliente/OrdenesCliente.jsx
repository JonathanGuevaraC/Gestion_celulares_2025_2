import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import TablaOrdenes from "./Tablas/TablaOrdenes";

export default function OrdenesCliente() {
  const [ordenes, setOrdenes] = useState([]);
useEffect(() => {
  (async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id; // UUID del usuario

    if (!userId) return;

    // 1. Obtener el id_interno del cliente logueado
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id_interno")
      .eq("id_cliente", userId)
      .single();

    if (!cliente) {
      console.log("Cliente no encontrado");
      return;
    }

    const idInterno = cliente.id_interno;

    // 2. Buscar dispositivos usando id_interno (NO el uuid)
    const { data: dispositivos } = await supabase
      .from("dispositivos")
      .select("id_dispositivo")
      .eq("id_cliente", idInterno);

    if (!dispositivos || dispositivos.length === 0) {
      setOrdenes([]);
      return;
    }

    const ids = dispositivos.map((d) => d.id_dispositivo);

    // 3. Buscar órdenes de esos dispositivos
    const { data: ordenes } = await supabase
      .from("ordenes")
      .select("*, dispositivos(*), tecnicos(nombre)")
      .in("id_dispositivo", ids);

    setOrdenes(ordenes || []);
  })();
}, []);


  return (
    <div>
      <h2 className="text-3xl font-semibold mb-8">Mis Órdenes</h2>
      <TablaOrdenes ordenes={ordenes} />
    </div>
  );
}
