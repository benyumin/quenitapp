import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiDollarSign, FiCheckCircle, FiTruck, FiClock, FiUser, 
  FiPhone, FiMapPin, FiRefreshCw, FiSearch, FiCreditCard, FiShoppingBag
} from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const CajaPanel = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('activos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
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

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error updating estado:', error);
      alert('Error al cambiar el estado del pedido');
    }
  };

  const filtrarPedidos = () => {
    let pedidosFiltrados = pedidos;

    // Filtrar por estado
    if (filter === 'activos') {
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        ['LISTO', 'PAGADO', 'EN_ENTREGA'].includes(p.estado)
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
      // Priorizar por estado: LISTO -> PAGADO -> EN_ENTREGA
      const priority = { 'LISTO': 3, 'PAGADO': 2, 'EN_ENTREGA': 1 };
      return (priority[b.estado] || 0) - (priority[a.estado] || 0);
    });
  };

  const getPedidosListos = () => pedidos.filter(p => p.estado === 'LISTO').length;
  const getPedidosPagados = () => pedidos.filter(p => p.estado === 'PAGADO').length;
  const getPedidosEnEntrega = () => pedidos.filter(p => p.estado === 'EN_ENTREGA').length;
  const getTotalVentasHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return pedidos
      .filter(p => {
        const fechaPedido = new Date(p.created_at).toISOString().split('T')[0];
        return fechaPedido === hoy && ['PAGADO', 'ENTREGADO'].includes(p.estado);
      })
      .reduce((total, p) => total + (p.precio_total || 0), 0);
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

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="admin-layout" style={{backgroundColor: 'var(--chef-bg-main)'}}>
      {/* Cashier Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="page-info">
            <h1>💰 CAJA</h1>
            <p>Panel de pagos y entregas</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={fetchPedidos} disabled={loading} className="chef-action-btn">
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
        {/* Cashier Stats */}
        <div className="chef-stats-grid">
          <div className={`chef-stat-card ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosListos() > 0 ? 'ready' : 'info'}`}>
              <FiShoppingBag />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosListos()}</h3>
              <p>LISTOS PARA COBRAR</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosPagados() > 0 ? 'pending' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosPagados() > 0 ? 'pending' : 'info'}`}>
              <FiCreditCard />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosPagados()}</h3>
              <p>PAGADOS</p>
            </div>
          </div>
          
          <div className={`chef-stat-card ${getPedidosEnEntrega() > 0 ? 'urgent' : 'info'}`}>
            <div className={`chef-stat-icon ${getPedidosEnEntrega() > 0 ? 'urgent' : 'info'}`}>
              <FiTruck />
            </div>
            <div className="chef-stat-content">
              <h3>{getPedidosEnEntrega()}</h3>
              <p>EN ENTREGA</p>
            </div>
          </div>
          
          <div className="chef-stat-card info">
            <div className="chef-stat-icon info">
              <FiDollarSign />
            </div>
            <div className="chef-stat-content">
              <h3>${getTotalVentasHoy().toLocaleString()}</h3>
              <p>VENTAS HOY</p>
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
              💰 LISTOS PARA COBRAR
            </button>
            <button
              className={`chef-filter-btn ${filter === 'PAGADO' ? 'active' : ''}`}
              onClick={() => setFilter('PAGADO')}
            >
              💳 PAGADOS
            </button>
            <button
              className={`chef-filter-btn ${filter === 'EN_ENTREGA' ? 'active' : ''}`}
              onClick={() => setFilter('EN_ENTREGA')}
            >
              🚚 EN ENTREGA
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
            <FiDollarSign />
            PEDIDOS DE CAJA ({pedidosFiltrados.length})
          </h2>
          
          {loading ? (
            <div className="chef-empty-state">
              <h3>🔄 Cargando...</h3>
              <p>Actualizando pedidos</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="chef-empty-state">
              <h3>📋 No hay pedidos</h3>
              <p>No se encontraron pedidos para caja</p>
            </div>
          ) : (
            <div className="chef-orders-grid">
              {pedidosFiltrados.map(pedido => {
                return (
                  <div key={pedido.id} className={`chef-order-card ${pedido.estado === 'LISTO' ? 'ready' : ''}`}>
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
                        <span className={`chef-status-badge ${pedido.estado?.toLowerCase()}`}>
                          {pedido.estado === 'LISTO' && '💰'}
                          {pedido.estado === 'PAGADO' && '💳'}
                          {pedido.estado === 'EN_ENTREGA' && '🚚'}
                          {pedido.estado}
                        </span>
                        <span className="chef-time-badge">
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
                      
                      <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: 'var(--chef-space-md)',
                        padding: 'var(--chef-space-md)',
                        background: 'var(--chef-bg-success)',
                        borderRadius: 'var(--chef-radius-md)',
                        border: '2px solid var(--chef-green)'
                      }}>
                        <span style={{
                          fontSize: 'var(--chef-text-md)', 
                          fontWeight: '700', 
                          color: 'var(--chef-green)'
                        }}>
                          {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' ? 
                            '🚚 DOMICILIO' : '🏪 RETIRO'
                          }
                        </span>
                        <span style={{
                          fontSize: 'var(--chef-text-xl)', 
                          fontWeight: '900', 
                          color: 'var(--chef-green)'
                        }}>
                          ${(pedido.precio_total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="chef-order-actions">
                      {pedido.estado === 'LISTO' && (
                        <div style={{display: 'flex', gap: 'var(--chef-space-sm)'}}>
                          <button
                            className="chef-order-btn prepare"
                            onClick={() => cambiarEstado(pedido.id, 'PAGADO')}
                            style={{flex: 1}}
                          >
                            <FiDollarSign />
                            COBRAR
                          </button>
                          <button
                            className="chef-order-btn complete"
                            onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                            style={{flex: 1}}
                          >
                            <FiTruck />
                            ENTREGAR
                          </button>
                        </div>
                      )}
                      {pedido.estado === 'PAGADO' && (
                        <button
                          className="chef-order-btn complete"
                          onClick={() => cambiarEstado(pedido.id, 'EN_ENTREGA')}
                        >
                          <FiTruck />
                          ENVIAR A ENTREGA
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
                    </div>

                    {pedido.direccion && pedido.direccion.toLowerCase() !== 'retiro en local' && (
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
      </div>
    </div>
  );
};

export default CajaPanel;