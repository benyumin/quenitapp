import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
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
  
  // Días del mes anterior para completar la primera semana
  const daysFromPrevMonth = startingDay === 0 ? 6 : startingDay - 1;
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const prevDate = new Date(year, month, -i + 1);
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
  const totalDaysInGrid = 42; // 6 semanas * 7 días
  const remainingDays = totalDaysInGrid - days.length;
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
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pedidos:', error);
        return;
      }
      
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date) => {
    if (date.isCurrentMonth) {
      setSelectedDate(date.date);
    }
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
    
    // Calcular estadísticas por hora para insights de negocio
    const pedidosPorHora = {};
    ventasReales.forEach(pedido => {
      const hora = new Date(pedido.created_at).getHours();
      pedidosPorHora[hora] = (pedidosPorHora[hora] || 0) + 1;
    });
    
    const horaMasOcupada = Object.keys(pedidosPorHora).reduce((a, b) => 
      pedidosPorHora[a] > pedidosPorHora[b] ? a : b, 0
    );
    
    // Calcular promedio de venta por pedido
    const promedioVenta = ventasReales.length > 0 
      ? ventasReales.reduce((sum, p) => sum + (p.precio_total || 0), 0) / ventasReales.length 
      : 0;
    
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
      totalVentas: ventasReales.reduce((sum, p) => sum + (p.precio_total || 0), 0), // Solo ventas reales
      horaMasOcupada: horaMasOcupada,
      promedioVenta: promedioVenta,
      pedidosPorHora: pedidosPorHora
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

  const generarReporteDiario = (fecha) => {
    const doc = new jsPDF();
    const fechaFormateada = formatDate(fecha);
    const stats = getStatsForDate(fecha);
    const pedidosDelDia = getPedidosForDate(fecha).filter(p => p.estado !== 'CANCELADO');
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte Diario - Quenitas', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaFormateada}`, 20, 35);
    
    // Estadísticas principales
    doc.setFontSize(14);
    doc.text('Resumen del Día:', 20, 50);
    doc.setFontSize(10);
    doc.text(`• Total de pedidos: ${stats.total}`, 25, 65);
    doc.text(`• Domicilio: ${stats.domicilio}`, 25, 75);
    doc.text(`• Retiro en local: ${stats.retiro}`, 25, 85);
    doc.text(`• Ventas totales: $${stats.totalVentas.toLocaleString()}`, 25, 95);
    doc.text(`• Promedio por pedido: $${Math.round(stats.promedioVenta).toLocaleString()}`, 25, 105);
    doc.text(`• Hora más ocupada: ${stats.horaMasOcupada}:00 hrs`, 25, 115);
    
    // Lista de pedidos
    if (pedidosDelDia.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Detalle de Pedidos:', 20, 20);
      
      let y = 35;
      pedidosDelDia.forEach((pedido, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${pedido.nombre || 'Cliente'}`, 20, y);
        doc.text(`   Producto: ${pedido.producto || 'N/A'}`, 25, y + 5);
        doc.text(`   Estado: ${getEstadoInfo(pedido.estado).label}`, 25, y + 10);
        doc.text(`   Tipo: ${esPedidoDomicilio(pedido) ? 'Domicilio' : 'Retiro'}`, 25, y + 15);
        doc.text(`   Total: $${(pedido.precio_total || 0).toLocaleString()}`, 25, y + 20);
        doc.text(`   Hora: ${new Date(pedido.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})}`, 25, y + 25);
        
        y += 35;
      });
    }
    
    doc.save(`reporte-quenitas-${fecha.toISOString().split('T')[0]}.pdf`);
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
              <div className="calendar-modern-layout">
                {/* Header del mes */}
                <div className="calendar-month-header">
                  <div className="month-info">
                    <h3 className="month-title">{getMonth(currentDate)}</h3>
                    <p className="month-subtitle">Selecciona un día para ver los pedidos</p>
                  </div>
                  <div className="month-actions">
                    <button 
                      onClick={goToPreviousMonth}
                      className="month-nav-btn"
                      aria-label="Mes anterior"
                    >
                      <FiChevronLeft />
                    </button>
                    <button 
                      onClick={goToToday}
                      className="today-btn"
                    >
                      Hoy
                    </button>
                    <button 
                      onClick={goToNextMonth}
                      className="month-nav-btn"
                      aria-label="Mes siguiente"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>

                {/* Días del mes en formato de tarjetas */}
                <div className="calendar-days-grid">
                  {calendarDays.map((day, index) => {
                    const dayStats = getStatsForDate(day.date);
                    const isSelected = day.date.toDateString() === selectedDate.toDateString();
                    const hasPedidos = dayStats.total > 0;
                    const isCurrentMonth = day.isCurrentMonth;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`calendar-day-card ${isCurrentMonth ? 'current-month' : 'other-month'} ${isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${hasPedidos ? 'has-orders' : ''}`}
                      >
                        <div className="day-card-header">
                          <div className="day-number">
                            {day.date.getDate()}
                          </div>
                          {day.isToday && (
                            <div className="today-indicator">Hoy</div>
                          )}
                        </div>
                        
                        {isCurrentMonth && (
                          <div className="day-card-content">
                            {hasPedidos ? (
                              <div className="day-orders-info">
                                <div className="orders-count">
                                  <span className="count-number">{dayStats.total}</span>
                                  <span className="count-label">pedidos</span>
                                </div>
                                <div className="orders-breakdown">
                                  {dayStats.domicilio > 0 && (
                                    <span className="breakdown-item domicilio">
                                      🚚 {dayStats.domicilio}
                                    </span>
                                  )}
                                  {dayStats.retiro > 0 && (
                                    <span className="breakdown-item retiro">
                                      🏪 {dayStats.retiro}
                                    </span>
                                  )}
                                </div>
                                <div className="day-revenue">
                                  ${dayStats.totalVentas.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <div className="day-empty">
                                <span className="empty-text">Sin pedidos</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!isCurrentMonth && (
                          <div className="day-card-content other-month">
                            <span className="other-month-text">
                              {day.date.getDate()}
                            </span>
                          </div>
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
                <div className="calendar-details-actions">
                  <span className="calendar-pedidos-count">
                    {filteredPedidos.length} pedidos
                  </span>
                  {selectedDateStats.total > 0 && (
                    <button 
                      onClick={() => generarReporteDiario(selectedDate)}
                      className="calendar-report-btn"
                      title="Generar reporte del día"
                    >
                      <FiDownload />
                      Reporte
                    </button>
                  )}
                </div>
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

              {/* Insights de Negocio */}
              {selectedDateStats.total > 0 && (
                <div className="calendar-business-insights">
                  <h3 className="insights-title">📊 Insights del Día</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <div className="insight-icon">🕐</div>
                      <div className="insight-content">
                        <div className="insight-value">
                          {selectedDateStats.horaMasOcupada}:00 hrs
                        </div>
                        <div className="insight-label">
                          Hora más ocupada
                        </div>
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-icon">💰</div>
                      <div className="insight-content">
                        <div className="insight-value">
                          ${Math.round(selectedDateStats.promedioVenta).toLocaleString()}
                        </div>
                        <div className="insight-label">
                          Promedio por pedido
                        </div>
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-icon">📈</div>
                      <div className="insight-content">
                        <div className="insight-value">
                          {selectedDateStats.domicilio > selectedDateStats.retiro ? 'Domicilio' : 'Retiro'}
                        </div>
                        <div className="insight-label">
                          Modo preferido
                        </div>
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-icon">⚡</div>
                      <div className="insight-content">
                        <div className="insight-value">
                          {selectedDateStats.total > 5 ? 'Excelente' : selectedDateStats.total > 3 ? 'Bueno' : 'Regular'}
                        </div>
                        <div className="insight-label">
                          Rendimiento
                        </div>
                      </div>
                    </div>
                  </div>
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
                            <div style={{marginBottom: '8px'}}>
                              <strong>Total:</strong> ${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP
                            </div>
                            <div style={{marginBottom: '8px'}}>
                              <strong>Teléfono:</strong> {pedido.telefono || 'No proporcionado'}
                            </div>
                            <div>
                              <strong>Estado:</strong> {getEstadoInfo(pedido.estado).label}
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