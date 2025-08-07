import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiUser, FiMapPin,
  FiDollarSign, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiInfo,
  FiFilter, FiSearch, FiRefreshCw, FiDownload, FiEye, FiEyeOff,
  FiCoffee, FiShoppingCart, FiUserPlus, FiSun, FiMoon, FiGrid, FiList
} from 'react-icons/fi';

import './CalendarView.css';
import logoQuenitas from '../../assets/logoquenitamejorcalidad.jpeg';
import jsPDF from 'jspdf';

const ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#FFF9DB', border: '#FFE066', text: '#B59B00', icon: <FiInfo /> },
  { key: 'EN_PREPARACION', label: 'En preparación', color: '#E0F7FA', border: '#4DD0E1', text: '#007C91', icon: <FiClock /> },
  { key: 'LISTO', label: 'Listo', color: '#F3E8FF', border: '#C084FC', text: '#7C3AED', icon: <FiPackage /> },
  { key: 'EN_ENTREGA', label: 'En entrega', color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiTruck /> },
  { key: 'ENTREGADO', label: 'Entregado', color: '#E6F9ED', border: '#34D399', text: '#166534', icon: <FiCheckCircle /> },
  { key: 'CANCELADO', label: 'Cancelado', color: '#FFE5E5', border: '#F87171', text: '#B91C1C', icon: <FiXCircle /> },
];

const esPedidoDomicilio = (pedido) => {
  return pedido.direccion && pedido.direccion.trim() !== '' && 
         pedido.direccion.toLowerCase() !== 'retiro en local' &&
         pedido.direccion.toLowerCase() !== 'retiro' &&
         pedido.direccion.toLowerCase() !== 'local';
};

const getEstadoInfo = (key) => ESTADOS.find(e => e.key === key) || ESTADOS[0];

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'  
  });
};

const getMonth = (date) => {
  return new Date(date).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
};

const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days = [];
  
  // Días del mes anterior
  for (let i = startingDay - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const today = new Date();
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === today.toDateString()
    });
  }
  
  // Días del siguiente mes para completar la última semana
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day);
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  return days;
};

const CalendarView = ({ onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [showStats, setShowStats] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('quenitas-dark', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      setSelectedDate(newDate);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      setSelectedDate(newDate);
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getPedidosForDate = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return pedidos.filter(pedido => {
      const pedidoDate = new Date(pedido.created_at);
      return pedidoDate >= startOfDay && pedidoDate <= endOfDay;
    });
  };

  const getStatsForDate = (date) => {
    const pedidosDelDia = getPedidosForDate(date);
    
    // Filtrar solo pedidos que NO están cancelados (ventas reales)
    const ventasReales = pedidosDelDia.filter(p => p.estado !== 'CANCELADO');
    
    return {
      total: ventasReales.length, // Solo ventas reales, no canceladas
      pendientes: ventasReales.filter(p => (p.estado || 'PENDIENTE') === 'PENDIENTE').length,
      enPreparacion: ventasReales.filter(p => p.estado === 'EN_PREPARACION').length,
      listos: ventasReales.filter(p => p.estado === 'LISTO').length,
      enEntrega: ventasReales.filter(p => p.estado === 'EN_ENTREGA').length,
      entregados: ventasReales.filter(p => p.estado === 'ENTREGADO').length,
      cancelados: pedidosDelDia.filter(p => p.estado === 'CANCELADO').length, // Solo para mostrar cuántos se cancelaron
      domicilio: ventasReales.filter(p => esPedidoDomicilio(p)).length,
      retiro: ventasReales.filter(p => !esPedidoDomicilio(p)).length,
      totalVentas: ventasReales.reduce((sum, p) => sum + (p.precio_total || 0), 0) // Solo ventas reales
    };
  };

  const getFilteredPedidosForDate = (date) => {
    let pedidosDelDia = getPedidosForDate(date);
    
    if (searchTerm) {
      pedidosDelDia = pedidosDelDia.filter(pedido => 
        pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterEstado !== 'TODOS') {
      pedidosDelDia = pedidosDelDia.filter(pedido => 
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }
    
    return pedidosDelDia;
  };

  const getFilteredAllPedidos = () => {
    let pedidosFiltrados = pedidos;
    
    if (searchTerm) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterEstado !== 'TODOS') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }
    
    return pedidosFiltrados;
  };

  // Función para obtener estadísticas de todos los pedidos (modo lista)
  const getStatsForAllPedidos = () => {
    // Filtrar solo pedidos que NO están cancelados (ventas reales)
    const ventasReales = pedidos.filter(p => p.estado !== 'CANCELADO');
    
    return {
      total: ventasReales.length, // Solo ventas reales, no canceladas
      pendientes: ventasReales.filter(p => (p.estado || 'PENDIENTE') === 'PENDIENTE').length,
      enPreparacion: ventasReales.filter(p => p.estado === 'EN_PREPARACION').length,
      listos: ventasReales.filter(p => p.estado === 'LISTO').length,
      enEntrega: ventasReales.filter(p => p.estado === 'EN_ENTREGA').length,
      entregados: ventasReales.filter(p => p.estado === 'ENTREGADO').length,
      cancelados: pedidos.filter(p => p.estado === 'CANCELADO').length, // Solo para mostrar cuántos se cancelaron
      domicilio: ventasReales.filter(p => esPedidoDomicilio(p)).length,
      retiro: ventasReales.filter(p => !esPedidoDomicilio(p)).length,
      totalVentas: ventasReales.reduce((sum, p) => sum + (p.precio_total || 0), 0) // Solo ventas reales
    };
  };

  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const selectedDateStats = viewMode === 'calendar' ? getStatsForDate(selectedDate) : getStatsForAllPedidos();
  const filteredPedidos = viewMode === 'calendar' ? getFilteredPedidosForDate(selectedDate) : getFilteredAllPedidos();

  return (
    <div className="calendar-container">
      {/* Header Mejorado */}
      <header className="calendar-header">
        <div className="calendar-header-content">
          <div className="calendar-title">
            <div className="calendar-icon">
              <FiCalendar style={{fontSize: '1.2rem', color: '#fff'}}/>
            </div>
            <h1>Calendario de Pedidos</h1>
          </div>
          
          <div className="calendar-actions">
            <button 
              onClick={toggleDarkMode} 
              className="calendar-btn"
            >
              {darkMode ? <FiMoon/> : <FiSun/>}
            </button>
            <button 
              onClick={onBack} 
              className="calendar-back-btn"
            >
              ← Volver
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="calendar-main-content">
        {loading ? (
          <div className="calendar-loading">
            <FiRefreshCw className="calendar-loading-icon"/>
            <div style={{marginTop: '16px'}}>Cargando pedidos...</div>
          </div>
        ) : (
          <div className="calendar-content">
            
            {/* Navegación del Calendario */}
            <div className="calendar-navigation">
              <button 
                onClick={goToPreviousMonth}
                aria-label="Mes anterior"
                className="calendar-nav-btn"
              >
                <FiChevronLeft size={24} />
              </button>
              
              <h2 className="calendar-month-title">
                {getMonth(currentDate)}
              </h2>
              
              <button 
                onClick={goToNextMonth}
                aria-label="Mes siguiente"
                className="calendar-nav-btn"
              >
                <FiChevronRight size={24} />
              </button>
              
              <button 
                onClick={goToToday}
                aria-label="Ir a hoy"
                className="calendar-today-btn"
              >
                Hoy
              </button>
            </div>

            {/* Filtros Mejorados */}
            <div className="calendar-filters">
              {/* Modo de vista */}
              <div className="calendar-view-mode">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`calendar-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                >
                  <FiGrid size={18} />
                  Calendario
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`calendar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <FiList size={18} />
                  Lista
                </button>
              </div>

              {/* Búsqueda y filtros */}
              <div className="calendar-search-filters">
                <div className="calendar-search-container">
                  <FiSearch className="calendar-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar pedidos por nombre, producto o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="calendar-search-input"
                  />
                </div>
                
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="calendar-filter-select"
                >
                  <option value="TODOS">Todos los estados</option>
                  {ESTADOS.map(estado => (
                    <option key={estado.key} value={estado.key}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vista de Calendario Mejorada */}
            {viewMode === 'calendar' && (
              <div className="calendar-grid">
                {/* Días de la semana */}
                <div className="calendar-weekdays">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="calendar-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del calendario */}
                <div className="calendar-days">
                  {calendarDays.map((day, index) => {
                    const dayStats = getStatsForDate(day.date);
                    const isSelected = day.date.toDateString() === selectedDate.toDateString();
                    const hasPedidos = dayStats.total > 0;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (day.isCurrentMonth) {
                            setSelectedDate(day.date);
                          }
                        }}
                        className={`calendar-day ${day.isCurrentMonth ? 'current-month' : ''} ${isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${hasPedidos ? 'has-orders' : ''}`}
                      >
                        {/* Número del día */}
                        <div className="calendar-day-number">
                          {day.date.getDate()}
                        </div>
                        
                        {/* Badge de pedidos */}
                        {hasPedidos && (
                          <div className={`calendar-day-badge ${isSelected ? 'selected' : ''}`}>
                            {dayStats.total}
                          </div>
                        )}
                        
                        {/* Indicador de "Hoy" */}
                        {day.isToday && (
                          <div className="calendar-day-today-indicator" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panel de Detalles Mejorado */}
            <div className="calendar-details">
              <div className="calendar-details-header">
                <h2 className="calendar-details-title">
                  {viewMode === 'calendar' ? formatDate(selectedDate) : 'Todos los Pedidos'}
                </h2>
                <span className="calendar-pedidos-count">
                  {filteredPedidos.length} pedidos
                </span>
              </div>

              {/* Estadísticas Mejoradas */}
              {showStats && (
                <div className="calendar-stats">
                  <div className="calendar-stat-card calendar-stat-total">
                    <div className="calendar-stat-value">
                      {selectedDateStats.total}
                    </div>
                    <div className="calendar-stat-label">
                      Ventas Reales
                    </div>
                  </div>
                  
                  <div className="calendar-stat-card calendar-stat-domicilio">
                    <div className="calendar-stat-value">
                      {selectedDateStats.domicilio}
                    </div>
                    <div className="calendar-stat-label">
                      🚚 Domicilio
                    </div>
                  </div>
                  
                  <div className="calendar-stat-card calendar-stat-retiro">
                    <div className="calendar-stat-value">
                      {selectedDateStats.retiro}
                    </div>
                    <div className="calendar-stat-label">
                      🏪 Retiro
                    </div>
                  </div>
                  
                  <div className="calendar-stat-card calendar-stat-ventas">
                    <div className="calendar-stat-value">
                      ${selectedDateStats.totalVentas.toLocaleString()}
                    </div>
                    <div className="calendar-stat-label">
                      💰 Ventas Reales
                    </div>
                  </div>

                  {/* Nueva estadística para pedidos cancelados */}
                  {selectedDateStats.cancelados > 0 && (
                    <div className="calendar-stat-card calendar-stat-cancelados">
                      <div className="calendar-stat-value">
                        {selectedDateStats.cancelados}
                      </div>
                      <div className="calendar-stat-label">
                        ❌ Cancelados
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Pedidos Mejorada */}
              {filteredPedidos.length === 0 ? (
                <div className="calendar-empty-state">
                  <FiCalendar className="calendar-empty-icon"/>
                  <div className="calendar-empty-title">
                    {searchTerm || filterEstado !== 'TODOS' 
                      ? 'No se encontraron resultados' 
                      : viewMode === 'calendar' 
                        ? 'Día sin pedidos'
                        : 'Sin pedidos registrados'}
                  </div>
                  <div className="calendar-empty-description">
                    {searchTerm || filterEstado !== 'TODOS' 
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : 'No se registraron pedidos en esta fecha.'}
                  </div>
                </div>
              ) : (
                <div className="calendar-pedidos-grid">
                  {filteredPedidos.map(pedido => {
                    const actual = pedido.estado || 'PENDIENTE';
                    const info = getEstadoInfo(actual);
                    const esSeleccionado = selectedPedido?.id === pedido.id;

                    return (
                      <div 
                        key={pedido.id}
                        onClick={() => setSelectedPedido(esSeleccionado ? null : pedido)}
                        className={`calendar-pedido-card ${esSeleccionado ? 'selected' : ''}`}
                        style={{
                          borderColor: esSeleccionado ? '#3b82f6' : info.border
                        }}
                      >
                        <div className="calendar-pedido-header">
                          <div 
                            className="calendar-pedido-avatar"
                            style={{
                              background: info.border,
                              color: info.text
                            }}
                          >
                            {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="calendar-pedido-info">
                            <div className="calendar-pedido-name">
                              {pedido.nombre || 'Cliente'}
                            </div>
                            <div className="calendar-pedido-product">
                              {pedido.producto || 'Producto'}
                            </div>
                          </div>
                          <div className="calendar-pedido-status">
                            <div 
                              className="calendar-pedido-status-icon"
                              style={{color: info.text}}
                            >
                              {info.icon}
                            </div>
                            <div 
                              className="calendar-pedido-status-label"
                              style={{color: info.text}}
                            >
                              {info.label}
                            </div>
                          </div>
                        </div>

                        <div style={{marginBottom: '12px'}}>
                          <span className={`calendar-pedido-type ${esPedidoDomicilio(pedido) ? 'domicilio' : 'retiro'}`}>
                            {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro'}
                          </span>
                        </div>

                        <div className="calendar-pedido-time">
                          {new Date(pedido.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})}
                        </div>

                        {esSeleccionado && (
                          <div className="calendar-pedido-details">
                            <div style={{marginBottom: '8px'}}>
                              <strong>Dirección:</strong> {pedido.direccion || 'Retiro en local'}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                              <strong>Bebida:</strong> {pedido.bebida} {pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                              <strong>Resumen:</strong> {pedido.resumen || 'Sin observaciones'}
                            </div>
                            <div>
                              <strong>Total:</strong> ${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView; 