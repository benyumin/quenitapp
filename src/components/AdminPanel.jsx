import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import {
  FiPhone, FiClock, FiFileText, FiChevronRight, FiChevronLeft, FiCheckCircle, FiXCircle, FiInfo, FiUser, FiPackage, FiTruck, FiCheck, FiX, FiDownload, FiEye, FiEyeOff
} from 'react-icons/fi';
import '../App.css';

// Estados y reglas de transición
const ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiClock /> },
  { key: 'EN_PREPARACION', label: 'En Preparación', color: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: <FiPackage /> },
  { key: 'LISTO', label: 'Listo', color: '#D1FAE5', border: '#10B981', text: '#065F46', icon: <FiTruck /> },
  { key: 'ENTREGADO', label: 'Entregado', color: '#E0E7FF', border: '#8B5CF6', text: '#5B21B6', icon: <FiCheck /> },
  { key: 'CANCELADO', label: 'Cancelado', color: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: <FiX /> },
];

const TRANSICIONES = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['LISTO', 'CANCELADO'],
  LISTO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: []
};

// Utilidad para obtener info de estado
const getEstadoInfo = (key) => ESTADOS.find(e => e.key === key) || ESTADOS[0];

// Generar boleta PDF
function generarBoletaPDF(pedido) {
  const doc = new jsPDF();
  let y = 20;
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('QUENITA\'S FOODTRUCK', 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(16);
  doc.text('Boleta de Pedido', 105, y, { align: 'center' });
  y += 15;
  
  // Información del pedido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(pedido.created_at).toLocaleString('es-CL')}`, 15, y); y += 8;
  doc.text(`Cliente: ${pedido.nombre || 'N/A'}`, 15, y); y += 8;
  doc.text(`Producto: ${pedido.producto || 'N/A'}`, 15, y); y += 10;
  
  // Ingredientes
  doc.setFont('helvetica', 'bold');
  doc.text('Ingredientes:', 15, y); y += 7;
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
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Estado: ${getEstadoInfo(pedido.estado || 'PENDIENTE').label}`, 15, y); y += 8;
  doc.text(`Total: $${pedido.precio_total ? pedido.precio_total.toLocaleString('es-CL') : '0'} CLP`, 15, y);
  
  // Footer
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('¡Gracias por elegir Quenita\'s Foodtruck!', 105, y, { align: 'center' });
  
  doc.save(`boleta_${(pedido.nombre || 'cliente').replace(/\s/g, '_')}_${new Date().getTime()}.pdf`);
}

// Formato de hora relativa
function formatElapsedTime(createdAt) {
  const timeElapsed = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (timeElapsed < 1) return 'Recién creado';
  if (timeElapsed < 60) return `Hace ${timeElapsed} min`;
  if (timeElapsed < 1440) {
    const hours = Math.floor(timeElapsed / 60);
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }
  const days = Math.floor(timeElapsed / 1440);
  return `Hace ${days} día${days === 1 ? '' : 's'}`;
}

const AdminPanel = ({ onLogout, onBack }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPedidos(data || []);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedidos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cambiar estado con validación de transición
  const cambiarEstado = async (id, actual, nuevo) => {
    if (!TRANSICIONES[actual]?.includes(nuevo)) return;
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevo })
        .eq('id', id);
      
      if (error) throw error;
      
      setPedidos(pedidos => 
        pedidos.map(p => p.id === id ? { ...p, estado: nuevo } : p)
      );
    } catch (error) {
      console.error('Error updating estado:', error);
    }
  };

  // Agrupar pedidos por estado
  const pedidosPorEstado = ESTADOS.reduce((acc, est) => {
    acc[est.key] = pedidos.filter(p => (p.estado || 'PENDIENTE') === est.key);
    return acc;
  }, {});

  // Render ingredientes
  const renderIngredientes = (personalizacion) => {
    if (!personalizacion) {
      return (
        <div className="no-ingredients">
          <span>Sin personalización</span>
        </div>
      );
    }
    
    try {
      const obj = JSON.parse(personalizacion);
      const selected = Object.entries(obj).filter(([,v]) => v).map(([k]) => k);
      
      if (selected.length === 0) {
        return (
          <div className="no-ingredients">
            <span>Sin personalización</span>
          </div>
        );
      }
      
      return (
        <div className="ingredients-list">
          {selected.map(ing => (
            <span key={ing} className="ingredient-tag">
              {ing}
            </span>
          ))}
        </div>
      );
    } catch {
      return (
        <div className="ingredients-list">
          <span className="ingredient-tag raw">
            {personalizacion}
          </span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <FiUser className="logo-icon" />
            <span className="logo-text">quenita's</span>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="admin-actions">
            <button onClick={onBack} className="admin-btn-header secondary">
              <FiChevronLeft />
              Volver
            </button>
            <button onClick={onLogout} className="admin-btn-header danger">
              <FiX />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="admin-stats">
        <div className="stats-grid">
          {ESTADOS.map(estado => {
            const count = pedidosPorEstado[estado.key].length;
            const info = getEstadoInfo(estado.key);
            return (
              <div key={estado.key} className="stat-card" style={{ borderColor: info.border }}>
                <div className="stat-icon" style={{ color: info.border }}>
                  {info.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-number">{count}</span>
                  <span className="stat-label">{info.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Board */}
      <div className="orders-board">
        {ESTADOS.map(estado => {
          const info = getEstadoInfo(estado.key);
          const pedidosEstado = pedidosPorEstado[estado.key];
          
          return (
            <div key={estado.key} className="order-column">
              <div 
                className="column-header" 
                style={{ 
                  backgroundColor: info.color,
                  borderColor: info.border,
                  color: info.text 
                }}
              >
                <div className="column-title">
                  {info.icon}
                  <span>{info.label}</span>
                </div>
                <div className="column-count">
                  {pedidosEstado.length}
                </div>
              </div>

              <div className="orders-list">
                {pedidosEstado.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay pedidos</p>
                  </div>
                ) : (
                  pedidosEstado.map((pedido) => {
                    const actual = pedido.estado || 'PENDIENTE';
                    const esFinal = actual === 'ENTREGADO' || actual === 'CANCELADO';
                    const isExpanded = expandedId === pedido.id;
                    
                    return (
                      <div key={pedido.id} className="order-card">
                        <div className="order-header">
                          <div className="customer-info">
                            <div 
                              className="customer-avatar"
                              style={{ backgroundColor: info.border, color: '#fff' }}
                            >
                              {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="customer-details">
                              <h4 className="customer-name">
                                {pedido.nombre || 'Cliente'}
                              </h4>
                              <p className="product-name">
                                {pedido.producto || 'Producto'}
                              </p>
                            </div>
                          </div>
                          <div className="order-time">
                            <FiClock />
                            <span>{formatElapsedTime(pedido.created_at)}</span>
                          </div>
                        </div>

                        <div className="order-ingredients">
                          {renderIngredientes(pedido.personalizacion)}
                        </div>

                        {pedido.precio_total && (
                          <div className="order-total">
                            <strong>${pedido.precio_total.toLocaleString('es-CL')} CLP</strong>
                          </div>
                        )}

                        <div className="order-actions">
                          <button 
                            onClick={() => generarBoletaPDF(pedido)}
                            className="order-btn primary"
                            title="Descargar boleta"
                          >
                            <FiDownload />
                            Boleta
                          </button>
                          
                          {!esFinal && (
                            <button 
                              onClick={() => setExpandedId(isExpanded ? null : pedido.id)}
                              className="order-btn secondary"
                            >
                              {isExpanded ? <FiEyeOff /> : <FiEye />}
                              {isExpanded ? 'Ocultar' : 'Detalles'}
                            </button>
                          )}
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && !esFinal && (
                          <div className="order-details">
                            <div className="detail-item">
                              <strong>Dirección:</strong>
                              <span>{pedido.direccion || 'Retiro en local'}</span>
                            </div>
                            <div className="detail-item">
                              <strong>Bebida:</strong>
                              <span>
                                {pedido.bebida} 
                                {pedido.tipo_bebida && ` (${pedido.tipo_bebida})`}
                              </span>
                            </div>
                            {pedido.resumen && (
                              <div className="detail-item">
                                <strong>Resumen:</strong>
                                <span>{pedido.resumen}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* State Transition Buttons */}
                        {!esFinal && TRANSICIONES[actual].length > 0 && (
                          <div className="state-actions">
                            {TRANSICIONES[actual].map(nuevo => {
                              const nuevoInfo = getEstadoInfo(nuevo);
                              return (
                                <button
                                  key={nuevo}
                                  onClick={() => cambiarEstado(pedido.id, actual, nuevo)}
                                  className="state-btn"
                                  style={{ 
                                    backgroundColor: nuevoInfo.border,
                                    color: '#fff'
                                  }}
                                >
                                  {nuevoInfo.icon}
                                  {nuevoInfo.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;