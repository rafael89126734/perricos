import React, { useState, useEffect } from 'react';
import { Dog, Cat, Fish, Package, Search, Sparkles, X, Heart, ShieldCheck, Compass, Gift, MessageSquarePlus, Lock, Unlock, Trash2, PlusCircle, Edit3, FolderPlus, AlertTriangle, User, KeyRound, Mail, Camera, ShoppingCart, TrendingUp, BarChart3, Calendar, AlertOctagon, Filter } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [pestanaActiva, setPestanaActiva] = useState("inicio");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // Estados de datos desde Supabase
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [adminCredenciales, setAdminCredenciales] = useState({ email: "admin@perricos.com", nip: "1234", foto: "" });

  useEffect(() => {
    cargarDatosSupabase();
  }, []);

  const cargarDatosSupabase = async () => {
    try {
      const { data: cats } = await supabase.from('categorias').select('*');
      if (cats) setCategorias(cats.map(c => c.nombre));

      const { data: prods } = await supabase.from('productos').select('*');
      if (prods) setProductos(prods);

      const { data: sugs } = await supabase.from('sugerencias').select('*');
      if (sugs) setSugerencias(sugs);

      const { data: vts } = await supabase.from('ventas').select('*').order('fecha', { ascending: false });
      if (vts) setVentas(vts);

      const { data: admin } = await supabase.from('admin_cuenta').select('*').limit(1).single();
      if (admin) setAdminCredenciales(admin);
    } catch (error) {
      console.error("Error al conectar con Supabase:", error);
    }
  };

  // Estados Formulario Sugerencias (Cliente)
  const [nuevoProducto, setNuevoProducto] = useState("");
  const [nuevaCat, setNuevaCat] = useState("Accesorios y Juguetes");
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [enviadoExito, setEnviadoExito] = useState(false);

  // Estados de Sesión de Administrador con persistencia en localStorage
  const [esAdmin, setEsAdmin] = useState(() => {
    return localStorage.getItem('perricos_admin_activo') === 'true';
  });
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [inputNip, setInputNip] = useState("");
  const [errorLogin, setErrorLogin] = useState(false);
  const [subTabAdmin, setSubTabAdmin] = useState("productos");

  // Estados Formulario Productos (Crear / Modificar + Stock + Tipo Venta)
  const [editandoId, setEditandoId] = useState(null);
  const [nombreProd, setNombreProd] = useState("");
  const [catProd, setCatProd] = useState("Perros");
  const [presProd, setPresProd] = useState("");
  const [descProd, setDescProd] = useState("");
  const [beneProd, setBeneProd] = useState("");
  const [precioProd, setPrecioProd] = useState("");
  const [stockProd, setStockProd] = useState("");
  const [tipoVentaProd, setTipoVentaProd] = useState("pieza");

  // Estados Categorías
  const [nuevaCatInput, setNuevaCatInput] = useState("");

  // Estados Configuración Cuenta Admin
  const [nuevoEmailAdmin, setNuevoEmailAdmin] = useState("");
  const [nuevoNipAdmin, setNuevoNipAdmin] = useState("");
  const [mensajeCuenta, setMensajeCuenta] = useState("");

  // Estado para el selector de mes en analíticas y filtro de semana
  const fechaActualObj = new Date();
  const mesActualNombreInicial = `${fechaActualObj.toLocaleString('es-MX', { month: 'long' })} de ${fechaActualObj.getFullYear()}`;
  const mesActualFormateadoInicial = mesActualNombreInicial.charAt(0).toUpperCase() + mesActualNombreInicial.slice(1);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActualFormateadoInicial);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("Todas");

  // Función robusta para elegir icono según el nombre de la categoría
  const getCategoriaIcono = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("perro")) return <Dog size={30} strokeWidth={1.5} />;
    if (c.includes("gato")) return <Cat size={30} strokeWidth={1.5} />;
    if (c.includes("premio") || c.includes("snack")) return <Gift size={30} strokeWidth={1.5} />;
    if (c.includes("pez") || c.includes("acuario") || c.includes("peces")) return <Fish size={30} strokeWidth={1.5} />;
    return <Package size={30} strokeWidth={1.5} />;
  };

  // Enviar Sugerencia (Cliente)
  const agregarSugerencia = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.trim() || !nuevoMotivo.trim()) return;

    const nuevaRec = { id: Math.floor(Math.random() * 2000000000), producto: nuevoProducto, categoria: nuevaCat, motivo: nuevoMotivo };
    const { error } = await supabase.from('sugerencias').insert([nuevaRec]);

    if (!error) {
      setSugerencias([nuevaRec, ...sugerencias]);
      setNuevoProducto("");
      setNuevoMotivo("");
      setEnviadoExito(true);
      setTimeout(() => setEnviadoExito(false), 4000);
    } else {
      alert("Error al enviar sugerencia a la base de datos.");
    }
  };

  // LÓGICA DE VENTA INTELIGENTE (Gramos vs Piezas)
  const registrarVenta = async (p) => {
    let cantidadVenta = 0;
    let totalCobrado = 0;
    let textoCantidad = "";

    if (p.tipo_venta === 'gramos') {
      const inputGramos = prompt(`[Venta a Granel - ${p.nombre}]\n¿Cuántos GRAMOS deseas vender?\nStock actual: ${p.stock} gramos`, "1000");
      if (!inputGramos) return;
      
      cantidadVenta = Number(inputGramos);
      if (isNaN(cantidadVenta) || cantidadVenta <= 0) {
        alert("Ingresa una cantidad de gramos válida.");
        return;
      }
      if (cantidadVenta > Number(p.stock)) {
        alert("No hay suficiente stock en gramos en este costal.");
        return;
      }

      totalCobrado = (cantidadVenta / 1000) * Number(p.precio);
      textoCantidad = `${cantidadVenta} gramos`;
    } else {
      const inputPiezas = prompt(`[Venta por Pieza - ${p.nombre}]\n¿Cuántas PIEZAS/SOBRES deseas vender?\nStock actual: ${p.stock} pz`, "1");
      if (!inputPiezas) return;

      cantidadVenta = Number(inputPiezas);
      if (isNaN(cantidadVenta) || cantidadVenta <= 0) {
        alert("Ingresa un número de piezas válido.");
        return;
      }
      if (cantidadVenta > Number(p.stock)) {
        alert("No hay suficientes piezas en stock.");
        return;
      }

      totalCobrado = cantidadVenta * Number(p.precio);
      textoCantidad = `${cantidadVenta} pz`;
    }

    const nuevoStock = Number(p.stock) - cantidadVenta;

    const { error: errorStock } = await supabase.from('productos').update({ stock: nuevoStock }).eq('id', p.id);
    const { error: errorVenta } = await supabase.from('ventas').insert([{
      producto_id: p.id,
      nombre_producto: `${p.nombre} (${p.presentacion || ''})`,
      cantidad_vendida: cantidadVenta,
      total_cobrado: totalCobrado,
      tipo_venta: p.tipo_venta
    }]);

    if (!errorStock && !errorVenta) {
      alert(`¡Venta registrada con éxito!\nProducto: ${p.nombre}\nCantidad: ${textoCantidad}\nTotal a cobrar: $${totalCobrado.toFixed(2)}`);
      cargarDatosSupabase();
    } else {
      console.error("Error Stock:", errorStock);
      console.error("Error Venta:", errorVenta);
      alert("Error al registrar en la BD: " + (errorVenta?.message || errorStock?.message || "Desconocido"));
    }
  };

  // FUNCIÓN PARA REINICIAR / BORRAR TODAS LAS VENTAS CON AVISO
  const reiniciarTodasLasVentas = async () => {
    const confirmar = window.confirm(
      "⚠️ ¡AVISO IMPORTANTE DE SEGURIDAD!\n\n" +
      "¿Estás completamente seguro de querer ELIMINAR TODO EL HISTORIAL DE VENTAS?\n\n" +
      "Esta acción borrará permanentemente todas las transacciones, vaciará las gráficas y no se podrá deshacer. ¿Deseas continuar?"
    );

    if (confirmar) {
      const dobleConfirmar = window.confirm("🚨 ÚLTIMA ADVERTENCIA:\n\nSe van a borrar todas las ventas registradas. Haz clic en Aceptar para confirmar el borrado total.");
      if (dobleConfirmar) {
        const { error } = await supabase.from('ventas').delete().neq('id', 0);
        if (!error) {
          setVentas([]);
          alert("✅ Se ha borrado todo el historial de ventas exitosamente.");
          cargarDatosSupabase();
        } else {
          alert("Error al borrar las ventas: " + error.message);
        }
      }
    }
  };

  // Iniciar Sesión Admin
  const manejarLogin = (e) => {
    e.preventDefault();
    if (inputEmail.trim().toLowerCase() === adminCredenciales.email.toLowerCase() && inputNip === adminCredenciales.nip) {
      setEsAdmin(true);
      localStorage.setItem('perricos_admin_activo', 'true');
      setErrorLogin(false);
      setInputEmail("");
      setInputNip("");
    } else {
      setErrorLogin(true);
    }
  };

  // Cerrar Sesión Admin
  const cerrarSesionAdmin = () => {
    setEsAdmin(false);
    localStorage.removeItem('perricos_admin_activo');
  };

  // Subir / Cambiar foto de perfil del Admin en Supabase
  const manejarSubirFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Foto = reader.result;
        const actualizada = { ...adminCredenciales, foto: base64Foto };
        
        const { error } = await supabase.from('admin_cuenta').update({ foto: base64Foto }).eq('id', adminCredenciales.id || 1);
        if (!error) {
          setAdminCredenciales(actualizada);
          alert("¡Foto de perfil actualizada en la base de datos!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Actualizar Credenciales Admin en Supabase
  const actualizarCuentaAdmin = async (e) => {
    e.preventDefault();
    const emailActualizado = nuevoEmailAdmin.trim() ? nuevoEmailAdmin.trim() : adminCredenciales.email;
    const nipActualizado = nuevoNipAdmin.trim() ? nuevoNipAdmin.trim() : adminCredenciales.nip;

    const { error } = await supabase.from('admin_cuenta').update({ email: emailActualizado, nip: nipActualizado }).eq('id', adminCredenciales.id || 1);

    if (!error) {
      setAdminCredenciales(prev => ({ ...prev, email: emailActualizado, nip: nipActualizado }));
      setNuevoEmailAdmin("");
      setNuevoNipAdmin("");
      setMensajeCuenta("¡Datos de administrador actualizados con éxito!");
      setTimeout(() => setMensajeCuenta(""), 4000);
    } else {
      alert("Error al actualizar la cuenta.");
    }
  };

  // Guardar o Modificar Producto en Supabase (ID Corregido)
  const guardarProductoAdmin = async (e) => {
    e.preventDefault();
    if (!nombreProd.trim() || precioProd === "" || stockProd === "") {
      alert("Por favor llena los campos obligatorios");
      return;
    }

    const prodData = {
      nombre: nombreProd.trim(),
      categoria: catProd,
      presentacion: presProd.trim(),
      descripcion: descProd.trim(),
      beneficios: beneProd.trim(),
      precio: Number(precioProd),
      stock: Number(stockProd),
      tipo_venta: tipoVentaProd
    };

    if (editandoId) {
      const { error } = await supabase.from('productos').update(prodData).eq('id', editandoId);
      if (error) {
        alert("Error al actualizar: " + error.message);
      } else {
        alert("¡Producto modificado con éxito!");
        limpiarFormularioProd();
        cargarDatosSupabase();
      }
    } else {
      const nuevo = {
        id: Math.floor(Math.random() * 2000000000), // Rango seguro para entero en Supabase
        ...prodData
      };

      const { error } = await supabase.from('productos').insert([nuevo]);
      if (error) {
        alert("Error al agregar producto: " + error.message);
      } else {
        alert("¡Producto agregado al catálogo!");
        limpiarFormularioProd();
        cargarDatosSupabase();
      }
    }
  };

  const limpiarFormularioProd = () => {
    setEditandoId(null);
    setNombreProd("");
    setPresProd("");
    setDescProd("");
    setBeneProd("");
    setPrecioProd("");
    setStockProd("");
    setTipoVentaProd("pieza");
  };

  const iniciarEdicionProd = (p) => {
    setEditandoId(p.id);
    setNombreProd(p.nombre);
    setCatProd(p.categoria);
    setPresProd(p.presentacion || "");
    setDescProd(p.descripcion || "");
    setBeneProd(p.beneficios || "");
    setPrecioProd(p.precio);
    setStockProd(p.stock !== undefined ? p.stock : "");
    setTipoVentaProd(p.tipo_venta || "pieza");
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto permanentemente de la base de datos?")) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (!error) {
        setProductos(productos.filter(p => p.id !== id));
      }
    }
  };

  // Crear Categoría en Supabase
  const crearCategoria = async (e) => {
    e.preventDefault();
    const cat = nuevaCatInput.trim();
    if (!cat) return;
    if (categorias.includes(cat)) {
      alert("Esta categoría ya existe.");
      return;
    }

    const { error } = await supabase.from('categorias').insert([{ nombre: cat }]);
    if (!error) {
      setCategorias([...categorias, cat]);
      setNuevaCatInput("");
      alert(`¡Categoría "${cat}" creada con éxito!`);
    }
  };

  // Eliminar Categoría
  const eliminarCategoria = async (catAEliminar) => {
    if (window.confirm(`¿Deseas eliminar la categoría "${catAEliminar}"? Los productos pasarán a "Varios".`)) {
      await supabase.from('categorias').delete().eq('nombre', catAEliminar);
      await supabase.from('productos').update({ categoria: "Varios" }).eq('categoria', catAEliminar);

      if (!categorias.includes("Varios")) {
        await supabase.from('categorias').insert([{ nombre: "Varios" }]);
        setCategorias([...categorias.filter(c => c !== catAEliminar), "Varios"]);
      } else {
        setCategorias(categorias.filter(c => c !== catAEliminar));
      }

      setProductos(productos.map(p => p.categoria === catAEliminar ? { ...p, categoria: "Varios" } : p));
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = filtroCategoria === "Todos" || p.categoria === filtroCategoria;
    const coincideBusqueda = (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) || 
                             (p.presentacion || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (p.descripcion || "").toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const navegarACategoria = (cat) => {
    setFiltroCategoria(cat);
    setPestanaActiva("catalogo");
  };

  // --- PROCESAMIENTO DE DATOS PARA MESES, SEMANAS Y ANALÍTICAS ---
  
  const obtenerSemanaDelMes = (fechaStr) => {
    const d = new Date(fechaStr);
    const dia = d.getDate();
    return Math.ceil(dia / 7);
  };

  // 1. Agrupar Ventas por Mes
  const ventasPorMesObj = ventas.reduce((acc, v) => {
    const fechaObj = new Date(v.fecha);
    const mesAno = `${fechaObj.toLocaleString('es-MX', { month: 'long' })} de ${fechaObj.getFullYear()}`;
    const mesFormateado = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
    
    if (!acc[mesFormateado]) {
      acc[mesFormateado] = { ingresosTotal: 0, listaVentas: [] };
    }
    acc[mesFormateado].ingresosTotal += Number(v.total_cobrado);
    acc[mesFormateado].listaVentas.push(v);
    return acc;
  }, {});

  const listaMesesDisponibles = Object.keys(ventasPorMesObj);

  // 2. Filtrar ventas para las Analíticas (Se reinicia al cambiar de mes)
  const ventasFiltradasMes = ventas.filter(v => {
    const fechaObj = new Date(v.fecha);
    const mesAno = `${fechaObj.toLocaleString('es-MX', { month: 'long' })} de ${fechaObj.getFullYear()}`;
    const mesFormateado = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
    return mesFormateado === mesSeleccionado;
  });

  const ingresosMesSeleccionado = ventasFiltradasMes.reduce((acc, v) => acc + Number(v.total_cobrado), 0);
  const transaccionesMesSeleccionado = ventasFiltradasMes.length;

  const resumenPorProductoMes = ventasFiltradasMes.reduce((acc, v) => {
    const prodRef = productos.find(p => p.id === v.producto_id);
    const stockActual = prodRef ? Number(prodRef.stock) : 0;

    if (!acc[v.nombre_producto]) {
      acc[v.nombre_producto] = { 
        ingresos: 0, 
        cantidadTotal: 0, 
        tipoVenta: v.tipo_venta || 'pieza',
        stock: stockActual
      };
    }
    acc[v.nombre_producto].ingresos += Number(v.total_cobrado);
    acc[v.nombre_producto].cantidadTotal += Number(v.cantidad_vendida);
    return acc;
  }, {});

  const productosRankingMes = Object.keys(resumenPorProductoMes).map(nombre => {
    const itemData = resumenPorProductoMes[nombre];
    const esGramos = itemData.tipoVenta === 'gramos';
    
    const totalPool = itemData.stock + itemData.cantidadTotal;
    const porcentajeBarra = totalPool > 0 ? (itemData.cantidadTotal / totalPool) * 100 : 0;

    const costalesCompletados = esGramos ? Math.floor(itemData.cantidadTotal / 20000) : null;

    return {
      nombre,
      ingresos: itemData.ingresos,
      cantidad: itemData.cantidadTotal,
      tipoVenta: itemData.tipoVenta,
      costalesCompletados,
      porcentajeBarra: Math.min(Math.max(porcentajeBarra, 0), 100)
    };
  }).sort((a, b) => b.ingresos - a.ingresos);

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#2D2926] font-sans selection:bg-[#E3D9CC] flex flex-col justify-between relative">
      <style>{`
        @keyframes walk {
          0% { transform: translateX(-60px); }
          100% { transform: translateX(105vw); }
        }
        .walking-pet {
          animation: walk 14s linear infinite;
        }
      `}</style>

      {/* Mascota Caminante Inferior */}
      <div className="fixed bottom-3 left-0 text-4xl walking-pet z-40 pointer-events-none opacity-80">
        {filtroCategoria.toLowerCase().includes("gato") ? "🐈" : filtroCategoria.toLowerCase().includes("perro") ? "🐕" : filtroCategoria.toLowerCase().includes("premio") ? "🦴" : filtroCategoria.toLowerCase().includes("pez") ? "🐠" : "🐾"}
      </div>

      <div>
        {/* BARRA SUPERIOR LIMPIA */}
        {/* BARRA SUPERIOR RESPONSIVA */}
        <header className="bg-[#2D1B0E] text-[#FDFBF9] shadow-[0_10px_30px_rgba(45,27,14,0.3)]">
          <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* TÍTULO / LOGO */}
            <h1 
              className="text-2xl md:text-3xl font-normal tracking-[0.15em] uppercase cursor-pointer text-[#FDFBF9]" 
              onClick={() => { setPestanaActiva("inicio"); setFiltroCategoria("Todos"); }} 
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Perricos<span className="text-[#C8A277]">.</span>
            </h1>

            {/* CONTENEDOR DE NAVEGACIÓN Y BOTÓN ADMIN */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="flex gap-4 md:gap-8 text-[11px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold">
                <button 
                  onClick={() => { setPestanaActiva("inicio"); setFiltroCategoria("Todos"); }} 
                  className={`transition hover:text-[#C8A277] ${pestanaActiva === "inicio" ? "text-[#C8A277] underline underline-offset-8" : "text-[#DCD3C7]"}`}
                >
                  Inicio
                </button>
                <button 
                  onClick={() => { setPestanaActiva("catalogo"); setFiltroCategoria("Todos"); }} 
                  className={`transition hover:text-[#C8A277] ${pestanaActiva === "catalogo" ? "text-[#C8A277] underline underline-offset-8" : "text-[#DCD3C7]"}`}
                >
                  Colección
                </button>
                <button 
                  onClick={() => { setPestanaActiva("sugerencias"); }} 
                  className={`transition hover:text-[#C8A277] ${pestanaActiva === "sugerencias" ? "text-[#C8A277] underline underline-offset-8" : "text-[#DCD3C7]"}`}
                >
                  Sugerencias
                </button>
              </div>

              {/* BOTÓN CÍRCULO DE ACCESO ADMIN */}
              <button 
                onClick={() => setMostrarModalAdmin(true)}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#3B2F2F] border-2 border-[#C8A277] overflow-hidden flex items-center justify-center text-[#FDFBF9] hover:scale-105 transition shadow-md relative group focus:outline-none"
                title="Acceso Administrador"
              >
                {esAdmin && adminCredenciales.foto ? (
                  <img src={adminCredenciales.foto} alt="Perfil Admin" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} strokeWidth={1.8} className="text-[#C8A277]" />
                )}
              </button>
            </div>

          </nav>
        </header>

        {/* MODAL / PANEL ADMIN */}
        {mostrarModalAdmin && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#FDFBF9] border border-[#2D1B0E] w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto text-[#2D2926]">
              <button 
                onClick={() => setMostrarModalAdmin(false)}
                className="absolute top-6 right-6 text-[#5C4033] hover:text-black p-2 bg-[#F4EFEA] rounded-full"
              >
                <X size={18} />
              </button>

              {!esAdmin ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 bg-[#2D1B0E] text-[#C8A277] rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>Acceso de Administrador</h3>
                    <p className="text-xs text-[#5C4033] mt-1">Ingresa tus credenciales para administrar el sitio.</p>
                  </div>

                  <form onSubmit={manejarLogin} className="space-y-4 max-w-sm mx-auto pt-2">
                    <input 
                      type="email" 
                      placeholder="Correo de Admin" 
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-[#DCD3C7] px-4 py-3 rounded-2xl text-xs text-center outline-none focus:border-[#2D1B0E]"
                    />
                    <input 
                      type="password" 
                      placeholder="NIP / Contraseña" 
                      value={inputNip}
                      onChange={(e) => setInputNip(e.target.value)}
                      required
                      className="w-full bg-white border border-[#DCD3C7] px-4 py-3 rounded-2xl text-xs text-center outline-none focus:border-[#2D1B0E]"
                    />
                    {errorLogin && <p className="text-red-600 text-xs font-bold">Correo o NIP incorrectos</p>}
                    <button type="submit" className="w-full bg-[#2D1B0E] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#4E3629] shadow-md">
                      Entrar al Panel
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8 py-2">
                  <div className="flex justify-between items-center border-b border-[#DCD3C7] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2D1B0E] bg-white flex items-center justify-center">
                        {adminCredenciales.foto ? (
                          <img src={adminCredenciales.foto} alt="Admin" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-[#5C4033]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>Panel de Administrador</h3>
                        <span className="text-[10px] text-[#5C4033]">{adminCredenciales.email}</span>
                      </div>
                    </div>
                    <button onClick={cerrarSesionAdmin} className="text-xs uppercase font-bold text-red-700 border border-red-300 px-3 py-1.5 rounded-full hover:bg-red-50">
                      Cerrar Sesión
                    </button>
                  </div>

                  {/* Sub-pestañas Modal Admin */}
                  <div className="flex flex-wrap gap-2 border-b border-[#DCD3C7] pb-4">
                    <button 
                      onClick={() => setSubTabAdmin("productos")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "productos" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📦 Productos
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("categorias")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "categorias" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📁 Categorías
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("ventas")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "ventas" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📊 Ventas ({ventas.length})
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("meses")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "meses" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📅 Ventas por Mes
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("analiticas")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "analiticas" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📈 Costo/Beneficio
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("sugerencias")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "sugerencias" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      📬 Buzón ({sugerencias.length})
                    </button>
                    <button 
                      onClick={() => setSubTabAdmin("cuenta")}
                      className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold transition ${subTabAdmin === "cuenta" ? "bg-[#2D1B0E] text-white" : "bg-[#F4EFEA] text-[#5C4033]"}`}
                    >
                      🔑 Cuenta
                    </button>
                  </div>

                  {/* 1. PRODUCTOS */}
                  {subTabAdmin === "productos" && (
                    <div className="space-y-6">
                      <form onSubmit={guardarProductoAdmin} className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#DCD3C7] space-y-4">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D1B0E] flex items-center gap-1.5">
                          <PlusCircle size={16} /> {editandoId ? `Editando Producto ID: ${editandoId}` : "Agregar Producto"}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input type="text" placeholder="Nombre *" value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} required className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none" />
                          <select value={catProd} onChange={(e) => setCatProd(e.target.value)} className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none">
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="text" placeholder="Presentación (ej. Costal 10kg / Sobre)" value={presProd} onChange={(e) => setPresProd(e.target.value)} className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none" />
                          <input type="text" placeholder="Descripción" value={descProd} onChange={(e) => setDescProd(e.target.value)} className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none" />
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-[#5C4033] font-bold">Tipo de Venta:</label>
                            <select value={tipoVentaProd} onChange={(e) => setTipoVentaProd(e.target.value)} className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none">
                              <option value="pieza">Por Pieza / Sobres / Entero</option>
                              <option value="gramos">Por Gramos (Granel / Costal)</option>
                            </select>
                          </div>

                          <input type="number" placeholder="Stock inicial (ej. 10000g o 10pz) *" value={stockProd} onChange={(e) => setStockProd(e.target.value)} required className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none" />
                          <input type="number" placeholder="Precio ($ por kg o por pz) *" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} required className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none" />
                          <input type="text" placeholder="Beneficios" value={beneProd} onChange={(e) => setBeneProd(e.target.value)} className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs outline-none md:col-span-2" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          {editandoId && <button type="button" onClick={limpiarFormularioProd} className="text-xs text-red-600 underline font-bold">Cancelar</button>}
                          <button type="submit" className="bg-[#2D1B0E] text-white text-xs uppercase font-bold px-6 py-2.5 rounded-xl ml-auto">
                            {editandoId ? "Guardar Cambios" : "Añadir Producto"}
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        <h5 className="text-xs font-bold uppercase text-[#5C4033]">Listado de Productos:</h5>
                        {productos.map(p => (
                          <div key={p.id} className="p-3 bg-white border border-[#DCD3C7] rounded-xl flex justify-between items-center text-xs">
                            <div><span className="font-bold">{p.nombre}</span> <span className="text-[#8C7A6B]">(${p.precio} | Stock: {p.stock} {p.tipo_venta === 'gramos' ? 'g' : 'pz'})</span></div>
                            <div className="flex gap-2">
                              <button onClick={() => iniciarEdicionProd(p)} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold">Editar</button>
                              <button onClick={() => eliminarProducto(p.id)} className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-bold">Borrar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. CATEGORÍAS */}
                  {subTabAdmin === "categorias" && (
                    <div className="space-y-6">
                      <form onSubmit={crearCategoria} className="flex gap-3">
                        <input type="text" placeholder="Nueva categoría" value={nuevaCatInput} onChange={(e) => setNuevaCatInput(e.target.value)} className="bg-[#FAF8F5] border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs flex-grow outline-none" required />
                        <button type="submit" className="bg-[#2D1B0E] text-white text-xs uppercase font-bold px-5 py-2 rounded-xl">Crear</button>
                      </form>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {categorias.map(cat => (
                          <div key={cat} className="p-3 bg-white border border-[#DCD3C7] rounded-xl flex justify-between items-center text-xs">
                            <span className="font-bold">{cat}</span>
                            {categorias.length > 1 && (
                              <button onClick={() => eliminarCategoria(cat)} className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-bold">Eliminar</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. VENTAS (Historial General + Botón de Reinicio con Advertencia) */}
                  {subTabAdmin === "ventas" && (
                    <div className="space-y-4 max-h-70 overflow-y-auto pr-1">
                      <div className="flex justify-between items-center bg-[#FAF8F5] p-4 rounded-2xl border border-[#DCD3C7]">
                        <div>
                          <h5 className="text-xs font-bold uppercase text-[#3B2F2F]">Gestión de Historial</h5>
                          <p className="text-[10px] text-[#8C7A6B]">Total de transacciones: {ventas.length}</p>
                        </div>
                        <button 
                          onClick={reiniciarTodasLasVentas}
                          className="bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold uppercase px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <AlertOctagon size={15} /> Reiniciar / Borrar Ventas
                        </button>
                      </div>

                      <div className="space-y-2 max-h-50 overflow-y-auto">
                        {ventas.length > 0 ? (
                          ventas.map(v => (
                            <div key={v.id} className="p-3 bg-white border border-[#DCD3C7] rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold">{v.nombre_producto}</span> 
                                <p className="text-[#5C4033]">Cantidad: {v.cantidad_vendida} {v.tipo_venta === 'gramos' ? 'g' : 'pz'} | Total: ${v.total_cobrado.toFixed(2)}</p>
                              </div>
                              <span className="text-[10px] text-[#8C7A6B]">{new Date(v.fecha).toLocaleString()}</span>
                            </div>
                          ))
                        ) : <p className="text-xs text-[#8C7A6B] text-center py-4">No hay ventas registradas aún.</p>}
                      </div>
                    </div>
                  )}

                  {/* 4. VENTAS POR MES (CON FILTRO DE SEMANA) */}
                  {subTabAdmin === "meses" && (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-[#FAF8F5] p-3 rounded-2xl border border-[#DCD3C7]">
                        <h5 className="text-xs font-bold uppercase text-[#5C4033] flex items-center gap-1.5">
                          <Calendar size={14} /> Ventas por Mes y Semana
                        </h5>
                        <div className="flex items-center gap-2">
                          <Filter size={14} className="text-[#5C4033]" />
                          <select 
                            value={semanaSeleccionada} 
                            onChange={(e) => setSemanaSeleccionada(e.target.value)}
                            className="bg-white border border-[#DCD3C7] px-3 py-1.5 rounded-xl text-xs font-bold text-[#2D1B0E] outline-none"
                          >
                            <option value="Todas">Todas las semanas</option>
                            <option value="1">Semana 1 (Días 1-7)</option>
                            <option value="2">Semana 2 (Días 8-14)</option>
                            <option value="3">Semana 3 (Días 15-21)</option>
                            <option value="4">Semana 4 (Días 22-28)</option>
                            <option value="5">Semana 5 (Días 29-31)</option>
                          </select>
                        </div>
                      </div>

                      {listaMesesDisponibles.length > 0 ? (
                        listaMesesDisponibles.map((mesKey, idx) => {
                          const datosMes = ventasPorMesObj[mesKey];
                          const ventasFiltradasSemana = datosMes.listaVentas.filter(v => {
                            if (semanaSeleccionada === "Todas") return true;
                            return obtenerSemanaDelMes(v.fecha).toString() === semanaSeleccionada;
                          });

                          const totalSemana = ventasFiltradasSemana.reduce((acc, v) => acc + Number(v.total_cobrado), 0);

                          if (ventasFiltradasSemana.length === 0 && semanaSeleccionada !== "Todas") return null;

                          return (
                            <div key={idx} className="bg-white border border-[#DCD3C7] rounded-2xl p-4 space-y-3 shadow-sm">
                              <div className="flex justify-between items-center border-b border-[#FAF8F5] pb-2">
                                <span className="font-bold text-sm text-[#2D1B0E]">{mesKey} {semanaSeleccionada !== "Todas" ? `(Semana ${semanaSeleccionada})` : ''}</span>
                                <span className="text-sm font-bold text-[#2C5E3B]">Total: ${totalSemana.toFixed(2)}</span>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {ventasFiltradasSemana.map((v, i) => (
                                  <div key={i} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DCD3C7] flex justify-between items-center text-xs">
                                    <div>
                                      <span className="font-bold text-[#3B2F2F]">{v.nombre_producto}</span>
                                      <p className="text-[10px] text-[#8C7A6B]">Cant: {v.cantidad_vendida} {v.tipo_venta === 'gramos' ? 'g' : 'pz'} — {new Date(v.fecha).toLocaleDateString()} (Semana {obtenerSemanaDelMes(v.fecha)})</p>
                                    </div>
                                    <span className="font-bold text-[#2D1B0E]">${v.total_cobrado.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[#8C7A6B] text-center py-6">Aún no hay registros para mostrar por mes.</p>
                      )}
                    </div>
                  )}

                  {/* 5. ANALÍTICAS Y COSTO / BENEFICIO */}
                  {subTabAdmin === "analiticas" && (
                    <div className="space-y-6 max-h-80 overflow-y-auto pr-1">
                      
                      {/* Selector de Mes */}
                      <div className="flex flex-col gap-1 bg-[#FAF8F5] p-3 rounded-2xl border border-[#DCD3C7]">
                        <label className="text-[10px] uppercase font-bold text-[#5C4033]">Selecciona el Periodo (Mes):</label>
                        <select 
                          value={mesSeleccionado} 
                          onChange={(e) => setMesSeleccionado(e.target.value)}
                          className="bg-white border border-[#DCD3C7] px-3 py-2 rounded-xl text-xs font-bold text-[#2D1B0E] outline-none"
                        >
                          {listaMesesDisponibles.length > 0 ? (
                            listaMesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)
                          ) : (
                            <option value={mesActualFormateadoInicial}>{mesActualFormateadoInicial}</option>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#DCD3C7] text-center">
                          <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">Ingresos del Periodo</span>
                          <h4 className="text-2xl font-bold text-[#2D1B0E] mt-1">${ingresosMesSeleccionado.toFixed(2)}</h4>
                        </div>
                        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#DCD3C7] text-center">
                          <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">Ventas en el Periodo</span>
                          <h4 className="text-2xl font-bold text-[#2D1B0E] mt-1">{transaccionesMesSeleccionado}</h4>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <h5 className="text-xs font-bold uppercase text-[#5C4033] flex items-center gap-1">
                          <BarChart3 size={14} /> Rendimiento de este Mes y Stock Actual
                        </h5>
                        {productosRankingMes.length > 0 ? (
                          productosRankingMes.map((item, idx) => {
                            return (
                              <div key={idx} className="bg-white p-4 rounded-2xl border border-[#DCD3C7] space-y-2 text-xs shadow-sm">
                                <div className="flex justify-between font-bold">
                                  <span className="text-sm text-[#2D1B0E]">{item.nombre}</span>
                                  <span className="text-[#2D1B0E] text-sm">${item.ingresos.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-[#F4EFEA] h-2.5 rounded-full overflow-hidden">
                                  <div className="bg-[#C8A277] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(item.porcentajeBarra, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-[#8C7A6B] pt-1 border-t border-[#FAF8F5]">
                                  <span>Vendido en el mes: {item.cantidad} {item.tipoVenta === 'gramos' ? 'g' : 'pz'}</span>
                                  {item.costalesCompletados !== null && item.costalesCompletados > 0 && (
                                    <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                                      📦 Costales terminados: {item.costalesCompletados}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-[#8C7A6B] text-center py-6">No hay registros de ventas para el mes seleccionado.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 6. BUZÓN SUGERENCIAS */}
                  {subTabAdmin === "sugerencias" && (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {sugerencias.length > 0 ? (
                        sugerencias.map(item => (
                          <div key={item.id} className="p-3 bg-white border border-[#DCD3C7] rounded-xl flex justify-between items-center text-xs">
                            <div><span className="font-bold">{item.producto}</span> <p className="text-[#5C4033] italic">"{item.motivo}"</p></div>
                            <button onClick={async () => {
                              await supabase.from('sugerencias').delete().eq('id', item.id);
                              setSugerencias(sugerencias.filter(s => s.id !== item.id));
                            }} className="text-red-600 font-bold">Borrar</button>
                          </div>
                        ))
                      ) : <p className="text-xs text-[#8C7A6B] text-center py-4">No hay sugerencias guardadas.</p>}
                    </div>
                  )}

                  {/* 7. CONFIGURAR CUENTA */}
                  {subTabAdmin === "cuenta" && (
                    <div className="space-y-6 max-w-md mx-auto bg-[#FAF8F5] p-6 rounded-2xl border border-[#DCD3C7]">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D1B0E] flex items-center gap-1.5">
                        <User size={16} /> Mi Cuenta y Perfil de Administrador
                      </h4>

                      {mensajeCuenta && <div className="bg-[#EBF5EE] text-[#2C5E3B] p-2.5 rounded-xl text-xs text-center font-medium">{mensajeCuenta}</div>}

                      <div className="space-y-3 text-center">
                        <label className="text-[10px] uppercase font-bold text-[#5C4033] block">Fotografía del Círculo Superior</label>
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#2D1B0E] bg-white flex items-center justify-center shadow-md">
                            {adminCredenciales.foto ? (
                              <img src={adminCredenciales.foto} alt="Foto Admin" className="w-full h-full object-cover" />
                            ) : (
                              <User size={36} className="text-[#5C4033]" />
                            )}
                          </div>
                          <label className="bg-[#2D1B0E] text-white text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#4E3629] font-bold shadow-sm">
                            <Camera size={14} className="inline mr-1.5" /> Subir o Cambiar Foto
                            <input type="file" accept="image/*" onChange={manejarSubirFoto} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <form onSubmit={actualizarCuentaAdmin} className="space-y-3 pt-2 border-t border-[#DCD3C7]">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5C4033]">Correo Actual: <span className="text-[#2D1B0E] font-normal">{adminCredenciales.email}</span></label>
                          <input type="email" placeholder="Escribe un nuevo correo" value={nuevoEmailAdmin} onChange={(e) => setNuevoEmailAdmin(e.target.value)} className="w-full bg-white border border-[#DCD3C7] px-3 py-2.5 rounded-xl text-xs outline-none mt-1" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#5C4033]">Nuevo NIP (Contraseña)</label>
                          <input type="password" placeholder="Escribe tu nuevo NIP" value={nuevoNipAdmin} onChange={(e) => setNuevoNipAdmin(e.target.value)} className="w-full bg-white border border-[#DCD3C7] px-3 py-2.5 rounded-xl text-xs outline-none mt-1" />
                        </div>
                        <div className="text-right pt-2">
                          <button type="submit" className="w-full bg-[#2D1B0E] text-white text-xs uppercase font-bold py-3 rounded-xl shadow-md hover:bg-[#4E3629]">
                            Guardar Cambios de Cuenta
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-8 py-12">
          {pestanaActiva === "inicio" ? (
            <div className="space-y-24">
              {/* HERO SECTION CON EL LOGO A LO GRANDE */}
              <div className="grid md:grid-cols-2 gap-16 items-center min-h-[60vh]">
                <div className="space-y-8">
                  <span className="text-[#5C4033] text-xs uppercase tracking-[0.2em] font-bold">Un bocado de amor para cada compañero.</span>
                  <h2 className="text-5xl md:text-6xl font-light leading-tight text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Panzas llenas, patitas contentas.
                  </h2>
                  <p className="text-[#5C4033] leading-relaxed max-w-md font-normal text-base">
                    Un espacio dedicado a la calidad de vida de tus mascotas. Selección premium de nutrición, premios y accesorios con un compromiso genuino.
                  </p>
                  <div>
                    <button 
                      onClick={() => setPestanaActiva("catalogo")} 
                      className="bg-[#2D1B0E] text-[#FDFBF9] px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#4E3629] transition-all shadow-[0_12px_30px_rgba(45,27,14,0.3)]"
                    >
                      Explorar Catálogo General
                    </button>
                  </div>
                </div>
                
                {/* LOGO GRANDE EN EL CENTRO DE BIENVENIDA */}
                <div className="flex justify-center items-center">
                  <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-[#DCD3C7] shadow-[0_20px_50px_rgba(45,27,14,0.15)] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
                    <img 
                      src="/logo.png" 
                      alt="Perricos Logo Grande" 
                      className="w-full h-auto object-contain max-h-[380px] rounded-2xl" 
                    />
                  </div>
                </div>
              </div>

              {/* GRID DE CATEGORÍAS DINÁMICO */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categorias.map((cat) => (
                  <div 
                    key={cat} 
                    onClick={() => navegarACategoria(cat)} 
                    className="h-44 bg-[#F4EFEA] border border-[#DCD3C7] rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#EBE2D8] hover:border-[#2D1B0E] transition-all p-6 text-center group shadow-[0_10px_25px_rgba(45,27,14,0.1)]"
                  >
                    <div className="text-[#2D1B0E] group-hover:scale-110 transition-transform mb-3">
                      {getCategoriaIcono(cat)}
                    </div>
                    <span className="text-xs uppercase tracking-[0.15em] font-bold mb-1 text-[#3B2F2F]">{cat}</span>
                    <span className="text-xs text-[#5C4033] font-medium">Ver sección</span>
                  </div>
                ))}
              </div>

              <section className="grid md:grid-cols-3 gap-8 pt-10 border-t border-[#DCD3C7]">
                <div className="bg-white border border-[#DCD3C7] p-8 rounded-3xl shadow-[0_14px_35px_rgba(45,27,14,0.12)] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] flex items-center justify-center text-[#2D1B0E]">
                    <Heart size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-normal text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra Inspiración</h3>
                  <p className="text-sm text-[#5C4033] font-normal leading-relaxed">
                   Creemos que el mejor homenaje a quienes amamos es darles lo mejor. Este espacio está dedicado a ellos: al fiel amigo manchadito, al imparable güerito inquieto y a esa pequeña empalagosa que nos llenan el corazón.
                  </p>
                </div>

                <div className="bg-white border border-[#DCD3C7] p-8 rounded-3xl shadow-[0_14px_35px_rgba(45,27,14,0.12)] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] flex items-center justify-center text-[#2D1B0E]">
                    <ShieldCheck size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-normal text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra Misión</h3>
                  <p className="text-sm text-[#5C4033] font-normal leading-relaxed">
                    Proveer nutrición de alta calidad y productos accesibles que garanticen la vitalidad y el desarrollo óptimo de tus mascotas.
                  </p>
                </div>

                <div className="bg-white border border-[#DCD3C7] p-8 rounded-3xl shadow-[0_14px_35px_rgba(45,27,14,0.12)] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] flex items-center justify-center text-[#2D1B0E]">
                    <Compass size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-normal text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra Visión</h3>
                  <p className="text-sm text-[#5C4033] font-normal leading-relaxed">
                    Consolidarnos como el establecimiento preferido de la comunidad por nuestra excelencia en servicio y precios justos.
                  </p>
                </div>
              </section>
            </div>
          ) : pestanaActiva === "catalogo" ? (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#DCD3C7] pb-8 gap-6">
                <div>
                  <span className="text-[#5C4033] text-xs uppercase tracking-widest font-bold">Inventario Disponible</span>
                  <h2 className="text-4xl md:text-5xl font-light mt-1 text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {filtroCategoria === "Todos" ? "Colección Completa" : `Sección: ${filtroCategoria}`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-white border border-[#DCD3C7] px-4 py-3 rounded-full shadow-[0_6px_20px_rgba(45,27,14,0.08)] w-full md:w-72">
                    <Search size={16} className="text-[#2D1B0E]" />
                    <input 
                      type="text" 
                      placeholder="Buscar producto..." 
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="bg-transparent outline-none text-sm w-full text-[#3B2F2F] placeholder-[#8C7A6B]" 
                    />
                  </div>

                  {filtroCategoria !== "Todos" && (
                    <button 
                      onClick={() => setFiltroCategoria("Todos")} 
                      className="flex items-center gap-1.5 text-xs uppercase tracking-widest border border-[#2D1B0E] px-5 py-3 rounded-full font-bold text-[#2D1B0E] hover:bg-[#2D1B0E] hover:text-white transition"
                    >
                      <X size={14} /> Ver Todo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFiltroCategoria("Todos")}
                  className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${
                    filtroCategoria === "Todos" 
                      ? 'bg-[#2D1B0E] text-white border-[#2D1B0E] shadow-[0_8px_25px_rgba(45,27,14,0.35)]' 
                      : 'bg-white text-[#5C4033] border-[#DCD3C7] hover:bg-[#F4EFEA]'
                  }`}
                >
                  Todos
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${
                      filtroCategoria === cat 
                        ? 'bg-[#2D1B0E] text-white border-[#2D1B0E] shadow-[0_8px_25px_rgba(45,27,14,0.35)]' 
                        : 'bg-white text-[#5C4033] border-[#DCD3C7] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* LISTADO DE PRODUCTOS CON STOCK Y TIPO DE VENTA */}
              <div className="grid md:grid-cols-3 gap-8">
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((p) => (
                    <div key={p.id} className="p-8 border border-[#DCD3C7] rounded-3xl bg-white shadow-[0_14px_35px_rgba(45,27,14,0.12)] hover:shadow-[0_24px_50px_rgba(45,27,14,0.22)] transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs uppercase tracking-widest text-[#2D1B0E] bg-[#F4EFEA] px-3.5 py-1.5 rounded-full font-bold">
                            {p.categoria}
                          </span>
                          {esAdmin && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setPestanaActiva("sugerencias"); setMostrarModalAdmin(true); setSubTabAdmin("productos"); iniciarEdicionProd(p); }}
                                className="text-amber-700 hover:text-amber-900 p-1.5 bg-amber-50 rounded-lg transition"
                                title="Modificar completo"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => eliminarProducto(p.id)}
                                className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-lg transition"
                                title="Eliminar producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* INDICADOR DE STOCK EN TARJETA */}
                        <div className="mb-3">
                          {p.stock > 0 ? (
                            <span className="text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                              STOCK: {p.stock} {p.tipo_venta === 'gramos' ? 'g' : 'pz'}
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold">
                              AGOTADO
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold mb-1.5 text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>{p.nombre}</h3>
                        {p.presentacion && <p className="text-sm font-semibold text-[#5C4033] mb-1">{p.presentacion}</p>}
                        {p.descripcion && <p className="text-xs text-[#8C7A6B] mb-3">{p.descripcion}</p>}
                        {p.beneficios && (
                          <p className="text-sm text-[#2D1B0E] font-normal italic mb-6 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#DCD3C7]">
                            "{p.beneficios}"
                          </p>
                        )}
                      </div>

                      <div>
                        {/* BOTÓN DE VENTA INTELIGENTE (SOLO ADMIN) */}
                        {esAdmin && p.stock > 0 && (
                          <button 
                            onClick={() => registrarVenta(p)}
                            className="w-full mb-4 bg-[#2D1B0E] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4E3629] transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <ShoppingCart size={15} /> Registrar Venta ({p.tipo_venta === 'gramos' ? 'Granel / g' : 'Pieza'})
                          </button>
                        )}

                        <div className="flex justify-between items-center border-t border-[#F4EFEA] pt-4">
                          <span className="text-xs uppercase tracking-widest font-bold text-[#8C7A6B]">Precio {p.tipo_venta === 'gramos' ? '(x Kg)' : ''}</span>
                          <span className="font-bold text-xl text-[#2D1B0E]">${p.precio}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-20 text-center text-[#8C7A6B]">
                    <p className="text-lg font-light">No hay productos en esta sección.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= APARTADO SUGERENCIAS CLIENTE ================= */
            <div className="space-y-12 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <span className="text-[#5C4033] text-xs uppercase tracking-[0.2em] font-bold">Buzón Comunitario</span>
                <h2 className="text-4xl md:text-5xl font-light text-[#3B2F2F]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ¿Qué te gustaría que trajéramos a la tienda?
                </h2>
                <p className="text-[#5C4033] text-sm max-w-xl mx-auto font-normal">
                  Escribe tu sugerencia de accesorios, alimentos o productos para cualquier animal.
                </p>
              </div>

              <form onSubmit={agregarSugerencia} className="bg-white border border-[#DCD3C7] p-8 md:p-10 rounded-3xl shadow-[0_14px_35px_rgba(45,27,14,0.1)] space-y-6">
                {enviadoExito && (
                  <div className="bg-[#EBF5EE] border border-[#A3D9A5] text-[#2C5E3B] px-4 py-3 rounded-2xl text-sm text-center font-medium">
                    ✨ ¡Sugerencia enviada con éxito!
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#3B2F2F]">Nombre del Producto</label>
                    <input 
                      type="text" placeholder="Ej. Correa, Camita..." value={nuevoProducto} onChange={(e) => setNuevoProducto(e.target.value)} required
                      className="w-full bg-[#FAF8F5] border border-[#DCD3C7] px-4 py-3 rounded-2xl text-sm text-[#3B2F2F] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#3B2F2F]">Categoría</label>
                    <select 
                      value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DCD3C7] px-4 py-3 rounded-2xl text-sm text-[#3B2F2F] outline-none"
                    >
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Accesorios">Accesorios</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-[#3B2F2F]">Motivo / Comentario</label>
                  <textarea 
                    rows="3" placeholder="¿Por qué lo sugieres?" value={nuevoMotivo} onChange={(e) => setNuevoMotivo(e.target.value)} required
                    className="w-full bg-[#FAF8F5] border border-[#DCD3C7] px-4 py-3 rounded-2xl text-sm text-[#3B2F2F] outline-none resize-none"
                  ></textarea>
                </div>

                <div className="text-center pt-2">
                  <button type="submit" className="bg-[#2D1B0E] text-[#FDFBF9] px-10 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-[#4E3629] transition">
                    Enviar Sugerencia
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* PIE DE PÁGINA */}
      <footer className="bg-[#2D1B0E] text-[#DCD3C7] w-full px-8 py-10 border-t border-[#4E3629] text-center text-xs font-medium mt-20 shadow-[0_-10px_30px_rgba(45,27,14,0.3)]">
        <p className="text-[#FDFBF9]">🐾 Perricos — Todo para tus compañeros fieles.</p>
        <p className="text-[#A48F7C] mt-1">Diseñado para la administración y consulta local.</p>
      </footer>
    </div>
  );
}