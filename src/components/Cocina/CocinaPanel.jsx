import React, { useState } from 'react';
import { 
  FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiPhone, 
  FiMapPin, FiRefreshCw, FiFilter, FiSearch, FiCoffee, FiCheck 
} from 'react-icons/fi';
import './CocinaPanel.css';

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
    <div className="cocina-container">
      {/* Kitchen Header */}
      <div className="cocina-header">
        <div className="cocina-title">
          <h1>🍳 Cocina</h1>
        </div>
        <div className="cocina-actions">
          <button onClick={handleRefresh} disabled={loading} className="cocina-btn cocina-btn-secondary">
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={onBack} className="cocina-btn cocina-btn-ghost">
            <FiArrowLeft />
            Volver
          </button>
        </div>
      </div>

      {/* Kitchen Stats */}
      <div className="cocina-stats">
        <div className={`cocina-stat ${getPedidosUrgentes() > 0 ? 'urgent' : ''}`}>
          <div className="cocina-stat-value">{getPedidosUrgentes()}</div>
          <div className="cocina-stat-label">Urgentes</div>
        </div>
        
        <div className={`cocina-stat ${getPedidosPendientes() > 0 ? 'pending' : ''}`}>
          <div className="cocina-stat-value">{getPedidosPendientes()}</div>
          <div className="cocina-stat-label">Pendientes</div>
        </div>
        
        <div className={`cocina-stat ${getPedidosEnPreparacion() > 0 ? 'preparing' : ''}`}>
          <div className="cocina-stat-value">{getPedidosEnPreparacion()}</div>
          <div className="cocina-stat-label">Preparando</div>
        </div>
        
        <div className={`cocina-stat ${getPedidosListos() > 0 ? 'ready' : ''}`}>
          <div className="cocina-stat-value">{getPedidosListos()}</div>
          <div className="cocina-stat-label">Listos</div>
        </div>
      </div>

      {/* Kitchen Filters */}
      <div className="cocina-filters">
        <div className="cocina-search">
          <FiSearch className="cocina-search-icon" />
          <input
            type="text"
            placeholder="Buscar pedido por nombre, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cocina-filter-buttons">
          <button
            className={`cocina-filter-btn ${filter === 'activos' ? 'active' : ''}`}
            onClick={() => setFilter('activos')}
          >
            🔥 Activos
          </button>
          <button
            className={`cocina-filter-btn ${filter === 'PENDIENTE' ? 'active' : ''}`}
            onClick={() => setFilter('PENDIENTE')}
          >
            ⏳ Pendientes
          </button>
          <button
            className={`cocina-filter-btn ${filter === 'EN_PREPARACION' ? 'active' : ''}`}
            onClick={() => setFilter('EN_PREPARACION')}
          >
            👨‍🍳 Preparando
          </button>
          <button
            className={`cocina-filter-btn ${filter === 'LISTO' ? 'active' : ''}`}
            onClick={() => setFilter('LISTO')}
          >
            ✅ Listos
          </button>
        </div>
      </div>

      {/* Kitchen Orders */}
      <div className="cocina-orders">
        {loading ? (
          <div className="cocina-loading">
            <FiRefreshCw className="cocina-loading-icon" />
            <div>Cargando pedidos...</div>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="cocina-empty">
            <FiCheckCircle className="cocina-empty-icon" />
            <h3>¡Excelente trabajo!</h3>
            <p>No hay pedidos para mostrar</p>
          </div>
        ) : (
          <div className="cocina-orders-grid">
            {pedidosFiltrados.map(pedido => {
              const urgent = isUrgent(pedido.created_at);
              
              return (
                <div key={pedido.id} className={`cocina-order-card ${urgent ? 'urgent' : ''} ${pedido.estado === 'LISTO' ? 'ready' : ''}`}>
                  <div className="cocina-order-header">
                    <div className="cocina-customer-info">
                      <div className="cocina-customer-avatar">
                        {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="cocina-customer-details">
                        <h4>{pedido.nombre || 'Cliente'}</h4>
                        <p>
                          <FiPhone />
                          {pedido.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>
                    <div className="cocina-order-status">
                      {urgent && (
                        <span className="cocina-urgent-badge">
                          <FiAlertCircle />
                          Urgente
                        </span>
                      )}
                      <span className="cocina-time-badge">
                        <FiClock />
                        {formatTime(pedido.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="cocina-order-content">
                    <div className="cocina-order-info">
                      <div className="cocina-order-item">
                        <span className="cocina-order-label">Producto</span>
                        <span className="cocina-order-value">{pedido.producto || 'Producto'}</span>
                      </div>
                      
                      <div className="cocina-order-item">
                        <span className="cocina-order-label">Tipo</span>
                        <span className="cocina-order-value">
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 Domicilio' : '🏪 Retiro'
                          }
                        </span>
                      </div>
                      
                      <div className="cocina-order-item">
                        <span className="cocina-order-label">Precio</span>
                        <span className="cocina-order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="cocina-order-item">
                        <span className="cocina-order-label">Estado</span>
                        <span className="cocina-order-value">
                          {pedido.estado === 'PENDIENTE' && '⏳ Pendiente'}
                          {pedido.estado === 'EN_PREPARACION' && '👨‍🍳 Preparando'}
                          {pedido.estado === 'LISTO' && '✅ Listo'}
                        </span>
                      </div>
                      
                      {pedido.observaciones && (
                        <div className="cocina-order-notes">
                          <span className="cocina-order-label">Notas Especiales</span>
                          <span className="cocina-order-value">{pedido.observaciones}</span>
                        </div>
                      )}
                    </div>

                    <div className="cocina-order-actions">
                      {pedido.estado === 'PENDIENTE' && (
                        <button
                          className="cocina-action-btn prepare"
                          onClick={() => cambiarEstado(pedido.id, 'EN_PREPARACION')}
                        >
                          <FiCoffee />
                          Iniciar Preparación
                        </button>
                      )}
                      {pedido.estado === 'EN_PREPARACION' && (
                        <button
                          className="cocina-action-btn ready"
                          onClick={() => cambiarEstado(pedido.id, 'LISTO')}
                        >
                          <FiCheck />
                          Marcar Listo
                        </button>
                      )}
                      {pedido.estado === 'LISTO' && (
                        <div className="cocina-action-btn complete">
                          <FiCheckCircle />
                          Listo para Entregar
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
    </div>
  );
};

export default CocinaPanel;