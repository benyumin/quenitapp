import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import {
  FiPhone, FiClock, FiFileText, FiChevronRight, FiChevronLeft, FiCheckCircle, FiXCircle, FiInfo, FiUser,
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiCheck, FiX, FiAlertCircle,
  FiShoppingCart, FiSun, FiMoon, FiEdit3, FiTrash2, FiDownload,
  FiBell, FiSettings, FiTrendingUp, FiCalendar, FiGrid, FiList, FiHelpCircle,
  FiHome, FiPackage, FiTruck, FiDollarSign, FiBarChart, FiUsers, FiBox,
  FiPlus, FiTag, FiImage, FiUpload, FiEyeOff, FiStar, FiMapPin, FiZap,
  FiCoffee, FiArrowLeft, FiMenu
} from 'react-icons/fi';

import '../../App.css';
import './styles/AdminPanel.css';
import './styles/AdminSidebar.css';
import logoQuenitas from '../../assets/logoquenitamejorcalidad.jpeg';
import AdminSidebar from './AdminSidebar';
import Notifications from './Notifications';

import CocinaPanel from '../Cocina/CocinaPanel';
import CajaPanel from '../Caja/CajaPanel';
import CajeroPanel from '../Caja/CajeroPanel';
import RepartidorPanel from '../Repartidor/RepartidorPanel';
import CalendarView from '../Orders/CalendarView';

const AdminPanel = ({ onLogout, onBack, setRoute }) => {
  const ESTADOS = [
    { key: 'PENDIENTE', label: 'Pendiente', color: '#FFF9DB', border: '#FFE066', text: '#B59B00', icon: <FiInfo />, bg: '#FFF9DB' },
    { key: 'EN_PREPARACION', label: 'En preparación', color: '#E0F7FA', border: '#4DD0E1', text: '#007C91', icon: <FiClock />, bg: '#E0F7FA' },
    { key: 'LISTO', label: 'Listo', color: '#F3E8FF', border: '#C084FC', text: '#7C3AED', icon: <FiChevronRight />, bg: '#F3E8FF' },
    { key: 'EN_ENTREGA', label: 'En entrega', color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiPhone />, bg: '#FEF3C7' },
    { key: 'ENTREGADO', label: 'Entregado', color: '#E6F9ED', border: '#34D399', text: '#166534', icon: <FiCheckCircle />, bg: '#E6F9ED' },
    { key: 'CANCELADO', label: 'Cancelado', color: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', icon: <FiXCircle />, bg: '#FEF2F2' },
  ];

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [activeSection, setActiveSection] = useState('orders');
  const [viewMode, setViewMode] = useState('cards');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [successButtonId, setSuccessButtonId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin-theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('admin-theme', theme);
    } catch {}
  }, [theme]);

  const getEstadoInfo = (estado) => {
    return ESTADOS.find(e => e.key === estado) || ESTADOS[0];
  };

  const esPedidoDomicilio = (pedido) => {
    if (!pedido.direccion) return false;
    const direccionLower = pedido.direccion.toLowerCase().trim();
    return direccionLower !== '' &&
             direccionLower !== 'retiro en local' &&
             direccionLower !== 'retiro' &&
             direccionLower !== 'local';
  };

  const formatElapsedTime = (createdAt) => {
    if (!createdAt) return 'fecha desconocida';
    const timeElapsed = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    if (timeElapsed < 1) return 'recién';
    if (timeElapsed < 60) return `hace ${timeElapsed} min`;
    if (timeElapsed < 1440) {
      const hours = Math.floor(timeElapsed / 60);
      return `hace ${hours} hr${hours === 1 ? '' : 's'}`;
    }
    const days = Math.floor(timeElapsed / 1440);
    return `hace ${days} día${days === 1 ? '' : 's'}`;
  };

  const isUrgent = (createdAt) => {
    if (!createdAt) return false;
    const timeElapsed = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return timeElapsed > 30;
  };

  const getCustomizationsDisplay = (pedido) => {
    try {
      if (!pedido.personalizacion) return null;
      
      const customizations = JSON.parse(pedido.personalizacion);
      if (!customizations || (Array.isArray(customizations) && customizations.length === 0)) {
        return null;
      }
     
      if (Array.isArray(customizations)) {
        const customizationsList = customizations
          .filter(custom => custom && typeof custom === 'object')
          .map(custom => {
            const selectedItems = Object.entries(custom)
              .filter(([, value]) => value === true)
              .map(([key]) => key);
            return selectedItems.length > 0 ? selectedItems.join(', ') : null;
          })
          .filter(item => item !== null);
        
        return customizationsList.length > 0 ? customizationsList.join(' | ') : null;
      }
      
      if (typeof customizations === 'object') {
        const selectedItems = Object.entries(customizations)
          .filter(([, value]) => value === true)
          .map(([key]) => key);
        return selectedItems.length > 0 ? selectedItems.join(', ') : null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const getStats = useMemo(() => {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => (p.estado || 'PENDIENTE') === 'PENDIENTE').length;
    const enPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION').length;
    const listos = pedidos.filter(p => p.estado === 'LISTO').length;
    const enEntrega = pedidos.filter(p => p.estado === 'EN_ENTREGA').length;
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
    const cancelados = pedidos.filter(p => p.estado === 'CANCELADO').length;
    const domicilio = pedidos.filter(p => esPedidoDomicilio(p)).length;
    const retiro = pedidos.filter(p => !esPedidoDomicilio(p)).length;
    const totalVentas = pedidos
      .filter(p => p.estado !== 'CANCELADO')
      .reduce((sum, p) => sum + (p.precio_total || 0), 0);
    const urgentes = pedidos.filter(p => isUrgent(p.created_at)).length;

    return {
      total, pendientes, enPreparacion, listos, enEntrega, entregados, cancelados,
      domicilio, retiro, totalVentas, urgentes
    };
  }, [pedidos]);

  const getFilteredPedidos = useMemo(() => {
    let filtered = pedidos;

    if (searchTerm) {
      filtered = filtered.filter(pedido => 
        pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.telefono?.includes(searchTerm)
      );
    }

    if (filterEstado !== 'TODOS') {
      filtered = filtered.filter(pedido =>
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }

    return filtered;
  }, [pedidos, searchTerm, filterEstado]);

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);
      
      if (error) throw error;

      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
      ));
      
      let mensajeConfirmacion = '';
      switch (nuevoEstado) {
        case 'EN_PREPARACION':
          mensajeConfirmacion = '✅ Pedido en preparación';
          break;
        case 'LISTO':
          mensajeConfirmacion = '✅ Pedido listo para entrega';
          break;
        case 'EN_ENTREGA':
          mensajeConfirmacion = '✅ Pedido en entrega';
          break;
        case 'ENTREGADO':
          mensajeConfirmacion = '✅ Pedido entregado exitosamente';
          break;
        case 'CANCELADO':
          mensajeConfirmacion = '❌ Pedido cancelado';
          break;
        default:
          mensajeConfirmacion = `Pedido actualizado a ${getEstadoInfo(nuevoEstado).label}`;
      }
      
      addNotification('success', mensajeConfirmacion);
      
      const buttonId = `${pedidoId}-${nuevoEstado}`;
      setSuccessButtonId(buttonId);
      setTimeout(() => setSuccessButtonId(null), 600);
      
      return true;
    } catch (error) {
      addNotification('error', 'Error al actualizar el pedido');
      return false;
    }
  };

  const confirmarCambioEstado = async (pedidoId, nuevoEstado) => {
    const success = await cambiarEstado(pedidoId, nuevoEstado);
    return success;
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Pedidos - Quenitas', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 40);
    doc.text(`Total de pedidos: ${getStats.total}`, 20, 50);
    doc.text(`Ventas totales: $${getStats.totalVentas.toLocaleString()}`, 20, 60);
    
    let y = 80;
    getFilteredPedidos.forEach((pedido, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${pedido.nombre || 'Cliente'}`, 20, y);
      doc.text(`Producto: ${pedido.producto || 'N/A'}`, 20, y + 5);
      doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 20, y + 10);
      doc.text(`Total: $${(pedido.precio_total || 0).toLocaleString()}`, 20, y + 15);
      
      y += 25;
    });
    
    doc.save('reporte-pedidos-quenitas.pdf');
    addNotification('success', 'Reporte PDF generado exitosamente');
  };

  const addNotification = (type, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    setShowNotifications(true);
    
    const isStatusChange = message.includes('✅') || message.includes('❌');
    const duration = isStatusChange ? 5000 : 3000;
    
    setTimeout(() => setShowNotifications(false), duration);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (pedidosError) {
        throw pedidosError;
      }

      setPedidos(pedidosData || []);
    } catch (error) {
      addNotification('error', `Error al cargar los datos: ${error.message}`);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  }, []);
  
  useEffect(() => {
    fetchData();
    
    const subscription = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    addNotification('success', 'Datos actualizados');
  };

  const renderDashboard = () => {
    if (activeSection === 'dashboard') {
      setActiveSection('orders');
      return null;
    }
    return renderOrdersSection();
  };

  const renderOrdersSection = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Gestión de Pedidos</h1>
        <p className="dashboard-subtitle">Administra todos los pedidos del negocio</p>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3 className="filters-title">Filtros</h3>
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, producto, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterEstado === 'TODOS' ? 'active' : ''}`}
            onClick={() => setFilterEstado('TODOS')}
          >
            Todos
          </button>
          {ESTADOS.map(estado => (
            <button
              key={estado.key}
              className={`filter-btn ${filterEstado === estado.key ? 'active' : ''}`}
              onClick={() => setFilterEstado(estado.key)}
            >
              {estado.label}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-section">
        <div className="orders-header">
          <div>
            <h2 className="orders-title">Lista de Pedidos</h2>
            <p className="orders-subtitle">Total: {getFilteredPedidos.length} pedidos</p>
          </div>
          <div className="quick-actions">
            <button onClick={handleRefresh} disabled={isRefreshing} className="btn btn-secondary">
              <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={generarPDF} className="btn btn-primary">
              <FiDownload />
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="orders-grid">
          {getFilteredPedidos.length === 0 ? (
            <div className="empty-state">
              <FiShoppingCart />
              <h3>No hay pedidos</h3>
              <p>No se encontraron pedidos con los filtros actuales.</p>
            </div>
          ) : (
            getFilteredPedidos.map(pedido => {
              const estadoInfo = getEstadoInfo(pedido.estado);
              const customizations = getCustomizationsDisplay(pedido);
              const urgent = isUrgent(pedido.created_at);

              return (
                <div key={pedido.id} className={`order-card ${urgent ? 'urgent' : ''}`}>
                  <div className="order-header">
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="customer-details">
                        <h4>{pedido.nombre || 'Cliente'}</h4>
                        <p>{pedido.telefono || 'Sin teléfono'}</p>
                      </div>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${pedido.estado?.toLowerCase()}`}>
                        {estadoInfo.icon}
                        {estadoInfo.label}
                      </span>
                      {urgent && (
                        <span className="urgent-badge">
                          <FiAlertCircle />
                          Urgente
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="order-content">
                    <div className="order-info">
                      <div className="order-item">
                        <span className="order-item-label">Producto:</span>
                        <span className="order-item-value">{pedido.producto || 'N/A'}</span>
                      </div>
                      {customizations && (
                        <div className="order-item">
                          <span className="order-item-label">Personalizaciones:</span>
                          <span className="order-item-value">{customizations}</span>
                        </div>
                      )}
                      <div className="order-item">
                        <span className="order-item-label">Precio:</span>
                        <span className="order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                      </div>
                      <div className="order-item">
                        <span className="order-item-label">Tipo:</span>
                        <span className="order-item-value">
                          {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro en local'}
                        </span>
                      </div>
                      {pedido.direccion && (
                        <div className="order-item">
                          <span className="order-item-label">Dirección:</span>
                          <span className="order-item-value">{pedido.direccion}</span>
                        </div>
                      )}
                      <div className="order-time">
                        <FiClock />
                        {formatElapsedTime(pedido.created_at)}
                      </div>
                    </div>
                    
                    <div className="order-actions">
                      {pedido.estado === 'PENDIENTE' && (
                        <button
                          className={`order-btn prepare ${successButtonId === `${pedido.id}-EN_PREPARACION` ? 'success-feedback' : ''}`}
                          onClick={() => confirmarCambioEstado(pedido.id, 'EN_PREPARACION')}
                        >
                          <FiClock />
                          Preparar
                        </button>
                      )}
                      {pedido.estado === 'EN_PREPARACION' && (
                        <button
                          className={`order-btn ready ${successButtonId === `${pedido.id}-LISTO` ? 'success-feedback' : ''}`}
                          onClick={() => confirmarCambioEstado(pedido.id, 'LISTO')}
                        >
                          <FiCheck />
                          Listo
                        </button>
                      )}
                      {pedido.estado === 'LISTO' && (
                        <button
                          className={`order-btn deliver ${successButtonId === `${pedido.id}-EN_ENTREGA` ? 'success-feedback' : ''}`}
                          onClick={() => confirmarCambioEstado(pedido.id, 'EN_ENTREGA')}
                        >
                          <FiTruck />
                          Entregar
                        </button>
                      )}
                      {pedido.estado === 'EN_ENTREGA' && (
                        <button
                          className={`order-btn complete ${successButtonId === `${pedido.id}-ENTREGADO` ? 'success-feedback' : ''}`}
                          onClick={() => confirmarCambioEstado(pedido.id, 'ENTREGADO')}
                        >
                          <FiCheckCircle />
                          Completar
                        </button>
                      )}
                      {pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO' && (
                        <button
                          className={`order-btn cancel ${successButtonId === `${pedido.id}-CANCELADO` ? 'success-feedback' : ''}`}
                          onClick={() => confirmarCambioEstado(pedido.id, 'CANCELADO')}
                        >
                          <FiX />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderCocinaSection = () => (
    <CocinaPanel 
      pedidos={pedidos}
      onRefresh={fetchData}
      onCambiarEstado={cambiarEstado}
    />
  );

  const renderCajaSection = () => (
    <CajaPanel />
  );

  const renderCajeroSection = () => (
    <CajeroPanel />
  );

  const renderRepartidorSection = () => (
    <RepartidorPanel 
      pedidos={pedidos}
      onRefresh={fetchData}
      onCambiarEstado={cambiarEstado}
    />
  );

  const renderCalendarioSection = () => (
    <CalendarView />
  );

  const renderHistorialSection = () => {
    const historialPedidos = pedidos.filter(p => 
      p.estado === 'ENTREGADO' || p.estado === 'CANCELADO'
    );

    const getStatsHistorial = () => {
      const entregados = historialPedidos.filter(p => p.estado === 'ENTREGADO').length;
      const cancelados = historialPedidos.filter(p => p.estado === 'CANCELADO').length;
      const totalVentas = historialPedidos
        .filter(p => p.estado === 'ENTREGADO')
        .reduce((sum, p) => sum + (p.precio_total || 0), 0);
      
      return { entregados, cancelados, totalVentas };
    };

    const stats = getStatsHistorial();

    return (
      <div className="historial-container">
        <div className="historial-header">
          <h1 className="historial-title">Historial de Pedidos</h1>
          <p className="historial-subtitle">Maneja el historial de pedidos entregados y cancelados</p>
        </div>

        <div className="historial-stats">
          <div className="historial-stat-card">
            <div className="historial-stat-icon">
              <FiCheckCircle />
            </div>
            <div className="historial-stat-content">
              <div className="historial-stat-value">{stats.entregados}</div>
              <div className="historial-stat-label">Entregados</div>
            </div>
          </div>
          
          <div className="historial-stat-card">
            <div className="historial-stat-icon">
              <FiXCircle />
            </div>
            <div className="historial-stat-content">
              <div className="historial-stat-value">{stats.cancelados}</div>
              <div className="historial-stat-label">Cancelados</div>
            </div>
          </div>
          
          <div className="historial-stat-card">
            <div className="historial-stat-icon">
              <FiDollarSign />
            </div>
            <div className="historial-stat-content">
              <div className="historial-stat-value">${stats.totalVentas.toLocaleString()}</div>
              <div className="historial-stat-label">Total Ventas</div>
            </div>
          </div>
        </div>

        <div className="historial-filters">
          <div className="historial-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="historial-filter-buttons">
            <button
              className={`historial-filter-btn ${filterEstado === 'TODOS' ? 'active' : ''}`}
              onClick={() => setFilterEstado('TODOS')}
            >
              Todos
            </button>
            <button
              className={`historial-filter-btn ${filterEstado === 'ENTREGADO' ? 'active' : ''}`}
              onClick={() => setFilterEstado('ENTREGADO')}
            >
              Entregados
            </button>
            <button
              className={`historial-filter-btn ${filterEstado === 'CANCELADO' ? 'active' : ''}`}
              onClick={() => setFilterEstado('CANCELADO')}
            >
              Cancelados
            </button>
          </div>
        </div>

        {/* Lista de pedidos históricos */}
        <div className="historial-orders">
          <div className="historial-orders-header">
            <h2>Pedidos Históricos</h2>
            <p>Total: {historialPedidos.length} pedidos</p>
          </div>
          
          <div className="historial-orders-grid">
            {historialPedidos.length === 0 ? (
              <div className="historial-empty">
                <FiFileText />
                <h3>No hay pedidos históricos</h3>
                <p>No se encontraron pedidos entregados o cancelados.</p>
              </div>
            ) : (
              historialPedidos.map(pedido => {
                const estadoInfo = getEstadoInfo(pedido.estado);
                const customizations = getCustomizationsDisplay(pedido);

                return (
                  <div key={pedido.id} className={`historial-order-card ${pedido.estado.toLowerCase()}`}>
                    <div className="historial-order-header">
                      <div className="historial-customer-info">
                        <div className="historial-customer-avatar">
                          {pedido.nombre?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="historial-customer-details">
                          <h4>{pedido.nombre || 'Cliente'}</h4>
                          <p>{pedido.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>
                      <div className="historial-order-status">
                        <span className={`historial-status-badge ${pedido.estado?.toLowerCase()}`}>
                          {estadoInfo.icon}
                          {estadoInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="historial-order-content">
                      <div className="historial-order-info">
                        <div className="historial-order-item">
                          <span className="historial-order-label">Producto:</span>
                          <span className="historial-order-value">{pedido.producto || 'N/A'}</span>
                        </div>
                        {customizations && (
                          <div className="historial-order-item">
                            <span className="historial-order-label">Personalizaciones:</span>
                            <span className="historial-order-value">{customizations}</span>
                          </div>
                        )}
                        <div className="historial-order-item">
                          <span className="historial-order-label">Precio:</span>
                          <span className="historial-order-price">${(pedido.precio_total || 0).toLocaleString()}</span>
                        </div>
                        <div className="historial-order-item">
                          <span className="historial-order-label">Tipo:</span>
                          <span className="historial-order-value">
                            {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro en local'}
                          </span>
                        </div>
                        {pedido.direccion && (
                          <div className="historial-order-item">
                            <span className="historial-order-label">Dirección:</span>
                            <span className="historial-order-value">{pedido.direccion}</span>
                          </div>
                        )}
                        <div className="historial-order-time">
                          <FiClock />
                          {formatElapsedTime(pedido.created_at)}
                        </div>
                      </div>
                      
                      <div className="historial-order-actions">
                        <button className="historial-action-btn">
                          <FiDownload />
                          Generar Boleta
                        </button>
                        <button className="historial-action-btn">
                          <FiEye />
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper para obtener título de sección
  const getSectionTitle = (section) => {
    switch (section) {
      case 'orders': return 'Gestión de Pedidos';
      case 'cocina': return 'Gestión de Cocina';
      case 'caja': return 'Gestión de Caja';
      case 'cajero': return 'Gestión de Cajero';
      case 'repartidor': return 'Gestión de Repartidor';
      case 'calendario': return 'Calendario de Pedidos';
      case 'historial': return 'Historial de Pedidos';
      default: return 'Gestión de Pedidos';
    }
  };

  const getSectionDescription = (section) => {
    switch (section) {
      case 'orders': return 'Administra todos los pedidos del negocio, incluyendo búsqueda, filtrado y gestión de estados.';
      case 'cocina': return 'Supervisa y gestiona el proceso de preparación de pedidos en la cocina.';
      case 'caja': return 'Registra y gestiona todas las transacciones financieras del negocio.';
      case 'cajero': return 'Administra el flujo de efectivo y el manejo de pagos.';
      case 'repartidor': return 'Gestiona la distribución y entrega de pedidos a los clientes.';
      case 'calendario': return 'Visualiza el calendario de pedidos y sus estados en el tiempo.';
      case 'historial': return 'Maneja el historial de pedidos entregados y cancelados, incluyendo la generación de boletas y comprobantes.';
      default: return 'Administra todos los pedidos del negocio, incluyendo búsqueda, filtrado y gestión de estados.';
    }
  };

  // Renderizar contenido de sección
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'orders':
        return renderOrdersSection();
      case 'cocina':
        return renderCocinaSection();
      case 'caja':
        return renderCajaSection();
      case 'cajero':
        return renderCajeroSection();
      case 'repartidor':
        return renderRepartidorSection();
      case 'calendario':
        return renderCalendarioSection();
      case 'historial':
        return renderHistorialSection();
      default:
        return renderOrdersSection();
    }
  };

  return (
    <div className={`admin-layout ${theme}`}>
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onLogout}
          onBack={onBack}
          collapsed={sidebarCollapsed}
        />
      </div>
      
      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <div className="header-left">
            <button 
              className="btn btn-ghost"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <FiMenu />
            </button>
            <div className="page-info">
              <h1>{getSectionTitle(activeSection)}</h1>
              <p>{getSectionDescription(activeSection)}</p>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-ghost"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button className="btn btn-ghost">
              <FiBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="admin-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            renderSectionContent()
          )}
        </div>
      </div>
      
      {/* Notifications */}
      <Notifications 
        notifications={showNotifications ? notifications : []}
        onClose={(id) => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />
    </div>
  );
};

export default AdminPanel; 