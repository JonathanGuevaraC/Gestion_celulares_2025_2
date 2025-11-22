import { useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import styles from './css/LoginPage.module.css'

export default function LoginPage() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [modalEstado, setModalEstado] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMensaje('')

    const { data: sessionData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: correo,
        password: clave,
      })

    if (loginError) return setMensaje('Credenciales incorrectas')

    const email = sessionData.user.email

    const { data: tecnico } = await supabase
      .from('tecnicos')
      .select('rol')
      .eq('correo', email)
      .maybeSingle()

    if (tecnico) {
      return navigate(tecnico.rol === 'Administrador' ? '/admin' : '/tecnico')
    }

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id_cliente')
      .eq('correo', email)
      .maybeSingle()

    if (cliente) return navigate('/cliente')

    setMensaje('Usuario no registrado en el sistema.')
  }

  const handleSeguimiento = async () => {
    setMensaje('')

    if (!codigo.trim()) {
      return setMensaje('Ingrese un código válido')
    }

    const { data, error } = await supabase
      .from('ordenes')
      .select('estado')
      .eq('codigo_seguimiento', codigo.trim())
      .single()

    if (error || !data) {
      setModalEstado('Código no válido')
      return
    }

    setModalEstado(data.estado)
  }

  return (
    <div className={styles.loginPage}>
      <h2 className={styles.title}>Taller de Celulares</h2>

      <div className={styles.loginContainer}>
        <div className={styles.card}>
          <h3>Inicio de Sesión</h3>
          <form onSubmit={handleLogin}>
            <input
              className={styles.input}
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Clave"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />

            <button className={styles.button} type="submit">
              Ingresar
            </button>
          </form>

          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => navigate('/register')}
          >
            Crear nuevo usuario
          </button>
        </div>

        <div className={styles.card}>
          <h3>Consultar Estado de Orden</h3>
          <input
            className={styles.input}
            type="text"
            placeholder="Código de seguimiento"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <button className={styles.button} onClick={handleSeguimiento}>
            Consultar
          </button>
        </div>
      </div>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}

      {modalEstado && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Estado de la orden</h3>
            <p>{modalEstado}</p>

            <button
              className={styles.button}
              onClick={() => setModalEstado(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
