import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  FiArrowLeft, FiRefreshCw, FiCheckCircle, FiXCircle, FiFileText, FiEye, FiEyeOff,
  FiPackage, FiClock, FiDollarSign, FiUser, FiMapPin, FiInfo,
  FiCoffee, FiShoppingCart, FiUserPlus, FiSun, FiMoon
} from 'react-icons/fi';
import '../App.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';
import jsPDF from 'jspdf';

const CajaPanel = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // Estados para notificaciones de nuevos pedidos
  const [nuevosPedidos, setNuevosPedidos] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);
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

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      // Crear un audio context para generar un beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir el sonido de notificación');
    }
  };

  // Función para cargar pedidos
  const fetchPedidos = async () => {
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .eq('estado', 'LISTO')
        .order('created_at', { ascending: true });
      
      const pedidosActuales = data || [];
      setPedidos(pedidosActuales);
      
      // Detectar nuevos pedidos
      if (pedidosAnteriores.length > 0) {
        const nuevosPedidosDetectados = pedidosActuales.filter(pedidoActual => 
          !pedidosAnteriores.some(pedidoAnterior => pedidoAnterior.id === pedidoActual.id)
        );
        
        if (nuevosPedidosDetectados.length > 0) {
          // Mostrar notificación de nuevos pedidos
          setNuevosPedidos(nuevosPedidosDetectados);
          setNotificationCount(nuevosPedidosDetectados.length);
          setShowNotification(true);
          
          // Reproducir sonido de notificación
          playNotificationSound();
          
          // Ocultar notificación después de 5 segundos
          setTimeout(() => {
            setShowNotification(false);
            setNuevosPedidos([]);
            setNotificationCount(0);
          }, 5000);
          
          console.log(`¡${nuevosPedidosDetectados.length} nuevo(s) pedido(s) listo(s)!`);
        }
      }
      
      setPedidosAnteriores(pedidosActuales);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const cambiarEstado = async (pedido, nuevoEstado) => {
    setSelectedPedido(pedido);
    setPendingAction({ pedido, nuevoEstado });
    setShowConfirmModal(true);
  };

  const confirmarCambioEstado = async () => {
    if (!pendingAction) return;
    
    const { pedido, nuevoEstado } = pendingAction;
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedido.id);
      
      if (error) throw error;
      
      // Actualizar estado local
      setPedidos(prev => 
        prev.map(p => 
          p.id === pedido.id ? { ...p, estado: nuevoEstado } : p
        )
      );
      
      setShowConfirmModal(false);
      setPendingAction(null);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error updating estado:', error);
    }
  };

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

  function formatElapsedTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (remainingMins === 0) return `${diffHours}h`;
    return `${diffHours}h ${remainingMins}min`;
  }

  const renderPedidoCard = (pedido) => {
    const esSeleccionado = selectedPedido?.id === pedido.id;
    const esDomicilio = pedido.direccion && pedido.direccion.trim() !== '' && 
                       pedido.direccion.toLowerCase() !== 'retiro en local' &&
                       pedido.direccion.toLowerCase() !== 'retiro' &&
                       pedido.direccion.toLowerCase() !== 'local';

    const getEstadoInfo = (estado) => {
      switch (estado) {
        case 'PENDIENTE':
          return { color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiInfo />, label: 'Pendiente' };
        case 'LISTO':
          return { color: '#D1FAE5', border: '#10B981', text: '#065F46', icon: <FiCheckCircle />, label: 'Listo' };
        default:
          return { color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiInfo />, label: 'Pendiente' };
      }
    };

    const estadoInfo = getEstadoInfo(pedido.estado);

    return (
      <div 
        key={pedido.id} 
        style={{
          background: estadoInfo.color,
          border: `2px solid ${estadoInfo.border}`,
          borderRadius: '16px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: esSeleccionado ? 'scale(1.02)' : 'scale(1)',
          boxShadow: esSeleccionado ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}
        onClick={() => setSelectedPedido(esSeleccionado ? null : pedido)}
      >
        {/* Header del pedido */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
              {estadoInfo.icon}
              <span style={{fontWeight: 700, color: estadoInfo.text}}>
                {estadoInfo.label}
              </span>
            </div>
            <div style={{fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '4px'}}>
              {formatElapsedTime(pedido.created_at)}
            </div>
            <div style={{fontSize: '0.85em', color: 'var(--text-secondary)'}}>
              ID: {pedido.id?.toString().substring(0,8).toUpperCase() || 'N/A'}
            </div>
          </div>
          
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 700, fontSize: '1.1em', color: 'var(--text-primary)'}}>
              ${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'}
            </div>
            <div style={{fontSize: '0.85em', color: 'var(--text-secondary)'}}>
              {esDomicilio ? '🚚 Domicilio' : '🏪 Retiro'}
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div style={{marginBottom: '12px'}}>
          <div style={{fontWeight: 600, fontSize: '1.1em', color: 'var(--text-primary)', marginBottom: '4px'}}>
            {pedido.nombre || 'Cliente sin nombre'}
          </div>
          <div style={{fontSize: '0.95em', color: 'var(--text-secondary)', marginBottom: '4px'}}>
            {pedido.producto || 'Producto no especificado'}
          </div>
          {pedido.bebida && (
            <div style={{fontSize: '0.9em', color: 'var(--text-secondary)'}}>
              🥤 {pedido.bebida} {pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}
            </div>
          )}
          
          {/* Mostrar ingredientes */}
          {pedido.personalizacion && (
            <div style={{marginTop: '8px'}}>
              <div style={{
                fontSize: '0.85em',
                fontWeight: 600,
                color: '#059669',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                🧀 Ingredientes:
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
                {(() => {
                  try {
                    const pers = JSON.parse(pedido.personalizacion);
                    const selected = Object.entries(pers).filter(([,v]) => v).map(([k]) => k);
                    if (selected.length > 0) {
                      return selected.map((ing, index) => (
                        <span key={index} style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.75em',
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                          border: '1px solid #047857'
                        }}>
                          {ing}
                        </span>
                      ));
                    } else {
                      return (
                        <span style={{
                          background: '#f3f4f6',
                          color: '#6b7280',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.75em',
                          fontStyle: 'italic'
                        }}>
                          Sin personalización
                        </span>
                      );
                    }
                  } catch {
                    return (
                      <span style={{
                        background: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: '0.75em',
                        fontStyle: 'italic'
                      }}>
                        Sin personalización
                      </span>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Detalles expandidos */}
        {esSeleccionado && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '12px',
            marginTop: '12px'
          }}>
            <div style={{marginBottom: '8px'}}>
              <strong>Tipo de pedido:</strong> {esDomicilio ? 'Domicilio' : 'Retiro en local'}
            </div>
            
            {esDomicilio && (
              <div style={{marginBottom: '8px'}}>
                <strong>Dirección:</strong> {pedido.direccion}
              </div>
            )}
            
            {pedido.resumen && (
              <div style={{marginBottom: '8px'}}>
                <strong>Observaciones:</strong> {pedido.resumen}
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap'}}>
          {/* Botón Boleta */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              generarBoletaPDF(pedido);
            }} 
            className="admin-btn" 
            style={{
              background: '#38BDF8',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.9em',
              borderRadius: 8,
              minHeight: '40px',
              minWidth: '70px'
            }}
          >
            <FiFileText/> Boleta
          </button>
          
          {/* Botón Ver/Ocultar */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPedido(esSeleccionado ? null : pedido);
            }} 
            className="admin-btn secondary" 
            style={{
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.9em',
              borderRadius: 8,
              minHeight: '40px',
              minWidth: '70px'
            }}
          >
            {esSeleccionado ? <FiEyeOff/> : <FiEye/>} {esSeleccionado ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {/* Botones de transición */}
        {pedido.estado === 'PENDIENTE' && (
          <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16}}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cambiarEstado(pedido, 'ENTREGADO');
              }}
              className="admin-btn"
              style={{
                background: '#10B981',
                color: '#fff',
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: '1em',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: '48px',
                minWidth: '100px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <FiCheckCircle/> {esDomicilio ? 'Entregado' : 'Cliente recogió'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cambiarEstado(pedido, 'CANCELADO');
              }}
              className="admin-btn"
              style={{
                background: '#EF4444',
                color: '#fff',
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: '1em',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: '48px',
                minWidth: '100px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <FiXCircle/> Cancelar
            </button>
          </div>
        )}

        {pedido.estado === 'LISTO' && (
          <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16}}>
            {esDomicilio ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cambiarEstado(pedido, 'EN_ENTREGA');
                }}
                className="admin-btn"
                style={{
                  background: '#F97316',
                  color: '#fff',
                  padding: '14px 20px',
                  fontWeight: 700,
                  fontSize: '1em',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: '48px',
                  minWidth: '100px',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                🚚 Enviar al repartidor
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cambiarEstado(pedido, 'ENTREGADO');
                }}
                className="admin-btn"
                style={{
                  background: '#10B981',
                  color: '#fff',
                  padding: '14px 20px',
                  fontWeight: 700,
                  fontSize: '1em',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: '48px',
                  minWidth: '100px',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <FiCheckCircle/> Cliente recogió
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                cambiarEstado(pedido, 'CANCELADO');
              }}
              className="admin-btn"
              style={{
                background: '#EF4444',
                color: '#fff',
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: '1em',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minHeight: '48px',
                minWidth: '100px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <FiXCircle/> Cancelar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'var(--bg-secondary)',
        borderBottom: '2px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            💰 Caja Quenita's
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: 'var(--text-secondary)',
            fontSize: '1rem'
          }}>
            Manejar pedidos listos y entregas
          </p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
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
          <button
            onClick={onBack}
            style={{
              background: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '1em',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiArrowLeft size={16}/> Volver
        </button>
        </div>
      </div>

      {/* Botones de navegación rápida */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        marginBottom: '0'
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
        </div>
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.3em',
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiPackage/> Pedidos Activos
          </h2>
          <button
            onClick={fetchPedidos}
            disabled={loading}
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9em',
              opacity: loading ? 0.6 : 1
            }}
          >
            <FiRefreshCw size={16} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}}/> 
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Estadísticas */}
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          <div style={{
            background: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px 16px',
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#92400E'}}>
              {pedidos.filter(p => p.estado === 'PENDIENTE').length}
            </div>
            <div style={{fontSize: '0.8em', color: '#92400E', fontWeight: 600}}>
              Pendientes
            </div>
          </div>
          
          <div style={{
            background: '#D1FAE5',
            border: '2px solid #10B981',
            borderRadius: '8px',
            padding: '12px 16px',
            textAlign: 'center',
            minWidth: '80px'
          }}>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#065F46'}}>
              {pedidos.filter(p => p.estado === 'LISTO').length}
            </div>
            <div style={{fontSize: '0.8em', color: '#065F46', fontWeight: 600}}>
              Listos
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '24px',
        minHeight: 'calc(100vh - 300px)',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border-color)',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}/>
            <span style={{marginLeft: '12px', fontSize: '1.1em'}}>Cargando pedidos...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{fontSize: '6rem', marginBottom: '24px'}}>💰</div>
            <h3 style={{margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '2rem'}}>
              ¡Caja tranquila!
            </h3>
            <p style={{margin: '0 0 24px 0', fontSize: '1.2em'}}>
              No hay pedidos listos para entregar en este momento
            </p>
            <div style={{
              background: '#F0F9FF',
              border: '2px solid #0EA5E9',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'left'
            }}>
              <div style={{fontSize: '1.3em', fontWeight: 600, color: '#0C4A6E', marginBottom: '16px'}}>
                💡 Consejos para cajeros:
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '24px',
                color: '#0369A1',
                fontSize: '1.1em',
                lineHeight: '1.6'
              }}>
                <li>Mantén el área de entrega organizada</li>
                <li>Verifica los pedidos antes de entregar</li>
                <li>Confirma la identidad del cliente</li>
                <li>Los pedidos aparecerán automáticamente</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            padding: '0'
          }}>
            {pedidos.map(renderPedidoCard)}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '16px'}}>⚠️</div>
            <h3 style={{margin: '0 0 16px 0', color: 'var(--text-primary)'}}>
              Confirmar cambio de estado
            </h3>
            <p style={{margin: '0 0 24px 0', color: 'var(--text-secondary)'}}>
              ¿Estás seguro de que quieres cambiar el estado del pedido de{' '}
              <strong>{selectedPedido?.estado}</strong> a{' '}
              <strong>{pendingAction?.nuevoEstado}</strong>?
            </p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                className="admin-btn secondary"
                style={{
                  padding: '12px 24px',
                  fontSize: '1em',
                  borderRadius: 12,
                  minHeight: '48px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                className="admin-btn"
                style={{
                  background: '#10B981',
                  padding: '12px 24px',
                  fontSize: '1em',
                  borderRadius: 12,
                  minHeight: '48px'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de nuevos pedidos */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          zIndex: 9999,
          animation: 'slideInRight 0.5s ease-out, pulse 2s infinite',
          border: '2px solid #D1FAE5',
          maxWidth: '400px',
          minWidth: '300px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '2rem',
              animation: 'bounce 1s infinite'
            }}>
              ✅
            </div>
            <div>
              <h3 style={{
                margin: '0',
                fontSize: '1.2em',
                fontWeight: '700'
              }}>
                ¡PEDIDO LISTO!
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '1em',
                opacity: '0.9'
              }}>
                {notificationCount} pedido{notificationCount > 1 ? 's' : ''} listo{notificationCount > 1 ? 's' : ''} para entregar
              </p>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '8px'
          }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '8px',
              fontSize: '0.9em'
            }}>
              Pedidos listos:
            </div>
            {nuevosPedidos.slice(0, 3).map((pedido, index) => (
              <div key={pedido.id} style={{
                fontSize: '0.85em',
                marginBottom: '4px',
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }}>
                • {pedido.nombre} - {pedido.producto}
              </div>
            ))}
            {nuevosPedidos.length > 3 && (
              <div style={{
                fontSize: '0.85em',
                fontStyle: 'italic',
                opacity: '0.8'
              }}>
                ... y {nuevosPedidos.length - 3} más
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              setShowNotification(false);
              setNuevosPedidos([]);
              setNotificationCount(0);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default CajaPanel;   