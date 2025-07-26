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
        <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
          Sin personalización
        </div>
      );
    }
    
    try {
      const obj = JSON.parse(personalizacion);
      const selected = Object.entries(obj).filter(([,v]) => v).map(([k]) => k);
      
      if (selected.length === 0) {
        return (
          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Sin personalización
          </div>
        );
      }
      
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {selected.map(ing => (
            <span 
              key={ing} 
              style={{
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}
            >
              {ing}
            </span>
          ))}
        </div>
      );
    } catch {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span 
            style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: '600',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}
          >
            {personalizacion}
          </span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
          Cargando pedidos...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* MENSAJE DE PRUEBA VISIBLE */}
      <div style={{
        background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      }}>
        🚀 ADMIN PANEL ACTUALIZADO - VERSIÓN MODERNA 2024 🚀
      </div>

      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: '40px',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiUser style={{ fontSize: '1.8rem', color: '#3b82f6' }} />
            <span style={{
              fontSize: '1.8rem',
              fontWeight: '900',
              color: '#1e293b',
              letterSpacing: '-0.5px'
            }}>
              quenita's
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              ADMIN
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: '#f1f5f9',
                color: '#475569',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <FiChevronLeft />
              Volver
            </button>
            <button 
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: '#fef2f2',
                color: '#dc2626',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              <FiX />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Resumen de Pedidos
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {ESTADOS.map(estado => {
            const count = pedidosPorEstado[estado.key].length;
            const info = getEstadoInfo(estado.key);
            return (
              <div 
                key={estado.key} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  borderLeft: `4px solid ${info.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ fontSize: '2rem', opacity: 0.8, color: info.border }}>
                  {info.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: '#1e293b',
                    lineHeight: 1
                  }}>
                    {count}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    fontWeight: '500',
                    marginTop: '0.25rem'
                  }}>
                    {info.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Board */}
      <div style={{
        padding: '0 2rem 2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {ESTADOS.map(estado => {
          const info = getEstadoInfo(estado.key);
          const pedidosEstado = pedidosPorEstado[estado.key];
          
          return (
            <div 
              key={estado.key} 
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                height: 'fit-content'
              }}
            >
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: '600',
                backgroundColor: info.color,
                borderColor: info.border,
                color: info.text
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  {info.icon}
                  <span>{info.label}</span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: 'inherit',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {pedidosEstado.length}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                maxHeight: '70vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {pedidosEstado.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    fontStyle: 'italic'
                  }}>
                    <p>No hay pedidos</p>
                  </div>
                ) : (
                  pedidosEstado.map((pedido) => {
                    const actual = pedido.estado || 'PENDIENTE';
                    const esFinal = actual === 'ENTREGADO' || actual === 'CANCELADO';
                    const isExpanded = expandedId === pedido.id;
                    
                    return (
                      <div 
                        key={pedido.id} 
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1rem',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            flex: 1,
                            minWidth: 0
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '1.1rem',
                              flexShrink: 0,
                              backgroundColor: info.border,
                              color: '#fff'
                            }}>
                              {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: '0 0 0.25rem 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {pedido.nombre || 'Cliente'}
                              </h4>
                              <p style={{
                                fontSize: '0.9rem',
                                color: '#3b82f6',
                                fontWeight: '600',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {pedido.producto || 'Producto'}
                              </p>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap'
                          }}>
                            <FiClock />
                            <span>{formatElapsedTime(pedido.created_at)}</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '0.75rem' }}>
                          {renderIngredientes(pedido.personalizacion)}
                        </div>

                        {pedido.precio_total && (
                          <div style={{
                            marginBottom: '0.75rem',
                            textAlign: 'right',
                            fontSize: '1rem',
                            color: '#059669',
                            fontWeight: 'bold'
                          }}>
                            ${pedido.precio_total.toLocaleString('es-CL')} CLP
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '0.75rem'
                        }}>
                          <button 
                            onClick={() => generarBoletaPDF(pedido)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flex: 1,
                              justifyContent: 'center',
                              background: '#3b82f6',
                              color: 'white'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#3b82f6';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Descargar boleta"
                          >
                            <FiDownload />
                            Boleta
                          </button>
                          
                          {!esFinal && (
                            <button 
                              onClick={() => setExpandedId(isExpanded ? null : pedido.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flex: 1,
                                justifyContent: 'center',
                                background: '#f1f5f9',
                                color: '#475569'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e2e8f0';
                                e.currentTarget.style.color = '#334155';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                                e.currentTarget.style.color = '#475569';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              {isExpanded ? <FiEyeOff /> : <FiEye />}
                              {isExpanded ? 'Ocultar' : 'Detalles'}
                            </button>
                          )}
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && !esFinal && (
                          <div style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginBottom: '0.75rem',
                            fontSize: '0.9rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem',
                              gap: '1rem'
                            }}>
                              <strong style={{ color: '#374151', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                Dirección:
                              </strong>
                              <span style={{ color: '#6b7280', textAlign: 'right', wordBreak: 'break-word' }}>
                                {pedido.direccion || 'Retiro en local'}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '0.5rem',
                              gap: '1rem'
                            }}>
                              <strong style={{ color: '#374151', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                Bebida:
                              </strong>
                              <span style={{ color: '#6b7280', textAlign: 'right', wordBreak: 'break-word' }}>
                                {pedido.bebida} 
                                {pedido.tipo_bebida && ` (${pedido.tipo_bebida})`}
                              </span>
                            </div>
                            {pedido.resumen && (
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem'
                              }}>
                                <strong style={{ color: '#374151', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                  Resumen:
                                </strong>
                                <span style={{ color: '#6b7280', textAlign: 'right', wordBreak: 'break-word' }}>
                                  {pedido.resumen}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* State Transition Buttons */}
                        {!esFinal && TRANSICIONES[actual].length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {TRANSICIONES[actual].map(nuevo => {
                              const nuevoInfo = getEstadoInfo(nuevo);
                              return (
                                <button
                                  key={nuevo}
                                  onClick={() => cambiarEstado(pedido.id, actual, nuevo)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    flex: 1,
                                    justifyContent: 'center',
                                    backgroundColor: nuevoInfo.border,
                                    color: '#fff'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
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