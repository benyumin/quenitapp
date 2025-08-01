import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import {
  FiPhone, FiClock, FiFileText, FiChevronRight, FiChevronLeft, FiCheckCircle, FiXCircle, FiInfo, FiUser,
  FiSearch, FiFilter, FiActivity, FiRefreshCw, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle,
  FiCoffee, FiShoppingCart, FiUserPlus, FiSun, FiMoon
} from 'react-icons/fi';
import '../App.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';

const ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#FFF9DB', border: '#FFE066', text: '#B59B00', icon: <FiInfo /> },
  { key: 'EN_PREPARACION', label: 'En preparación', color: '#E0F7FA', border: '#4DD0E1', text: '#007C91', icon: <FiClock /> },
  { key: 'LISTO', label: 'Listo', color: '#F3E8FF', border: '#C084FC', text: '#7C3AED', icon: <FiChevronRight /> },
  { key: 'EN_ENTREGA', label: 'En entrega', color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiPhone /> },
  { key: 'ENTREGADO', label: 'Entregado', color: '#E6F9ED', border: '#34D399', text: '#166534', icon: <FiCheckCircle /> },
  { key: 'CANCELADO', label: 'Cancelado', color: '#FFE5E5', border: '#F87171', text: '#B91C1C', icon: <FiXCircle /> },
];

const TRANSICIONES = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['LISTO', 'CANCELADO'],
  LISTO: ['EN_ENTREGA', 'ENTREGADO', 'CANCELADO'],
  EN_ENTREGA: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: []
};

// Función para determinar si es pedido a domicilio
const esPedidoDomicilio = (pedido) => {
  return pedido.direccion && pedido.direccion.trim() !== '' && 
         pedido.direccion.toLowerCase() !== 'retiro en local' &&
         pedido.direccion.toLowerCase() !== 'retiro' &&
         pedido.direccion.toLowerCase() !== 'local';
};

// Función para obtener el siguiente estado lógico
const getSiguienteEstado = (pedido, estadoActual) => {
  const esDomicilio = esPedidoDomicilio(pedido);
  
  switch (estadoActual) {
    case 'PENDIENTE':
      return 'EN_PREPARACION';
    case 'EN_PREPARACION':
      return 'LISTO';
    case 'LISTO':
      // Si es domicilio, necesita entrega. Si es retiro, el cliente viene a buscarlo
      return esDomicilio ? 'EN_ENTREGA' : 'ENTREGADO';
    case 'EN_ENTREGA':
      return 'ENTREGADO';
    default:
      return null;
  }
};

// Utilidad para obtener info de estado
const getEstadoInfo = (key) => ESTADOS.find(e => e.key === key) || ESTADOS[0];

// Función para cargar imagen como base64
function loadImageAsBase64(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;
      
      // Configurar el contexto para mejor calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar imagen con mejor calidad
      ctx.drawImage(img, 0, 0, 50, 50);
      
      // Usar JPEG con alta calidad para mejor compatibilidad
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      resolve(base64);
    };
    
    img.onerror = (error) => {
      console.error('Error cargando imagen:', error);
      reject(error);
    };
    
    // Intentar cargar la imagen
    img.src = imageSrc;
  });
}

// Generar boleta PDF
async function generarBoletaPDF(pedido) {
  const doc = new jsPDF();
  let y = 20;
  
  // Header con logo y título
  doc.setFillColor(37, 99, 235); // Azul de Quenita's
  doc.rect(0, 0, 210, 40, 'F'); // Aumentamos altura para el logo
  
  // Agregar logo en el header (esquina superior izquierda)
  try {
    const logoBase64 = await loadImageAsBase64(logoQuenitas);
    doc.addImage(logoBase64, 'JPEG', 15, 8, 25, 25);
  } catch (error) {
    console.log('No se pudo cargar el logo:', error);
    // Fallback: agregar un texto en lugar del logo
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Q', 20, 20);
  }
  
  // Título principal (ajustado para el logo)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Completos Quenita\'s', 105, 20, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(12);
  doc.text('El sabor chileno sobre ruedas', 105, 30, { align: 'center' });
  
  // Resetear color para el contenido
  doc.setTextColor(0, 0, 0);
  y = 55; // Ajustado para el header más alto
  
  // Información del pedido
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Boleta de Pedido', 105, y, { align: 'center' });
  y += 15;
  
  // Línea separadora
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;
  
  // Detalles del pedido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Fecha y hora
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha y Hora:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(pedido.created_at).toLocaleString('es-CL'), 60, y);
  y += 8;
  
  // Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(pedido.nombre || 'N/A', 60, y);
  y += 8;
  
  // Producto
  doc.setFont('helvetica', 'bold');
  doc.text('Producto:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(pedido.producto || 'N/A', 60, y);
  y += 8;
  
  // Tipo de entrega
  const esDomicilio = pedido.direccion && pedido.direccion.trim() !== '' && 
                     pedido.direccion.toLowerCase() !== 'retiro en local' &&
                     pedido.direccion.toLowerCase() !== 'retiro' &&
                     pedido.direccion.toLowerCase() !== 'local';
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo de entrega:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(esDomicilio ? 'Domicilio' : 'Retiro en local', 60, y);
  y += 8;
  
  // Dirección (si aplica)
  if (esDomicilio) {
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(pedido.direccion || 'N/A', 60, y);
    y += 8;
  }
  
  // Bebida
  if (pedido.bebida) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bebida:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${pedido.bebida} ${pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}`, 60, y);
    y += 8;
  }
  
  // Línea separadora
  y += 5;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;
  
  // Ingredientes
  doc.setFont('helvetica', 'bold');
  doc.text('Ingredientes:', 15, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  
  try {
    const pers = pedido.personalizacion ? JSON.parse(pedido.personalizacion) : {};
    const selected = Object.entries(pers).filter(([,v]) => v).map(([k]) => k);
    if (selected.length > 0) {
      selected.forEach(ing => { 
        doc.text(`• ${ing}`, 22, y); 
        y += 6; 
      });
    } else {
      doc.text('• Sin personalización', 22, y); 
      y += 6;
    }
  } catch {
    doc.text(`• ${pedido.personalizacion || 'Sin personalización'}`, 22, y); 
    y += 6;
  }
  
  // Observaciones
  if (pedido.resumen) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', 15, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(pedido.resumen, 22, y);
    y += 10;
  }
  
  // Línea separadora final
  y += 5;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;
  
  // Estado y total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 15, y);
  y += 8;
  
  // Total destacado
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text(`Total: $${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP`, 15, y);
  
  // Footer
  y += 20;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('¡Gracias por elegir Completos Quenita\'s!', 105, y, { align: 'center' });
  y += 5;
  doc.text('El sabor chileno sobre ruedas', 105, y, { align: 'center' });
  
  // Guardar con nombre personalizado
  const nombreCliente = (pedido.nombre || 'desconocido').replace(/[^a-zA-Z0-9]/g, '_');
  const idPedido = pedido.id ? String(pedido.id).substring(0,8).toUpperCase() : 'N_A';
  const timestamp = new Date().toISOString().slice(0,10);
  
  doc.save(`Boleta_Quenitas_${nombreCliente}_${idPedido}_${timestamp}.pdf`);
}

// Formato de hora relativa
function formatElapsedTime(createdAt) {
  const timeElapsed = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (timeElapsed < 1) return 'recién';
  if (timeElapsed < 60) return `hace ${timeElapsed} min`;
  if (timeElapsed < 1440) {
    const hours = Math.floor(timeElapsed / 60);
    return `hace ${hours} hr${hours === 1 ? '' : 's'}`;
  }
  const days = Math.floor(timeElapsed / 1440);
  return `hace ${days} día${days === 1 ? '' : 's'}`;
}

const AdminPanel = ({ onLogout, onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [showStats, setShowStats] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });

  // Función para cambiar el modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('quenitas-dark', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error al cargar pedidos:', error);
      } else {
        console.log('✅ Pedidos cargados:', data?.length || 0, 'pedidos');
      setPedidos(data || []);
      }
    } catch (error) {
      console.error('❌ Error en fetchPedidos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
    
    // Auto-refresh cada 10 segundos
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, []);



  // Cambiar estado con confirmación
  const cambiarEstado = async (pedido, nuevoEstado) => {
    setPendingAction({ pedido, nuevoEstado });
    setShowConfirmModal(true);
  };

  const confirmarCambioEstado = async () => {
    if (!pendingAction) return;
    
    const { pedido, nuevoEstado } = pendingAction;
    const actual = pedido.estado || 'PENDIENTE';
    
    if (!TRANSICIONES[actual]?.includes(nuevoEstado)) {
      setShowConfirmModal(false);
      setPendingAction(null);
      return;
    }

    try {
      await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedido.id);
      setPedidos(pedidos => pedidos.map(p => p.id === pedido.id ? { ...p, estado: nuevoEstado } : p));
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchesSearch = !searchTerm || 
      pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterEstado === 'TODOS' || (pedido.estado || 'PENDIENTE') === filterEstado;
    
    return matchesSearch && matchesFilter;
  });

  // Agrupar pedidos por estado
  const pedidosPorEstado = ESTADOS.reduce((acc, est) => {
    acc[est.key] = pedidosFiltrados.filter(p => (p.estado || 'PENDIENTE') === est.key);
    return acc;
  }, {});

  // Calcular estadísticas
  const stats = ESTADOS.reduce((acc, est) => {
    acc[est.key.toLowerCase()] = pedidos.filter(p => (p.estado || 'PENDIENTE') === est.key).length;
    return acc;
  }, { total: pedidos.length });

  // Render ingredientes
  const renderIngredientes = (personalizacion) => {
    if (!personalizacion) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
    try {
      const obj = JSON.parse(personalizacion);
      const selected = Object.entries(obj).filter(([,v]) => v).map(([k]) => k);
      if (selected.length === 0) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
      return (
        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
          {selected.map(ing => <span key={ing} style={{background:'#f1f5f9',color:'#2563eb',borderRadius:6,padding:'2px 8px',fontSize:'0.93em',fontWeight:600,marginBottom:2}}>{ing}</span>)}
        </div>
      );
    } catch {
      return <span style={{color:'#64748b'}}>{personalizacion}</span>;
    }
  };

  const renderPedidoCard = (pedido) => {
    const actual = pedido.estado || 'PENDIENTE';
    const info = getEstadoInfo(actual);
    const esFinal = actual === 'ENTREGADO' || actual === 'CANCELADO';
    const esSeleccionado = selectedPedido?.id === pedido.id;

    return (
      <div 
        key={pedido.id} 
        className="admin-card" 
        style={{
          background: esSeleccionado ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          borderRadius: 16,
          boxShadow: esSeleccionado ? '0 4px 20px var(--shadow-medium)' : '0 2px 8px var(--shadow-light)',
          padding: '1.2rem',
          margin: '0 auto',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'all 0.3s ease',
          border: `2px solid ${esSeleccionado ? 'var(--accent-secondary)' : info.border}`,
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => setSelectedPedido(esSeleccionado ? null : pedido)}
      >
        {/* Header con avatar y info básica */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span className="admin-avatar" style={{
            background: info.border,
            color: info.text,
            border: `3px solid ${info.border}`,
            fontWeight: 900,
            fontSize: '1.4em',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
          </span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 900, fontSize: '1.3em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 4}}>
              {pedido.nombre || 'Cliente'}
            </div>
            <div style={{fontWeight: 700, fontSize: '1.1em', color: 'var(--accent-secondary)', marginBottom: 4}}>
              {pedido.producto || 'Producto'}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: '1em', color: 'var(--text-muted)', fontWeight: 600}}>
              <FiClock/> {formatElapsedTime(pedido.created_at)}
            </div>
            {/* Indicador de tipo de pedido */}
            <div style={{marginTop: 4}}>
              <span style={{
                fontSize: '0.85em',
                padding: '4px 8px',
                borderRadius: 6,
                fontWeight: 700,
                color: esPedidoDomicilio(pedido) ? '#059669' : '#2563eb',
                background: esPedidoDomicilio(pedido) ? '#d1fae5' : '#dbeafe'
              }}>
                {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro'}
              </span>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <span style={{fontSize: '2rem', color: info.text}}>{info.icon}</span>
            <span style={{fontSize: '0.9em', fontWeight: 700, color: info.text}}>{info.label}</span>
          </div>
        </div>

        {/* Ingredientes */}
        <div style={{marginTop: 4}}>
          {renderIngredientes(pedido.personalizacion)}
        </div>

        {/* Información adicional si está seleccionado */}
        {esSeleccionado && (
          <div style={{
            marginTop: 12,
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: 12,
            fontSize: '0.95em',
            color: 'var(--text-secondary)'
          }}>
            <div style={{marginBottom: 8}}>
              <strong>Tipo de pedido:</strong> 
              <span style={{
                color: esPedidoDomicilio(pedido) ? '#059669' : '#2563eb',
                fontWeight: 700,
                marginLeft: 4
              }}>
                {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro en local'}
              </span>
            </div>
            <div style={{marginBottom: 8}}>
              <strong>Dirección:</strong> {pedido.direccion || 'Retiro en local'}
            </div>
            <div style={{marginBottom: 8}}>
              <strong>Bebida:</strong> {pedido.bebida} {pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}
            </div>
            <div style={{marginBottom: 8}}>
              <strong>Resumen:</strong> {pedido.resumen || 'Sin observaciones'}
            </div>
            <div>
              <strong>Total:</strong> ${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12}}>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              await generarBoletaPDF(pedido);
            }} 
            className="admin-btn" 
            style={{
              background: '#38BDF8',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 12,
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)',
              color: '#fff'
            }}
          >
            <FiFileText/> Boleta
          </button>
          
          {!esFinal && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPedido(esSeleccionado ? null : pedido);
              }} 
              className="admin-btn secondary" 
              style={{
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 12,
                minHeight: '48px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: '#f3f4f6',
                color: '#374151'
              }}
            >
              {esSeleccionado ? <FiEyeOff/> : <FiEye/>} {esSeleccionado ? 'Ocultar' : 'Ver'}
            </button>
          )}
        </div>

        {/* Botones de transición */}
        {!esFinal && (
          <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12}}>
            {TRANSICIONES[actual].map(nuevo => {
              const nuevoInfo = getEstadoInfo(nuevo);
              const esDomicilio = esPedidoDomicilio(pedido);
              
              // Lógica para mostrar botones más inteligentes
              let mostrarBoton = true;
              let labelEspecial = nuevoInfo.label;
              
              // Si está LISTO y es domicilio, priorizar "En entrega"
              if (actual === 'LISTO' && nuevo === 'ENTREGADO' && esDomicilio) {
                mostrarBoton = false; // No mostrar "Entregado" directamente para domicilio
              }
              
              // Si está LISTO y es retiro, priorizar "Entregado"
              if (actual === 'LISTO' && nuevo === 'EN_ENTREGA' && !esDomicilio) {
                mostrarBoton = false; // No mostrar "En entrega" para retiro
              }
              
              // Personalizar labels
              if (actual === 'LISTO' && nuevo === 'ENTREGADO' && !esDomicilio) {
                labelEspecial = 'Cliente recogió';
              } else if (actual === 'LISTO' && nuevo === 'EN_ENTREGA' && esDomicilio) {
                labelEspecial = 'Enviar a domicilio';
              } else if (actual === 'EN_ENTREGA' && nuevo === 'ENTREGADO') {
                labelEspecial = 'Entregado al cliente';
              }
              
              if (!mostrarBoton) return null;
              
              return (
                <button
                  key={nuevo}
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarEstado(pedido, nuevo);
                  }}
                  className="admin-btn"
                  style={{
                    background: nuevoInfo.border,
                    color: '#fff',
                    padding: '12px 20px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: '48px',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 2px 8px ${nuevoInfo.border}40`
                  }}
                >
                  {nuevoInfo.icon} {labelEspecial}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',padding:0,fontFamily:'Inter,Poppins,Montserrat,sans-serif'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:20,background:'var(--bg-primary)',boxShadow:'0 2px 8px var(--shadow-light)',padding:'1rem 0',marginBottom:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'100vw',margin:'0 auto',padding:'0 2vw'}}>
          <span style={{fontWeight:900,fontSize:'1.8rem',color:'var(--accent-secondary)',letterSpacing:'-1px',display:'flex',alignItems:'center',gap:10}}>
            <FiUser/> quenita's Admin
          </span>
          <div style={{display:'flex',gap:10}}>
            <button onClick={onBack} className="admin-btn secondary" style={{fontSize:'1em',padding:'8px 16px'}}>Volver</button>
            <button onClick={onLogout} className="admin-btn danger" style={{fontSize:'1em',padding:'8px 16px'}}>Salir</button>
            <button 
              onClick={toggleDarkMode} 
              className="admin-btn" 
              style={{
                fontSize: '1em',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {darkMode ? <FiMoon/> : <FiSun/>}
            </button>
      </div>
        </div>
      </header>

      {/* Botones de navegación rápida */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2vw'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{
            fontWeight: 600,
            color: 'var(--text-muted)',
            fontSize: '0.9em',
            marginRight: 8
          }}>
            Acceso rápido:
          </span>
          
          <button
            onClick={() => setRoute('/admin-quenita')}
            className="admin-btn"
            style={{
              background: '#1f2937',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            🏠 Panel Principal
          </button>
          
          <button
            onClick={() => setRoute('/cocina')}
            className="admin-btn"
            style={{
              background: '#059669',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiCoffee/> Cocina
          </button>
          
          <button
            onClick={() => setRoute('/caja')}
            className="admin-btn"
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiShoppingCart/> Caja
          </button>
          
          <button
            onClick={() => setRoute('/cajero')}
            className="admin-btn"
            style={{
              background: '#7c3aed',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiUserPlus/> Cajero
          </button>
          
          <button
            onClick={() => setRoute('/repartidor')}
            className="admin-btn"
            style={{
              background: '#F97316',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            🚚 Repartidor
          </button>
          
          <button
            onClick={() => setRoute('/calendario')}
            className="admin-btn"
            style={{
              background: '#8B5CF6',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            📅 Calendario
          </button>
        </div>
      </div>

      {/* Controles y filtros */}
      <div style={{padding:'2rem 2vw',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-color)'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:20,alignItems:'center',justifyContent:'space-between'}}>
          {/* Búsqueda */}
          <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:250,background:'var(--bg-tertiary)',borderRadius:12,padding:'4px 16px',border:'2px solid var(--border-color)'}}>
            <FiSearch style={{color:'var(--text-muted)',fontSize:'1.2em'}}/>
                          <input
                type="text"
                placeholder="Buscar por nombre del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.1em',
                  padding: '12px 8px',
                  background: 'transparent',
                  flex: 1,
                  minWidth: 200,
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}
              />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <FiFilter style={{color:'var(--text-muted)',fontSize:'1.2em'}}/>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: '1.1em',
                background: 'var(--bg-secondary)',
                fontWeight: 500,
                minHeight: '48px',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            >
              <option value="TODOS">Todos los estados</option>
              {ESTADOS.map(estado => (
                <option key={estado.key} value={estado.key}>{estado.label}</option>
              ))}
            </select>
          </div>

          {/* Botón estadísticas */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="admin-btn"
            style={{
              background: showStats ? '#3b82f6' : '#f3f4f6',
              color: showStats ? '#fff' : '#374151',
              padding: '12px 20px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <FiActivity/> Estadísticas
          </button>

          {/* Botón refresh */}
          <button
            onClick={fetchPedidos}
            className="admin-btn secondary"
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <FiRefreshCw/> Actualizar
          </button>
          
          {/* Botón de prueba */}
          <button
            onClick={async () => {
              console.log('🧪 Probando conexión con Supabase...');
              try {
                const { data, error } = await supabase
                  .from('pedidos')
                  .select('count')
                  .limit(1);
                
                if (error) {
                  console.error('❌ Error de conexión:', error);
                  alert('Error de conexión: ' + error.message);
                } else {
                  console.log('✅ Conexión exitosa');
                  alert('Conexión exitosa con Supabase');
                }
              } catch (err) {
                console.error('❌ Error:', err);
                alert('Error: ' + err.message);
              }
            }}
            className="admin-btn"
            style={{
              background: '#8B5CF6',
              padding: '12px 20px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
            }}
          >
            🧪 Probar Conexión
          </button>
        </div>



        {/* Estadísticas */}
        {showStats && (
          <div style={{
            marginTop: 16,
            padding: '16px',
            background: '#f8fafc',
            borderRadius: 12,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-around'
          }}>
        {ESTADOS.map(estado => {
              const count = stats[estado.key.toLowerCase()] || 0;
          const info = getEstadoInfo(estado.key);
          return (
            <div key={estado.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: info.color,
                  borderRadius: 8,
                  border: `1px solid ${info.border}`
                }}>
                  <span style={{color: info.text}}>{info.icon}</span>
                  <span style={{fontWeight: 700, color: info.text}}>{info.label}</span>
                  <span style={{
                    background: '#fff',
                    color: info.text,
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontWeight: 800,
                    fontSize: '0.9em'
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: '#f1f5f9',
              borderRadius: 8,
              border: '1px solid #cbd5e1'
            }}>
              <span style={{color: '#475569'}}><FiActivity/></span>
              <span style={{fontWeight: 700, color: '#475569'}}>Total</span>
              <span style={{
                background: '#fff',
                color: '#475569',
                borderRadius: 6,
                padding: '2px 8px',
                fontWeight: 800,
                fontSize: '0.9em'
              }}>
                {stats.total}
              </span>
            </div>
                      </div>
                    )}
                  </div>

      {/* Contenido principal */}
      <div style={{padding:'1.5rem 2vw'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}>
            <FiRefreshCw style={{fontSize:'2rem',animation:'spin 1s linear infinite'}}/>
            <div style={{marginTop:16}}>Cargando pedidos...</div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}>
            <FiAlertCircle style={{fontSize:'3rem',marginBottom:16}}/>
            <div style={{fontSize:'1.2em',marginBottom:8}}>No hay pedidos</div>
            <div style={{color:'#9ca3af'}}>
              {searchTerm || filterEstado !== 'TODOS' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Todos los pedidos han sido procesados'}
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {ESTADOS.map(estado => {
              const pedidosEnEstado = pedidosPorEstado[estado.key];
              if (pedidosEnEstado.length === 0) return null;
              
              const info = getEstadoInfo(estado.key);
              return (
                <div key={estado.key} style={{
                  background: info.color,
                  borderRadius: 16,
                  padding: '1.5rem',
                  border: `2px solid ${info.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 16
                  }}>
                    <span style={{fontSize: '1.5rem', color: info.text}}>{info.icon}</span>
                    <span style={{
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      color: info.text,
                      letterSpacing: '-1px'
                    }}>
                      {info.label}
                    </span>
                    <span style={{
                      background: '#fff',
                      color: info.text,
                      borderRadius: 10,
                      padding: '4px 12px',
                      fontWeight: 800,
                      fontSize: '1em',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                    }}>
                      {pedidosEnEstado.length}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: 16
                  }}>
                    {pedidosEnEstado.map(renderPedidoCard)}
          </div>
            </div>
          );
        })}
      </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && pendingAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 400,
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '1.5rem', marginBottom: 16, color: 'var(--text-primary)'}}>
              ¿Confirmar cambio de estado?
            </div>
            <div style={{marginBottom: 20, color: 'var(--text-muted)'}}>
              Cambiar pedido de <strong>{getEstadoInfo(pendingAction.pedido.estado || 'PENDIENTE').label}</strong> a{' '}
              <strong>{getEstadoInfo(pendingAction.nuevoEstado).label}</strong>
            </div>
            <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="admin-btn secondary"
                style={{padding: '10px 20px'}}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                className="admin-btn"
                style={{
                  background: getEstadoInfo(pendingAction.nuevoEstado).border,
                  padding: '10px 20px'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminPanel;