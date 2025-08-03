import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  FiArrowLeft, FiRefreshCw, FiCheckCircle, FiXCircle, FiFileText, FiEye, FiEyeOff,
  FiPackage, FiClock, FiDollarSign, FiUser, FiMapPin, FiInfo, FiPlay,
  FiCoffee, FiShoppingCart, FiUserPlus, FiSun, FiMoon
} from 'react-icons/fi';
import '../App.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';
import jsPDF from 'jspdf';

const RepartidorPanel = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });
  
  const [nuevosPedidos, setNuevosPedidos] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);

  // Función para cambiar el modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('quenitas-dark', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  const playNotificationSound = () => {
    try {
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
        .eq('estado', 'EN_ENTREGA')
        .order('created_at', { ascending: true });
      
      const pedidosActuales = data || [];
      setPedidos(pedidosActuales);
      
      // Detectar nuevos pedidos
      if (pedidosAnteriores.length > 0) {
        const nuevosPedidosDetectados = pedidosActuales.filter(pedidoActual => 
          !pedidosAnteriores.some(pedidoAnterior => pedidoAnterior.id === pedidoActual.id)
        );
        
        if (nuevosPedidosDetectados.length > 0) {
          setNuevosPedidos(nuevosPedidosDetectados);
          setNotificationCount(nuevosPedidosDetectados.length);
          setShowNotification(true);
          
          playNotificationSound();
          
          setTimeout(() => {
            setShowNotification(false);
            setNuevosPedidos([]);
            setNotificationCount(0);
          }, 5000);
          
          console.log(`¡${nuevosPedidosDetectados.length} nuevo(s) pedido(s) para entregar!`);
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
    const interval = setInterval(fetchPedidos, 10000);
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

  function loadImageAsBase64(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataURL);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  async function generarBoletaPDF(pedido) {
    try {
      const doc = new jsPDF();
      
      // Cargar logo
      let logoBase64;
      try {
        logoBase64 = await loadImageAsBase64(logoQuenitas);
      } catch (error) {
        console.log('No se pudo cargar el logo');
      }
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 15, 15, 30, 15);
      }
      
      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Quenita\'s Foodtruck', 105, 25, { align: 'center' });
      
      // Información del pedido
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let y = 45;
      
      doc.text(`Pedido #${pedido.id}`, 15, y);
      y += 8;
      doc.text(`Cliente: ${pedido.nombre}`, 15, y);
      y += 8;
      doc.text(`Teléfono: ${pedido.telefono}`, 15, y);
      y += 8;
      doc.text(`Dirección: ${pedido.direccion}`, 15, y);
      y += 8;
      doc.text(`Fecha: ${new Date(pedido.created_at).toLocaleString('es-CL')}`, 15, y);
      y += 12;
      
      // Productos
      doc.setFont('helvetica', 'bold');
      doc.text('Productos:', 15, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`${pedido.producto} - $${pedido.precio_total}`, 15, y);
      y += 6;
      if (pedido.bebida && pedido.bebida !== 'Sin bebida') {
        doc.text(`Bebida: ${pedido.bebida}`, 15, y);
        y += 6;
      }
      
      // Personalización
      if (pedido.personalizacion) {
        try {
          const personalizacion = JSON.parse(pedido.personalizacion);
          if (personalizacion.length > 0) {
            y += 6;
            doc.setFont('helvetica', 'bold');
            doc.text('Personalización:', 15, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            personalizacion.forEach(item => {
              doc.text(`• ${item.name}`, 15, y);
              y += 4;
            });
          }
        } catch (e) {
          console.log('Error parsing personalización');
        }
      }
      
      // Total
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: $${pedido.precio_total}`, 15, y);
      
      // Método de pago
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Método de pago: ${pedido.metodo_pago}`, 15, y);
      
      // Estado
      y += 8;
      doc.text(`Estado: ${pedido.estado || 'EN_ENTREGA'}`, 15, y);
      
      // Pie de página
      doc.setFontSize(10);
      doc.text('¡Gracias por tu pedido!', 105, 280, { align: 'center' });
      
      // Guardar PDF
      doc.save(`pedido-${pedido.id}-repartidor.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  function formatElapsedTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}min`;
    } else {
      return `${diffMins}min`;
    }
  }

  const renderPedidoCard = (pedido) => {
    const esDomicilio = pedido.tipo_entrega === 'Domicilio';
    const esUrgente = formatElapsedTime(pedido.created_at).includes('h') && 
                      parseInt(formatElapsedTime(pedido.created_at).split('h')[0]) > 1;
    const esSeleccionado = selectedPedido && selectedPedido.id === pedido.id;

    return (
      <div
        key={pedido.id}
        style={{
          background: esUrgente ? '#FEF2F2' : '#F0FDF4',
          border: `2px solid ${esUrgente ? '#EF4444' : '#10B981'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={() => setSelectedPedido(esSeleccionado ? null : pedido)}
      >
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#8B5CF6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}>
              {pedido.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight: 'bold', fontSize: '1.1em', color: '#1F2937'}}>
                {pedido.nombre}
              </div>
              <div style={{color: '#3B82F6', fontSize: '0.9em', fontWeight: 600}}>
                {pedido.producto} →
              </div>
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '0.8em', color: '#6B7280'}}>
              {formatElapsedTime(pedido.created_at)}
            </div>
            <div style={{fontSize: '0.8em', color: '#6B7280'}}>
              ID: {pedido.id}
            </div>
            <div style={{fontWeight: 'bold', color: '#10B981', fontSize: '1.1em'}}>
              ${pedido.precio_total}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8em', color: '#6B7280'}}>
              {esDomicilio ? '🚚' : '🏪'} {esDomicilio ? 'Domicilio' : 'Retiro'}
            </div>
          </div>
        </div>

        {/* Detalles expandidos */}
        {esSeleccionado && (
          <div style={{marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px'}}>
            <div style={{marginBottom: '12px'}}>
              <strong>Dirección:</strong> {pedido.direccion}
            </div>
            <div style={{marginBottom: '12px'}}>
              <strong>Teléfono:</strong> {pedido.telefono}
            </div>
            <div style={{marginBottom: '12px'}}>
              <strong>Producto:</strong> {pedido.producto}
            </div>
            {pedido.bebida && pedido.bebida !== 'Sin bebida' && (
              <div style={{marginBottom: '12px'}}>
                <strong>Bebida:</strong> {pedido.bebida}
              </div>
            )}
            {pedido.personalizacion && (
              <div style={{marginBottom: '12px'}}>
                <div style={{
                  fontSize: '0.9em',
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
            <div style={{marginBottom: '12px'}}>
              <strong>Método de pago:</strong> {pedido.metodo_pago}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{display: 'flex', gap: 8, marginTop: 12}}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              generarBoletaPDF(pedido);
            }}
            className="admin-btn"
            style={{
              background: '#3B82F6',
              color: '#fff',
              padding: '8px 12px',
              fontWeight: 600,
              fontSize: '0.85em',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <FiFileText size={14}/> Boleta
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPedido(pedido);
            }}
            className="admin-btn"
            style={{
              background: '#9CA3AF',
              color: '#fff',
              padding: '8px 12px',
              fontWeight: 600,
              fontSize: '0.85em',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flex: 1,
              justifyContent: 'center'
            }}
          >
            {esSeleccionado ? <FiEyeOff size={14}/> : <FiEye size={14}/>} {esSeleccionado ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {/* Botones principales */}
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
            <FiCheckCircle/> Entregado
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
            🚚 Repartidor Quenita's
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: 'var(--text-secondary)',
            fontSize: '1rem'
          }}>
            Entregar pedidos a domicilio
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
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
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
            color: 'var(--text-primary)'
          }}>
            En Entrega: {pedidos.length}
          </h2>
        </div>
        <button
          onClick={fetchPedidos}
          style={{
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.9em',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FiRefreshCw size={14}/> Actualizar
        </button>
      </div>

      {/* Notificación de nuevos pedidos */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          animation: 'slideInRight 0.5s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px'
        }}>
          <div style={{fontSize: '1.5rem'}}>🚚</div>
          <div>
            <div style={{fontWeight: 'bold', fontSize: '1.1em'}}>
              ¡Nuevo pedido para entregar!
            </div>
            <div style={{fontSize: '0.9em', opacity: 0.9}}>
              {notificationCount} pedido(s) en espera
            </div>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto'
            }}
          >
            ×
          </button>
        </div>
      )}

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
              borderTop: '4px solid #10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}/>
            <span style={{marginLeft: '12px', fontSize: '1.1em'}}>Cargando pedidos...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '16px'}}>🚚</div>
            <h3 style={{margin: '0 0 8px 0', fontSize: '1.5em', color: 'var(--text-primary)'}}>
              No hay pedidos para entregar
            </h3>
            <p style={{margin: 0, fontSize: '1.1em'}}>
              Los pedidos aparecerán aquí cuando estén listos para entrega
            </p>
          </div>
        ) : (
          <div>
            {pedidos.map(renderPedidoCard)}
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
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{margin: '0 0 16px 0', color: '#1F2937'}}>
              Confirmar cambio de estado
            </h3>
            <p style={{margin: '0 0 20px 0', color: '#6B7280'}}>
              ¿Estás seguro de que quieres cambiar el pedido de{' '}
              <strong>EN_ENTREGA</strong> a{' '}
              <strong>{pendingAction.nuevoEstado}</strong>?
            </p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                style={{
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  cursor: 'pointer'
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

export default RepartidorPanel; 