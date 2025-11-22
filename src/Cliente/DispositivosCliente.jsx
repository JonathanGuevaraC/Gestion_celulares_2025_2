import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import TablaDispositivos from "./Tablas/TablaDispositivos";

export default function DispositivosCliente() {
  const [dispositivos, setDispositivos] = useState([]);

  useEffect(() => {
    (async () => {
      // 1️⃣ Obtener usuario logueado
      const { data: authData } = await supabase.auth.getUser();
      const uuid = authData?.user?.id;
      if (!uuid) return;

      // 2️⃣ Obtener id_interno del cliente
      const { data: cliente } = await supabase
        .from("clientes")
        .select("id_interno")
        .eq("id_cliente", uuid)
        .single();

      if (!cliente) return;

      // 3️⃣ Obtener dispositivos usando id_interno
      const { data: dispositivosData } = await supabase
        .from("dispositivos")
        .select("*")
        .eq("id_cliente", cliente.id_interno);

      setDispositivos(dispositivosData || []);
    })();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-8">Mis Dispositivos</h2>
      <TablaDispositivos dispositivos={dispositivos} />
    </div>
  );
}
