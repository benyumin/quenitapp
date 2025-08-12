import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiArrowLeft, FiTruck, FiCheckCircle, FiMapPin, FiClock, FiUser, FiPhone, 
  FiNavigation, FiAlertCircle, FiPackage, FiDollarSign, FiRefreshCw, 
  FiSearch, FiMessageSquare, FiNavigation2, FiTarget
} from 'react-icons/fi';
import './RepartidorPanel.css';

const RepartidorPanel = ({ onBack, setRoute, pedidos = [], onRefresh, onCambiarEstado }) => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('activos');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = async () => {
    if (onRefresh) {
      setLoading(true);
      await onRefresh();
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    if (onCambiarEstado) {
      await onCambiarEstado(pedidoId, nuevoEstado);
    }
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = pedidos;

    // Filtrar por estado
    if (filter === 'activos') {
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        ['LISTO', 'EN_ENTREGA'].includes(p.estado) && esPedidoDomicilio(p)
      );
    } else if (filter !== 'todos') {
      pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === filter.toUpperCase());
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        p.nombre?.toLowerCase().includes(term) ||
        p.producto?.toLowerCase().includes(term) ||
        p.telefono?.includes(term) ||
        p.direccion?.toLowerCase().includes(term)
      );
    }

    return pedidosFiltrados.sort((a, b) => {
      const now = new Date();
      const timeA = Math.floor((now - new Date(a.created_at)) / 60000);
      const timeB = Math.floor((now - new Date(b.created_at)) / 60000);
      
      if (timeA > 45 && timeB <= 45) return -1;
      if (timeB > 45 && timeA <= 45) return 1;
      
      if (a.estado === 'EN_ENTREGA' && b.estado !== 'EN_ENTREGA') return -1;
      if (b.estado === 'EN_ENTREGA' && a.estado !== 'EN_ENTREGA') return 1;
      
      return timeB - timeA;
    });
  };

  const getPedidosEnEntrega = () => pedidos.filter(p => p.estado === 'EN_ENTREGA' && esPedidoDomicilio(p)).length;
  const getPedidosListos = () => pedidos.filter(p => p.estado === 'LISTO' && esPedidoDomicilio(p)).length;
  const getPedidosEntregadosHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return pedidos.filter(p => {
      const fechaPedido = new Date(p.created_at).toISOString().split('T')[0];
      return fechaPedido === hoy && p.estado === 'ENTREGADO' && esPedidoDomicilio(p);
    }).length;
  };
  const getPedidosUrgentes = () => {
    const now = new Date();
    return pedidos.filter(p => {
      if (!['LISTO', 'EN_ENTREGA'].includes(p.estado) || !esPedidoDomicilio(p)) return false;
      const elapsed = Math.floor((now - new Date(p.created_at)) / 60000);
      return elapsed > 45;
    }).length;
  };

  const esPedidoDomicilio = (pedido) => {
    if (!pedido.direccion) return false;
    const direccionLower = pedido.direccion.toLowerCase().trim();
    return direccionLower !== '' &&
           direccionLower !== 'retiro en local' &&
           direccionLower !== 'retiro' &&
           direccionLower !== 'local';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Recién';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const isUrgent = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    return diffMinutes > 45;
  };

  const abrirMaps = (direccion) => {
    const address = encodeURIComponent(direccion);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const llamarCliente = (telefono) => {
    window.open(`tel:${telefono}`, '_blank');
  };

  const enviarWhatsApp = (telefono) => {
    const mensaje = 'Hola, soy el repartidor de Quenitas. Estoy en camino con tu pedido.';
    const mensajeEncoded = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${telefono.replace('+', '')}?text=${mensajeEncoded}`, '_blank');
  };

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="repartidor-container">
      {/* Delivery Header */}
      <div className="repartidor-header">
        <div className="repartidor-title">
          <h1>🚚 Repartidor</h1>
        </div>
        <div className="repartidor-actions">
          <button onClick={handleRefresh} disabled={loading} className="repartidor-btn repartidor-btn-secondary">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={onBack} className="repartidor-btn repartidor-btn-ghost">
            <FiArrowLeft />
            Volver
          </button>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="repartidor-stats">
        <div className={`repartidor-stat ${getPedidosUrgentes() > 0 ? 'urgent' : ''}`}>
          <div className="repartidor-stat-value">{getPedidosUrgentes()}</div>
          <div className="repartidor-stat-label">Urgentes</div>
        </div>
        
        <div className={`repartidor-stat ${getPedidosListos() > 0 ? 'ready' : ''}`}>
          <div className="repartidor-stat-value">{getPedidosListos()}</div>
          <div className="repartidor-stat-label">Listos para Entregar</div>
        </div>
        
        <div className={`repartidor-stat ${getPedidosEnEntrega() > 0 ? 'delivering' : ''}`}>
          <div className="repartidor-stat-value">{getPedidosEnEntrega()}</div>
          <div className="repartidor-stat-label">En Entrega</div>
        </div>
        
        <div className="repartidor-stat delivered">
          <div className="repartidor-stat-value">{getPedidosEntregadosHoy()}</div>
          <div className="repartidor-stat-label">Entregados Hoy</div>
        </div>
      </div>

      {/* Delivery Filters */}
      <div className="repartidor-filters">
        <div className="repartidor-search">
          <FiSearch className="repartidor-search-icon" />
          <input
            type="text"
            placeholder="Buscar pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="repartidor-filter-buttons">
          <button
            className={`repartidor-filter-btn ${filter === 'activos' ? 'active' : ''}`}
            onClick={() => setFilter('activos')}
          >
            🔥 Activos
          </button>
          <button
            className={`repartidor-filter-btn ${filter === 'LISTO' ? 'active' : ''}`}
            onClick={() => setFilter('LISTO')}
          >
            📦 Listos
          </button>
          <button
            className={`repartidor-filter-btn ${filter === 'EN_ENTREGA' ? 'active' : ''}`}
            onClick={() => setFilter('EN_ENTREGA')}
          >
            🚚 En Entrega
          </button>
          <button
            className={`repartidor-filter-btn ${filter === 'ENTREGADO' ? 'active' : ''}`}
            onClick={() => setFilter('ENTREGADO')}
          >
            ✅ Entregados
          </button>
        </div>
      </div>

      {/* Delivery Orders */}
      <div className="repartidor-orders">
        {loading ? (
          <div className="repartidor-loading">
            <FiRefreshCw className="repartidor-loading-icon" />
            <div>Cargando entregas...</div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="repartidor-empty">
            <FiTruck className="repartidor-empty-icon" />
            <h3>No hay entregas</h3>
            <p>No se encontraron entregas para mostrar</p>
          </div>
        ) : (
          <div className="repartidor-orders-grid">
            {pedidosFiltrados.map(pedido => {
              const urgent = isUrgent(pedido.created_at);
              const esDomicilio = esPedidoDomicilio(pedido);
              
              return (
                <div key={pedido.id} className={`repartidor-order-card ${urgent ? 'urgent' : ''} ${pedido.estado === 'EN_ENTREGA' ? 'delivering' : ''} ${pedido.estado === 'ENTREGADO' ? 'delivered' : ''}`}>
                  <div className="repartidor-order-header">
                    <div className="repartidor-customer-info">
                      <div className="repartidor-customer-avatar">
                        {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="repartidor-customer-details">
                        <h4>{pedido.nombre || 'Cliente'}</h4>
                        <p>
                          <FiPhone />
                          {pedido.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    <div className="repartidor-order-status">
                      {urgent && (
                        <span className="repartidor-urgent-badge">
                          <FiAlertCircle />
                          Urgente
                        </span>
                      )}
                      <span className="repartidor-time-badge">
                        <FiClock />
                        {formatTime(pedido.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="repartidor-order-content">
                    <div className="repartidor-order-info">
                      <div className="repartidor-order-item">
                        <span className="repartidor-order-label">Producto</span>
                        <span className="repartidor-order-value">{pedido.producto || 'Producto'}</span>
                      </div>
                      
                      <div className="repartidor-order-item">
                        <span className="repartidor-order-label">Tipo</span>
                        <span className="repartidor-order-value">🚚 Domicilio</span>
                      </div>
                      
                      <div className="repartidor-order-item">
                        <span className="repartidor-order-label">Precio</span>
                        <span className="repartidor-order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="repartidor-order-item">
                        <span className="repartidor-order-label">Estado</span>
                        <span className="repartidor-order-value">
                          {pedido.estado === 'LISTO' && '📦 Listo para Entregar'}
                          {pedido.estado === 'EN_ENTREGA' && '🚚 En Entrega'}
                          {pedido.estado === 'ENTREGADO' && '✅ Entregado'}
                        </span>
                      </div>
                      
                      {esDomicilio && pedido.direccion && (
                        <div className="repartidor-order-item">
                          <span className="repartidor-order-label">Dirección</span>
                          <span className="repartidor-order-value">{pedido.direccion}</span>
                        </div>
                      )}
                      
                      {pedido.observaciones && (
                        <div className="repartidor-order-notes">
                          <span className="repartidor-order-label">Notas Especiales</span>
                          <span className="repartidor-order-value">{pedido.observaciones}</span>
                        </div>
                      )}
                    </div>

                    <div className="repartidor-order-actions">
                      {/* Contact Buttons Row */}
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <button
                          onClick={() => llamarCliente(pedido.telefono)}
                          className="repartidor-action-btn contact"
                          style={{ flex: 1, minHeight: '44px' }}
                        >
                          <FiPhone />
                          Llamar
                        </button>
                        <button
                          onClick={() => enviarWhatsApp(pedido.telefono)}
                          className="repartidor-action-btn contact"
                          style={{ flex: 1, minHeight: '44px' }}
                        >
                          <FiMessageSquare />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => abrirMaps(pedido.direccion)}
                          className="repartidor-action-btn contact"
                          style={{ flex: 1, minHeight: '44px' }}
                        >
                          <FiMapPin />
                          Mapa
                        </button>
                      </div>
                      
                      {/* Status Action Button - More Prominent */}
                      {pedido.estado === 'LISTO' && esDomicilio && (
                        <div style={{ 
                          border: '2px solid #f59e0b', 
                          borderRadius: '0.5rem', 
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            color: '#92400e',
                            textAlign: 'center',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            ⚡ Acción Requerida
                          </div>
                          <button
                            className="repartidor-action-btn prepare"
                            onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                            style={{ 
                              width: '100%', 
                              minHeight: '50px', 
                              fontSize: '1rem',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}
                          >
                            <FiTruck style={{ fontSize: '1.2rem' }} />
                            Iniciar Entrega
                          </button>
                        </div>
                      )}
                      {pedido.estado === 'EN_ENTREGA' && (
                        <div style={{ 
                          border: '2px solid #10b981', 
                          borderRadius: '0.5rem', 
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            color: '#166534',
                            textAlign: 'center',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            ✅ Marcar como Entregado
                          </div>
                          <button
                            className="repartidor-action-btn deliver"
                            onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
                            style={{ 
                              width: '100%', 
                              minHeight: '50px', 
                              fontSize: '1rem',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em'
                            }}
                          >
                            <FiCheckCircle style={{ fontSize: '1.2rem' }} />
                            Marcar Entregado
                          </button>
                        </div>
                      )}
                      {pedido.estado === 'ENTREGADO' && (
                        <div 
                          className="repartidor-action-btn complete"
                          style={{ 
                            width: '100%', 
                            minHeight: '50px', 
                            fontSize: '1rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}
                        >
                          <FiCheckCircle style={{ fontSize: '1.2rem' }} />
                          Entregado Exitosamente
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery Instructions */}
      <div className="repartidor-instructions">
        <h2>🎯 Instrucciones de Entrega</h2>
        <p>Consejos para una entrega exitosa</p>
        
        <div className="repartidor-instructions-grid">
          <div className="repartidor-instruction-card">
            <div className="repartidor-instruction-item">
              <span>✅ Verificar dirección</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>📞 Confirmar con cliente</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>⚠️ Reportar problemas</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>⏰ Priorizar urgentes</span>
            </div>
          </div>
          
          <div className="repartidor-instruction-card">
            <div className="repartidor-instruction-item">
              <span>🗺️ Optimizar rutas</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>📱 Mantener comunicación</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>⏱️ Respetar tiempos</span>
            </div>
            <div className="repartidor-instruction-item">
              <span>💰 Verificar pagos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepartidorPanel;