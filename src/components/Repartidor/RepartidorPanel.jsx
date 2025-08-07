import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiArrowLeft, FiTruck, FiCheckCircle, FiMapPin, FiClock, FiUser, FiPhone, 
  FiNavigation, FiAlertCircle, FiPackage, FiDollarSign, FiRefreshCw, 
  FiSearch, FiMessageSquare, FiNavigation2, FiTarget
} from 'react-icons/fi';

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
      // Priorizar por urgencia
      const now = new Date();
      const timeA = Math.floor((now - new Date(a.created_at)) / 60000);
      const timeB = Math.floor((now - new Date(b.created_at)) / 60000);
      
      if (timeA > 45 && timeB <= 45) return -1;
      if (timeB > 45 && timeA <= 45) return 1;
      
      // Luego por estado: EN_ENTREGA primero
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
    <div className="admin-layout" style={{backgroundColor: 'var(--chef-bg-main)'}}>
      {/* Delivery Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="page-info">
            <h1>🚚 REPARTIDOR</h1>
            <p>Panel de entregas y rutas</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} disabled={loading} className="chef-action-btn">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
          </button>
          <button onClick={onBack} className="chef-action-btn danger">
            <FiArrowLeft />
            VOLVER
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Delivery Stats */}
        <div className="chef-stats-grid">
          <div className={`chef-stat-card ${getPedidosUrgentes() > 0 ? 'urgent' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosUrgentes() > 0 ? 'urgent' : 'info'}`}>
              <FiAlertCircle />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosUrgentes()}</h3>
              <p>URGENTES</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
              <FiPackage />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosListos()}</h3>
              <p>LISTOS PARA ENTREGAR</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosEnEntrega() > 0 ? 'pending' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosEnEntrega() > 0 ? 'pending' : 'info'}`}>
              <FiTruck />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosEnEntrega()}</h3>
              <p>EN ENTREGA</p>
            </div>
          </div>
          
          <div className="chef-stat-card info">
            <div className="chef-stat-icon info">
              <FiCheckCircle />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosEntregadosHoy()}</h3>
              <p>ENTREGADOS HOY</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="chef-filter-section">
          <div className="chef-filter-buttons">
            <button
              className={`chef-filter-btn ${filter === 'activos' ? 'active' : ''}`}
              onClick={() => setFilter('activos')}
            >
              🔥 ACTIVOS
            </button>
            <button
              className={`chef-filter-btn ${filter === 'LISTO' ? 'active' : ''}`}
              onClick={() => setFilter('LISTO')}
            >
              📦 LISTOS
            </button>
            <button
              className={`chef-filter-btn ${filter === 'EN_ENTREGA' ? 'active' : ''}`}
              onClick={() => setFilter('EN_ENTREGA')}
            >
              🚚 EN ENTREGA
            </button>
            <button
              className={`chef-filter-btn ${filter === 'ENTREGADO' ? 'active' : ''}`}
              onClick={() => setFilter('ENTREGADO')}
            >
              ✅ ENTREGADOS
            </button>
          </div>
          
          <div className="chef-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Section */}
        <div className="chef-orders-section">
          <h2 style={{
            fontSize: 'var(--chef-text-xl)', 
            fontWeight: '900', 
            marginBottom: 'var(--chef-space-lg)', 
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--chef-space-sm)'
          }}>
            <FiTruck />
            ENTREGAS ({pedidosFiltrados.length})
          </h2>
          
          {loading ? (
            <div className="chef-empty-state">
              <h3>🔄 Cargando...</h3>
              <p>Actualizando entregas</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="chef-empty-state">
              <h3>🚚 No hay entregas</h3>
              <p>No se encontraron entregas para mostrar</p>
            </div>
          ) : (
            <div className="chef-orders-grid">
              {pedidosFiltrados.map(pedido => {
                const urgent = isUrgent(pedido.created_at);
                const esDomicilio = esPedidoDomicilio(pedido);
                
                return (
                  <div key={pedido.id} className={`chef-order-card ${urgent ? 'urgent' : ''} ${pedido.estado === 'EN_ENTREGA' ? 'ready' : ''}`}>
                    <div className="chef-order-header">
                      <div className="chef-customer-info">
                        <div className="chef-customer-avatar">
                          {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="chef-customer-details">
                          <h4>{pedido.nombre || 'Cliente'}</h4>
                          <p>
                            <FiPhone />
                            {pedido.telefono || 'Sin teléfono'}
                          </p>
                        </div>
                      </div>
                      <div className="chef-order-status">
                        {urgent && (
                          <span className="chef-time-badge urgent">
                            <FiAlertCircle />
                            URGENTE
                          </span>
                        )}
                        <span className={`chef-time-badge ${urgent ? 'urgent' : ''}`}>
                          <FiClock />
                          {formatTime(pedido.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="chef-order-info">
                      <div className="chef-order-items">
                        <div className="chef-order-item">
                          <span className="chef-item-name">{pedido.producto || 'Producto'}</span>
                          <span className="chef-item-quantity">1</span>
                        </div>
                      </div>
                      
                      {pedido.observaciones && (
                        <div className="chef-order-notes">
                          <strong>📝 NOTAS:</strong>
                          <p>{pedido.observaciones}</p>
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: 'var(--chef-space-md)',
                        padding: 'var(--chef-space-md)',
                        background: 'var(--chef-bg-info)',
                        borderRadius: 'var(--chef-radius-md)',
                        border: '2px solid var(--chef-blue)'
                      }}>
                        <span style={{
                          fontSize: 'var(--chef-text-md)', 
                          fontWeight: '700', 
                          color: 'var(--chef-blue)'
                        }}>
                          🚚 DOMICILIO
                        </span>
                        <span style={{
                          fontSize: 'var(--chef-text-lg)', 
                          fontWeight: '800', 
                          color: 'var(--chef-blue)'
                        }}>
                          ${(pedido.precio_total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="chef-contact-actions">
                      <button
                        onClick={() => llamarCliente(pedido.telefono)}
                        className="chef-contact-btn call"
                      >
                        <FiPhone />
                        LLAMAR
                      </button>
                      <button
                        onClick={() => enviarWhatsApp(pedido.telefono)}
                        className="chef-contact-btn whatsapp"
                      >
                        <FiMessageSquare />
                        WHATSAPP
                      </button>
                      <button
                        onClick={() => abrirMaps(pedido.direccion)}
                        className="chef-contact-btn maps"
                      >
                        <FiMapPin />
                        VER MAPA
                      </button>
                    </div>

                    <div className="chef-order-actions">
                      {pedido.estado === 'LISTO' && esDomicilio && (
                        <button
                          className="chef-order-btn prepare"
                          onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                        >
                          <FiTruck />
                          INICIAR ENTREGA
                        </button>
                      )}
                      {pedido.estado === 'EN_ENTREGA' && (
                        <button
                          className="chef-order-btn ready"
                          onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
                        >
                          <FiCheckCircle />
                          MARCAR ENTREGADO
                        </button>
                      )}
                      {pedido.estado === 'ENTREGADO' && (
                        <div className="chef-ready-indicator">
                          <FiCheckCircle />
                          <span>ENTREGADO EXITOSAMENTE</span>
                        </div>
                      )}
                    </div>

                    {esDomicilio && pedido.direccion && (
                      <div className="chef-delivery-address">
                        <FiMapPin />
                        <span>{pedido.direccion}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Tips */}
        <div className="chef-tips-section">
          <div className="chef-tips-grid">
            <div className="chef-tip-card">
              <h3>🎯 INSTRUCCIONES</h3>
              <ul>
                <li>✅ Verificar dirección</li>
                <li>📞 Confirmar con cliente</li>
                <li>⚠️ Reportar problemas</li>
                <li>⏰ Priorizar urgentes</li>
              </ul>
            </div>
            <div className="chef-tip-card">
              <h3>🚀 CONSEJOS</h3>
              <ul>
                <li>🗺️ Optimizar rutas</li>
                <li>📱 Mantener comunicación</li>
                <li>⏱️ Respetar tiempos</li>
                <li>💰 Verificar pagos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepartidorPanel;