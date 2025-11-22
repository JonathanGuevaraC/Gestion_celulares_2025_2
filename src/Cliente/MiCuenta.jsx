import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import styles from "./css/MiCuentaCliente.module.css";

export default function MiCuenta() {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      const id = user?.user?.id;

      if (!id) return;

      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("id_cliente", id)
        .single();

      setCliente(data);
    })();
  }, []);

  if (!cliente) return <p className={styles.loading}>Cargando...</p>;

  return (
      <div className={styles.container}>
        <div className={styles.infoBlock}>
          <p>
            <span className={styles.label}>Teléfono:</span>{" "}
            <span className={styles.value}>
              {cliente.telefono || "No registrado"}
            </span>
          </p>
          <p>
            <span className={styles.label}>Dirección:</span>{" "}
            <span className={styles.value}>
              {cliente.direccion || "No registrada"}
            </span>
          </p>
        </div>

        <div className={styles.infoBlock}>
          <p>
            <span className={styles.label}>Nombre:</span>{" "}
            <span className={styles.value}>{cliente.nombre}</span>
          </p>
          <p>
            <span className={styles.label}>Correo:</span>{" "}
            <span className={styles.value}>{cliente.correo}</span>
          </p>
        </div>
      </div>
    
  );
}
