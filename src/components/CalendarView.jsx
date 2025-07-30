import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiUser, FiMapPin,
  FiDollarSign, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiInfo,
  FiFilter, FiSearch, FiRefreshCw, FiDownload, FiEye, FiEyeOff,
  FiCoffee, FiShoppingCart, FiUserPlus, FiSun, FiMoon
} from 'react-icons/fi';
import '../App.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';
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

// Función para obtener info de estado
const getEstadoInfo = (key) => ESTADOS.find(e => e.key === key) || ESTADOS[0];

// Función para formatear fecha
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para obtener el día de la semana
const getDayOfWeek = (date) => {
  return new Date(date).toLocaleDateString('es-CL', { weekday: 'short' });
};

// Función para obtener el mes
const getMonth = (date) => {
  return new Date(date).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
};

// Función para generar días del mes
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days = [];
  
  // Agregar días del mes anterior para completar la primera semana
  for (let i = startingDay - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Agregar días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const today = new Date();
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday: currentDate.toDateString() === today.toDateString()
    });
  }
  
  // Agregar días del siguiente mes para completar la última semana
  const remainingDays = 42 - days.length; // 6 semanas * 7 días
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
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [showStats, setShowStats] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });
  
  // Estados para notificaciones de nuevos pedidos
  const [nuevosPedidos, setNuevosPedidos] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);

  // Función para cambiar el modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('quenitas-dark', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  useEffect(() => {
    fetchPedidos();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  };

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // Actualizar selectedDate al primer día del nuevo mes
      setSelectedDate(newDate);
      return newDate;
    });
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      // Actualizar selectedDate al primer día del nuevo mes
      setSelectedDate(newDate);
      return newDate;
    });
  };

  // Ir a hoy
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Obtener pedidos de una fecha específica
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

  // Obtener estadísticas de una fecha
  const getStatsForDate = (date) => {
    const pedidosDelDia = getPedidosForDate(date);
    
    return {
      total: pedidosDelDia.length,
      pendientes: pedidosDelDia.filter(p => (p.estado || 'PENDIENTE') === 'PENDIENTE').length,
      enPreparacion: pedidosDelDia.filter(p => p.estado === 'EN_PREPARACION').length,
      listos: pedidosDelDia.filter(p => p.estado === 'LISTO').length,
      enEntrega: pedidosDelDia.filter(p => p.estado === 'EN_ENTREGA').length,
      entregados: pedidosDelDia.filter(p => p.estado === 'ENTREGADO').length,
      cancelados: pedidosDelDia.filter(p => p.estado === 'CANCELADO').length,
      domicilio: pedidosDelDia.filter(p => esPedidoDomicilio(p)).length,
      retiro: pedidosDelDia.filter(p => !esPedidoDomicilio(p)).length,
      totalVentas: pedidosDelDia
        .filter(p => p.estado !== 'CANCELADO')
        .reduce((sum, p) => sum + (p.precio_total || 0), 0)
    };
  };

  // Obtener estadísticas de todos los pedidos
  const getStatsForAllPedidos = () => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter(p => (p.estado || 'PENDIENTE') === 'PENDIENTE').length,
      enPreparacion: pedidos.filter(p => p.estado === 'EN_PREPARACION').length,
      listos: pedidos.filter(p => p.estado === 'LISTO').length,
      enEntrega: pedidos.filter(p => p.estado === 'EN_ENTREGA').length,
      entregados: pedidos.filter(p => p.estado === 'ENTREGADO').length,
      cancelados: pedidos.filter(p => p.estado === 'CANCELADO').length,
      domicilio: pedidos.filter(p => esPedidoDomicilio(p)).length,
      retiro: pedidos.filter(p => !esPedidoDomicilio(p)).length,
      totalVentas: pedidos
        .filter(p => p.estado !== 'CANCELADO')
        .reduce((sum, p) => sum + (p.precio_total || 0), 0)
    };
  };

  // Filtrar pedidos por búsqueda y estado
  const getFilteredPedidosForDate = (date) => {
    let pedidosDelDia = getPedidosForDate(date);
    
    // Filtrar por búsqueda
    if (searchTerm) {
      pedidosDelDia = pedidosDelDia.filter(pedido => 
        pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (filterEstado !== 'TODOS') {
      pedidosDelDia = pedidosDelDia.filter(pedido => 
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }
    
    return pedidosDelDia;
  };

  // Filtrar todos los pedidos por búsqueda y estado
  const getFilteredAllPedidos = () => {
    let pedidosFiltrados = pedidos;
    
    // Filtrar por búsqueda
    if (searchTerm) {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (filterEstado !== 'TODOS') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => 
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }
    
    return pedidosFiltrados;
  };

  // Render ingredientes
  const renderIngredientes = (personalizacion) => {
    if (!personalizacion) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
    try {
      const obj = JSON.parse(personalizacion);
      const selected = Object.entries(obj).filter(([,v]) => v).map(([k]) => k);
      if (selected.length === 0) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
      return (
        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
          {selected.map(ing => <span key={ing} style={{background:'#f1f5f9',color:'#2563eb',borderRadius:6,padding:'2px 8px',fontSize:'0.93em',fontWeight:600,marginBottom:2}}>{ing}</span>)}
        </div>
      );
    } catch {
      return <span style={{color:'#64748b'}}>{personalizacion}</span>;
    }
  };

  // Render pedido card
  const renderPedidoCard = (pedido) => {
    const actual = pedido.estado || 'PENDIENTE';
    const info = getEstadoInfo(actual);
    const esSeleccionado = selectedPedido?.id === pedido.id;

    return (
      <div 
        key={pedido.id} 
        className="admin-card" 
        style={{
          background: esSeleccionado ? '#f0f9ff' : '#fff',
          borderRadius: 12,
          boxShadow: esSeleccionado ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
          padding: '1rem',
          margin: '0 auto',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transition: 'all 0.3s ease',
          border: `2px solid ${esSeleccionado ? '#3b82f6' : info.border}`,
          cursor: 'pointer'
        }}
        onClick={() => setSelectedPedido(esSeleccionado ? null : pedido)}
      >
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="admin-avatar" style={{
            background: info.border,
            color: info.text,
            border: `2px solid ${info.border}`,
            fontWeight: 900,
            fontSize: '1.2em',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}>
            {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
          </span>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 900, fontSize: '1.1em', color: '#1f2937', lineHeight: 1.2, marginBottom: 2}}>
              {pedido.nombre || 'Cliente'}
            </div>
            <div style={{fontWeight: 700, fontSize: '1em', color: '#38bdf8'}}>
              {pedido.producto || 'Producto'}
            </div>
            <div style={{fontSize: '0.9em', color: '#64748b', fontWeight: 600}}>
              {viewMode === 'calendar' 
                ? new Date(pedido.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})
                : new Date(pedido.created_at).toLocaleDateString('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'}) + ' ' + 
                  new Date(pedido.created_at).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})
              }
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <span style={{fontSize: '1.5rem', color: info.text}}>{info.icon}</span>
            <span style={{fontSize: '0.8em', fontWeight: 700, color: info.text}}>{info.label}</span>
          </div>
        </div>

        {/* Tipo de pedido */}
        <div style={{marginTop: 4}}>
          <span style={{
            fontSize: '0.85em',
            padding: '4px 8px',
            borderRadius: 6,
            fontWeight: 700,
            color: esPedidoDomicilio(pedido) ? '#059669' : '#2563eb',
            background: esPedidoDomicilio(pedido) ? '#d1fae5' : '#dbeafe'
          }}>
            {esPedidoDomicilio(pedido) ? '🚚 Domicilio' : '🏪 Retiro'}
          </span>
        </div>

        {/* Ingredientes */}
        <div style={{marginTop: 4}}>
          {renderIngredientes(pedido.personalizacion)}
        </div>

        {/* Información adicional si está seleccionado */}
        {esSeleccionado && (
          <div style={{
            marginTop: 8,
            padding: '8px',
            background: '#f8fafc',
            borderRadius: 8,
            fontSize: '0.9em',
            color: '#374151'
          }}>
            <div style={{marginBottom: 4}}>
              <strong>Dirección:</strong> {pedido.direccion || 'Retiro en local'}
            </div>
            <div style={{marginBottom: 4}}>
              <strong>Bebida:</strong> {pedido.bebida} {pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}
            </div>
            <div style={{marginBottom: 4}}>
              <strong>Resumen:</strong> {pedido.resumen || 'Sin observaciones'}
            </div>
            <div>
              <strong>Total:</strong> ${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8}}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPedido(esSeleccionado ? null : pedido);
            }} 
            className="admin-btn secondary" 
            style={{
              padding: '8px 12px',
              fontWeight: 600,
              fontSize: '0.9em',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              background: '#f3f4f6',
              color: '#374151'
            }}
          >
            {esSeleccionado ? <FiEyeOff/> : <FiEye/>} {esSeleccionado ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </div>
    );
  };

  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const selectedDateStats = viewMode === 'calendar' ? getStatsForDate(selectedDate) : getStatsForAllPedidos();
  const filteredPedidos = viewMode === 'calendar' ? getFilteredPedidosForDate(selectedDate) : getFilteredAllPedidos();

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',padding:0,fontFamily:'Inter,Poppins,Montserrat,sans-serif'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:20,background:'var(--bg-primary)',boxShadow:'0 2px 8px var(--shadow-light)',padding:'1rem 0',marginBottom:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'100vw',margin:'0 auto',padding:'0 2vw'}}>
          <span style={{fontWeight:900,fontSize:'1.8rem',color:'var(--accent-secondary)',letterSpacing:'-1px',display:'flex',alignItems:'center',gap:10}}>
            <FiCalendar/> Calendario de Pedidos
          </span>
          <div style={{display:'flex',gap:10}}>
            <button 
              onClick={toggleDarkMode} 
              className="admin-btn" 
              style={{
                fontSize: '1em',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {darkMode ? <FiMoon/> : <FiSun/>}
            </button>
            <button onClick={onBack} className="admin-btn secondary" style={{fontSize:'1em',padding:'8px 16px'}}>Volver</button>
          </div>
        </div>
      </header>

      {/* Botones de navegación rápida */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2vw'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{
            fontWeight: 600,
            color: 'var(--text-muted)',
            fontSize: '0.9em',
            marginRight: 8
          }}>
            Acceso rápido:
          </span>
          
          <button
            onClick={() => setRoute('/admin-quenita')}
            className="admin-btn"
            style={{
              background: '#1f2937',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            🏠 Panel Principal
          </button>
          
          <button
            onClick={() => setRoute('/cocina')}
            className="admin-btn"
            style={{
              background: '#059669',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiCoffee/> Cocina
          </button>
          
          <button
            onClick={() => setRoute('/caja')}
            className="admin-btn"
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiShoppingCart/> Caja
          </button>
          
          <button
            onClick={() => setRoute('/cajero')}
            className="admin-btn"
            style={{
              background: '#7c3aed',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiUserPlus/> Cajero
          </button>
          
          <button
            onClick={() => setRoute('/repartidor')}
            className="admin-btn"
            style={{
              background: '#F97316',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            🚚 Repartidor
          </button>
          
          <button
            onClick={() => setRoute('/calendario')}
            className="admin-btn"
            style={{
              background: '#8B5CF6',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600,
              border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
            }}
          >
            📅 Calendario
          </button>
        </div>
      </div>

      {/* Controles principales */}
      <div style={{padding:'1rem 2vw',background:'#fff',borderBottom:'1px solid #e5e7eb'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:16,alignItems:'center',justifyContent:'space-between'}}>
          {/* Navegación del calendario */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={goToPreviousMonth} className="admin-btn secondary" style={{padding:'8px 12px'}}>
              <FiChevronLeft/>
            </button>
            <span style={{fontWeight:700,fontSize:'1.2em',color:'#1f2937',minWidth:200,textAlign:'center'}}>
              {getMonth(currentDate)}
            </span>
            <button onClick={goToNextMonth} className="admin-btn secondary" style={{padding:'8px 12px'}}>
              <FiChevronRight/>
            </button>
            <button onClick={goToToday} className="admin-btn" style={{padding:'8px 16px',fontSize:'0.9em'}}>
              Hoy
            </button>
          </div>

          {/* Modo de vista */}
          <div style={{display:'flex',gap:8}}>
            <button
              onClick={() => setViewMode('calendar')}
              className="admin-btn"
              style={{
                background: viewMode === 'calendar' ? '#2563eb' : '#f3f4f6',
                color: viewMode === 'calendar' ? '#fff' : '#374151',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.9em',
                fontWeight: 600
              }}
            >
              <FiCalendar/> Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="admin-btn"
              style={{
                background: viewMode === 'list' ? '#2563eb' : '#f3f4f6',
                color: viewMode === 'list' ? '#fff' : '#374151',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.9em',
                fontWeight: 600
              }}
            >
              <FiEye/> Lista
            </button>
          </div>

          {/* Botón estadísticas */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="admin-btn"
            style={{
              background: showStats ? '#3b82f6' : '#f3f4f6',
              color: showStats ? '#fff' : '#374151',
              padding: '8px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiFilter/> Estadísticas
          </button>

          {/* Botón refresh */}
          <button
            onClick={fetchPedidos}
            className="admin-btn secondary"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.9em',
              fontWeight: 600
            }}
          >
            <FiRefreshCw/> Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',marginTop:16}}>
          {/* Búsqueda */}
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f9fafb',borderRadius:8,padding:'4px 12px',border:'1px solid #e5e7eb'}}>
            <FiSearch style={{color:'#6b7280',fontSize:'1em'}}/>
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1em',
                padding: '8px',
                background: 'transparent',
                minWidth: 200
              }}
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: '1em',
              background: '#fff'
            }}
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS.map(estado => (
              <option key={estado.key} value={estado.key}>{estado.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{padding:'1.5rem 2vw'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}>
            <FiRefreshCw style={{fontSize:'2rem',animation:'spin 1s linear infinite'}}/>
            <div style={{marginTop:16}}>Cargando pedidos...</div>
          </div>
        ) : (
          <div style={{display:'flex',gap:24}}>
            {/* Vista de calendario */}
            {viewMode === 'calendar' && (
              <div style={{flex:1,background:'#fff',borderRadius:16,padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                {/* Días de la semana */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:8,marginBottom:16}}>
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} style={{
                      textAlign:'center',
                      fontWeight:700,
                      color:'#6b7280',
                      fontSize:'0.9em',
                      padding:'8px'
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del calendario */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:4}}>
                  {calendarDays.map((day, index) => {
                    const dayStats = getStatsForDate(day.date);
                    const isSelected = day.date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          // Solo permitir selección de días del mes actual
                          if (day.isCurrentMonth) {
                            setSelectedDate(day.date);
                          }
                        }}
                        style={{
                          aspectRatio: '1',
                          padding: '8px',
                          borderRadius: 8,
                          cursor: day.isCurrentMonth ? 'pointer' : 'default',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          background: isSelected ? '#eff6ff' : day.isCurrentMonth ? '#fff' : '#f9fafb',
                          color: day.isCurrentMonth ? '#1f2937' : '#9ca3af',
                          fontWeight: day.isToday ? 900 : 600,
                          fontSize: '0.9em',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          opacity: day.isCurrentMonth ? 1 : 0.5
                        }}
                      >
                        <span style={{marginBottom:4}}>{day.date.getDate()}</span>
                        {dayStats.total > 0 && (
                          <span style={{
                            background: '#2563eb',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7em',
                            fontWeight: 700
                          }}>
                            {dayStats.total}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panel de detalles */}
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:16}}>
              {/* Fecha seleccionada */}
              <div style={{background:'#fff',borderRadius:16,padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <h2 style={{fontWeight:900,fontSize:'1.5em',color:'#1f2937',margin:0}}>
                    {viewMode === 'calendar' ? formatDate(selectedDate) : 'Todos los Pedidos'}
                  </h2>
                  <span style={{
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontWeight: 700,
                    fontSize: '0.9em'
                  }}>
                    {filteredPedidos.length} pedidos
                  </span>
                </div>

                {/* Estadísticas del día */}
                {showStats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 12,
                    marginBottom: 16
                  }}>
                    <div style={{textAlign:'center',padding:'12px',background:'#f8fafc',borderRadius:8}}>
                      <div style={{fontSize:'1.5em',fontWeight:900,color:'#2563eb'}}>{selectedDateStats.total}</div>
                      <div style={{fontSize:'0.8em',color:'#6b7280',fontWeight:600}}>Total</div>
                    </div>
                    <div style={{textAlign:'center',padding:'12px',background:'#fef3c7',borderRadius:8}}>
                      <div style={{fontSize:'1.5em',fontWeight:900,color:'#92400e'}}>{selectedDateStats.domicilio}</div>
                      <div style={{fontSize:'0.8em',color:'#6b7280',fontWeight:600}}>Domicilio</div>
                    </div>
                    <div style={{textAlign:'center',padding:'12px',background:'#dbeafe',borderRadius:8}}>
                      <div style={{fontSize:'1.5em',fontWeight:900,color:'#1e40af'}}>{selectedDateStats.retiro}</div>
                      <div style={{fontSize:'0.8em',color:'#6b7280',fontWeight:600}}>Retiro</div>
                    </div>
                    <div style={{textAlign:'center',padding:'12px',background:'#dcfce7',borderRadius:8}}>
                      <div style={{fontSize:'1.5em',fontWeight:900,color:'#166534'}}>${selectedDateStats.totalVentas.toLocaleString()}</div>
                      <div style={{fontSize:'0.8em',color:'#6b7280',fontWeight:600}}>Ventas</div>
                    </div>
                  </div>
                )}

                {/* Estados del día */}
                {showStats && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 16
                  }}>
                    {ESTADOS.map(estado => {
                      const count = selectedDateStats[estado.key.toLowerCase()] || 0;
                      if (count === 0) return null;
                      
                      const info = getEstadoInfo(estado.key);
                      return (
                        <div key={estado.key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 10px',
                          background: info.color,
                          borderRadius: 6,
                          border: `1px solid ${info.border}`,
                          fontSize: '0.8em'
                        }}>
                          <span style={{color: info.text}}>{info.icon}</span>
                          <span style={{fontWeight: 700, color: info.text}}>{info.label}</span>
                          <span style={{
                            background: '#fff',
                            color: info.text,
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontWeight: 800,
                            fontSize: '0.7em'
                          }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Lista de pedidos */}
              <div style={{background:'#fff',borderRadius:16,padding:'1.5rem',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',flex:1}}>
                <h3 style={{fontWeight:700,fontSize:'1.2em',color:'#1f2937',marginBottom:16,marginTop:0}}>
                  {viewMode === 'calendar' ? 'Pedidos del día' : 'Todos los Pedidos'}
                </h3>
                
                {filteredPedidos.length === 0 ? (
                  <div style={{textAlign:'center',padding:'2rem',color:'#6b7280'}}>
                    <FiCalendar style={{fontSize:'3rem',marginBottom:16}}/>
                    <div style={{fontSize:'1.1em',marginBottom:8}}>No hay pedidos</div>
                    <div style={{color:'#9ca3af'}}>
                      {searchTerm || filterEstado !== 'TODOS' 
                        ? 'Intenta ajustar los filtros de búsqueda' 
                        : viewMode === 'calendar' 
                          ? 'No se registraron pedidos en esta fecha'
                          : 'No hay pedidos registrados en el sistema'}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 16
                  }}>
                    {filteredPedidos.map(renderPedidoCard)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView; 