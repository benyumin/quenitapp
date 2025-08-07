import React, { useState } from 'react';
import { 
  FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiPhone, 
  FiMapPin, FiRefreshCw, FiFilter, FiSearch, FiCoffee, FiCheck 
} from 'react-icons/fi';

const CocinaPanel = ({ onBack, setRoute, pedidos = [], onRefresh, onCambiarEstado }) => {
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
        p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION' || p.estado === 'LISTO'
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
        p.telefono?.includes(term)
      );
    }

    return pedidosFiltrados.sort((a, b) => {
      // Priorizar por urgencia (tiempo transcurrido)
      const timeA = new Date() - new Date(a.created_at);
      const timeB = new Date() - new Date(b.created_at);
      return timeB - timeA;
    });
  };

  const getPedidosPendientes = () => pedidos.filter(p => p.estado === 'PENDIENTE').length;
  const getPedidosEnPreparacion = () => pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
  const getPedidosListos = () => pedidos.filter(p => p.estado === 'LISTO').length;
  const getPedidosUrgentes = () => {
    const now = new Date();
    return pedidos.filter(p => {
      const elapsed = Math.floor((now - new Date(p.created_at)) / 60000);
      return elapsed > 30 && (p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION');
    }).length;
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
    return diffMinutes > 30;
  };

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="admin-layout" style={{backgroundColor: 'var(--chef-bg-main)'}}>
      {/* Chef-Friendly Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="page-info">
            <h1>🍳 COCINA</h1>
            <p>Panel de preparación de pedidos</p>
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
        {/* Chef Stats - Large and Clear */}
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
          
          <div className={`chef-stat-card ${getPedidosPendientes() > 0 ? 'pending' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosPendientes() > 0 ? 'pending' : 'info'}`}>
              <FiClock />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosPendientes()}</h3>
              <p>PENDIENTES</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosEnPreparacion() > 0 ? 'urgent' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosEnPreparacion() > 0 ? 'urgent' : 'info'}`}>
              <FiCoffee />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosEnPreparacion()}</h3>
              <p>PREPARANDO</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
              <FiCheckCircle />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosListos()}</h3>
              <p>LISTOS</p>
            </div>
          </div>
        </div>

        {/* Large Filter Buttons */}
        <div className="chef-filter-section">
          <div className="chef-filter-buttons">
            <button
              className={`chef-filter-btn ${filter === 'activos' ? 'active' : ''}`}
              onClick={() => setFilter('activos')}
            >
              🔥 ACTIVOS
            </button>
            <button
              className={`chef-filter-btn ${filter === 'PENDIENTE' ? 'active' : ''}`}
              onClick={() => setFilter('PENDIENTE')}
            >
              ⏳ PENDIENTES
            </button>
            <button
              className={`chef-filter-btn ${filter === 'EN_PREPARACION' ? 'active' : ''}`}
              onClick={() => setFilter('EN_PREPARACION')}
            >
              👨‍🍳 PREPARANDO
            </button>
            <button
              className={`chef-filter-btn ${filter === 'LISTO' ? 'active' : ''}`}
              onClick={() => setFilter('LISTO')}
            >
              ✅ LISTOS
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

        {/* Chef Orders Grid */}
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
            <FiCoffee />
            ÓRDENES DE COCINA ({pedidosFiltrados.length})
          </h2>
          
          {loading ? (
            <div className="chef-empty-state">
              <h3>🔄 Cargando...</h3>
              <p>Actualizando pedidos</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="chef-empty-state">
              <h3>🎉 ¡Excelente trabajo!</h3>
              <p>No hay pedidos para mostrar</p>
            </div>
          ) : (
            <div className="chef-orders-grid">
              {pedidosFiltrados.map(pedido => {
                const urgent = isUrgent(pedido.created_at);
                
                return (
                  <div key={pedido.id} className={`chef-order-card ${urgent ? 'urgent' : ''} ${pedido.estado === 'LISTO' ? 'ready' : ''}`}>
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
                        padding: 'var(--chef-space-sm)',
                        background: 'var(--chef-bg-info)',
                        borderRadius: 'var(--chef-radius-sm)'
                      }}>
                        <span style={{
                          fontSize: 'var(--chef-text-md)', 
                          fontWeight: '700', 
                          color: 'var(--color-text-subtle)'
                        }}>
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 DOMICILIO' : '🏪 RETIRO'
                          }
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

                    <div className="chef-order-actions">
                      {pedido.estado === 'PENDIENTE' && (
                        <button
                          className="chef-order-btn prepare"
                          onClick={() => cambiarEstado(pedido.id, 'EN_PREPARACION')}
                        >
                          <FiCoffee />
                          INICIAR PREPARACIÓN
                        </button>
                      )}
                      {pedido.estado === 'EN_PREPARACION' && (
                        <button
                          className="chef-order-btn ready"
                          onClick={() => cambiarEstado(pedido.id, 'LISTO')}
                        >
                          <FiCheck />
                          MARCAR LISTO
                        </button>
                      )}
                      {pedido.estado === 'LISTO' && (
                        <div className="chef-ready-indicator">
                          <FiCheckCircle />
                          <span>LISTO PARA ENTREGAR</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CocinaPanel;