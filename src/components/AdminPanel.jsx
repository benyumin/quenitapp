import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import {
  FiPhone, FiClock, FiFileText, FiChevronRight, FiChevronLeft, FiCheckCircle, FiXCircle, FiInfo, FiUser,
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiCheck, FiX, FiAlertCircle,
  FiShoppingCart, FiUserPlus, FiSun, FiMoon, FiEdit3, FiTrash2, FiDownload,
  FiBell, FiSettings, FiTrendingUp, FiCalendar, FiGrid, FiList, FiHelpCircle,
  FiHome, FiPackage, FiTruck, FiDollarSign, FiBarChart2, FiUsers, FiBox
} from 'react-icons/fi';
import '../App.css';
import './AdminPanel.css';
import './AdminLayout.css';
import './AdminSidebar.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';
import AdminLayout from './AdminLayout';
import AdminSidebar from './AdminSidebar';

const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .admin-panel button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .admin-panel button:active {
    transform: translateY(0);
  }
  
  /* Mejoras de legibilidad */
  .admin-panel {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
  }
  
  .admin-panel table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .admin-panel th {
    background: #f8fafc;
    padding: 16px 12px;
    font-weight: 700;
    font-size: 0.9rem;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .admin-panel td {
    padding: 16px 12px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
    font-size: 0.9rem;
  }
  
  .admin-panel tr:nth-child(even) {
    background: #fafafa;
  }
  
  .admin-panel tr:hover {
    background: #f0f9ff;
  }
  
  .admin-panel .product-cell {
    max-width: 300px;
    word-wrap: break-word;
    line-height: 1.4;
  }
  
  .admin-panel .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.8rem;
    text-align: center;
    min-width: 100px;
    display: inline-block;
  }
  
  .admin-panel .action-button {
    padding: 8px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    margin: 2px;
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .admin-panel .action-button:hover {
    transform: scale(1.1);
  }
`;

// Inyectar estilos
if (!document.getElementById('admin-panel-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'admin-panel-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Constantes para estados y transiciones
const ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#FFF9DB', border: '#FFE066', text: '#B59B00', icon: <FiInfo /> },
  { key: 'EN_PREPARACION', label: 'En preparación', color: '#E0F7FA', border: '#4DD0E1', text: '#007C91', icon: <FiClock /> },
  { key: 'LISTO', label: 'Listo', color: '#F3E8FF', border: '#C084FC', text: '#7C3AED', icon: <FiChevronRight /> },
  { key: 'EN_ENTREGA', label: 'En entrega', color: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: <FiPhone /> },
  { key: 'ENTREGADO', label: 'Entregado', color: '#E6F9ED', border: '#34D399', text: '#166534', icon: <FiCheckCircle />, 
    bgGradient: 'linear-gradient(135deg, #E6F9ED 0%, #D1FAE5 100%)', 
    cardStyle: { border: '3px solid #34D399', boxShadow: '0 4px 12px rgba(52, 211, 153, 0.3)' } },
  { key: 'CANCELADO', label: 'Cancelado', color: '#FEF2F2', border: '#FCA5A5', text: '#DC2626', icon: <FiXCircle />, 
    bgGradient: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', 
    cardStyle: { border: '3px solid #FCA5A5', boxShadow: '0 4px 12px rgba(252, 165, 165, 0.3)', opacity: 0.8 } },
];

const TRANSICIONES = {
  'PENDIENTE': ['EN_PREPARACION', 'CANCELADO'],
  'EN_PREPARACION': ['LISTO', 'CANCELADO'],
  'LISTO': ['EN_ENTREGA', 'ENTREGADO', 'CANCELADO'],
  'EN_ENTREGA': ['ENTREGADO', 'CANCELADO'],
  'ENTREGADO': [],
  'CANCELADO': []
};

// Función para obtener transiciones inteligentes basadas en el tipo de pedido
const getTransicionesInteligentes = (pedido, estadoActual) => {
  const esDomicilio = esPedidoDomicilio(pedido);
  
  switch (estadoActual) {
    case 'PENDIENTE':
      return ['EN_PREPARACION', 'CANCELADO'];
    case 'EN_PREPARACION':
      return ['LISTO', 'CANCELADO'];
    case 'LISTO':
      // Si es domicilio, mostrar EN_ENTREGA. Si es retiro, mostrar ENTREGADO
      return esDomicilio ? ['EN_ENTREGA', 'ENTREGADO', 'CANCELADO'] : ['ENTREGADO', 'CANCELADO'];
    case 'EN_ENTREGA':
      return ['ENTREGADO', 'CANCELADO'];
    case 'ENTREGADO':
      return [];
    case 'CANCELADO':
      return [];
    default:
      return [];
  }
};

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

// Función para formatear el tiempo transcurrido
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

// Función para obtener el siguiente estado lógico
const getSiguienteEstado = (pedido, estadoActual) => {
  const esDomicilio = esPedidoDomicilio(pedido);

  switch (estadoActual) {
    case 'PENDIENTE':
      return 'EN_PREPARACION';
    case 'EN_PREPARACION':
      return 'LISTO';
    case 'LISTO':
      // Si es domicilio, necesita entrega. Si es retiro, el cliente viene a buscarlo
      return esDomicilio ? 'EN_ENTREGA' : 'ENTREGADO';
    case 'EN_ENTREGA':
      return 'ENTREGADO';
    default:
      return null;
  }
};

// Función para cargar imagen como base64
function loadImageAsBase64(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;

      // Configurar el contexto para mejor calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar imagen con mejor calidad
      ctx.drawImage(img, 0, 0, 50, 50);

      // Usar JPEG con alta calidad para mejor compatibilidad
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      resolve(base64);
    };

    img.onerror = (error) => {
      console.error('Error cargando imagen:', error);
      reject(error);
    };

    img.src = imageSrc;
  });
}

async function generarBoletaPDF(pedido) {
  const doc = new jsPDF();
  let y = 15;

  // Simular terminal de pago - fondo blanco con bordes
  doc.setFillColor(255, 255, 255);
  doc.rect(5, 5, 200, 280, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 280, 'S');

  // Header estilo boleta electrónica
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // RUT y número de boleta
  doc.text('R.U.T.: 76.349.353-3', 15, y);
  doc.text(`Nº ${pedido.id}`, 195, y, { align: 'right' });
  y += 8;

  // Título "Boleta electrónica"
  doc.setFontSize(14);
  doc.text('BOLETA ELECTRÓNICA', 105, y, { align: 'center' });
  y += 15;

  // Información de la empresa
  doc.setFontSize(12);
  doc.text('QUENITA\'S', 105, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(10);
  doc.text('Giro: VENTA DE ALIMENTOS Y BEBIDAS', 105, y, { align: 'center' });
  y += 8;
  
  doc.text('El sabor chileno sobre ruedas', 105, y, { align: 'center' });
  y += 8;
  
  doc.text('Fecha: ' + new Date(pedido.created_at).toLocaleDateString('es-CL'), 105, y, { align: 'center' });
  y += 15;

  // Línea separadora
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 10;

  // Detalles de la transacción
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DEL PEDIDO:', 15, y);
  y += 8;

  // Producto principal
  doc.setFont('helvetica', 'normal');
  const precioProducto = pedido.precio_producto || 2500;
  const cantidad = pedido.cantidad || 1;
  doc.text(`1 - ${pedido.producto || 'Producto'}`, 15, y);
  doc.text(`${cantidad} X $ ${precioProducto.toLocaleString()}`, 15, y + 5);
  y += 12;

  // Bebida (si hay)
  if (pedido.bebida) {
    const precioBebida = pedido.precio_bebida || 1000;
    doc.text(`2 - ${pedido.bebida} ${pedido.tipo_bebida ? `(${pedido.tipo_bebida})` : ''}`, 15, y);
    doc.text(`1 X $ ${precioBebida.toLocaleString()}`, 15, y + 5);
    y += 12;
  }

  // Línea separadora
  doc.line(15, y, 195, y);
  y += 8;

  // Cálculos de impuestos (simulando IVA)
  const subtotal = pedido.precio_total || (precioProducto * cantidad + (pedido.bebida ? (pedido.precio_bebida || 1000) : 0));
  const neto = Math.round(subtotal / 1.19);
  const iva = subtotal - neto;

  doc.setFont('helvetica', 'bold');
  doc.text('Neto: $ ' + neto.toLocaleString(), 15, y);
  y += 6;
  doc.text('IVA (19%): $ ' + iva.toLocaleString(), 15, y);
  y += 6;
  doc.setFontSize(12);
  doc.text('MONTO TOTAL: $ ' + subtotal.toLocaleString(), 15, y);
  y += 15;

  // Información del cliente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE:', 15, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${pedido.nombre || 'N/A'}`, 15, y);
  y += 6;
  doc.text(`Teléfono: ${pedido.telefono || 'N/A'}`, 15, y);
  y += 6;
  
  const esDomicilio = pedido.direccion && pedido.direccion.trim() !== '' &&
                       pedido.direccion.toLowerCase() !== 'retiro en local' &&
                       pedido.direccion.toLowerCase() !== 'retiro' &&
                       pedido.direccion.toLowerCase() !== 'local';
  
  doc.text(`Tipo: ${esDomicilio ? 'Domicilio' : 'Retiro en local'}`, 15, y);
  y += 6;
  
  if (esDomicilio && pedido.direccion) {
    doc.text(`Dirección: ${pedido.direccion}`, 15, y);
    y += 6;
  }

  y += 5;

  // Ingredientes personalizados (si hay)
  try {
    const pers = pedido.personalizacion ? JSON.parse(pedido.personalizacion) : {};
    const selected = Object.entries(pers).filter(([,v]) => v).map(([k]) => k);
    if (selected.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('INGREDIENTES PERSONALIZADOS:', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      selected.forEach(ing => {
        doc.text(`• ${ing}`, 15, y);
        y += 5;
      });
      y += 3;
    }
  } catch {
    // Si hay error, continuar
  }

  // Observaciones (si las hay)
  if (pedido.resumen) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OBSERVACIONES:', 15, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(pedido.resumen, 15, y);
    y += 10;
  }

  // QR Code placeholder (simulado con un rectángulo)
  doc.setFillColor(240, 240, 240);
  doc.rect(70, y, 60, 60, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.rect(70, y, 60, 60, 'S');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('QR CODE', 100, y + 35, { align: 'center' });
  y += 70;

  // Pie de página estilo SII
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Timbre Electrónico SII', 105, y, { align: 'center' });
  y += 5;
  doc.text('Resolución 0 de 2014', 105, y, { align: 'center' });
  y += 5;
  doc.text('Verifique documento: www.sii.cl', 105, y, { align: 'center' });
  y += 10;

  // Estado del pedido
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 105, y, { align: 'center' });
}

const AdminPanel = ({ onLogout, onBack, setRoute }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [showStats, setShowStats] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPedidos, setSelectedPedidos] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'
  const [calendarMode, setCalendarMode] = useState('compact'); // 'compact' or 'detailed'
  const [notifications, setNotifications] = useState([]);
  const [showTooltips, setShowTooltips] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeSection, setActiveSection] = useState('orders');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [filterTiempo, setFilterTiempo] = useState('TODOS');
  
  // Estados para el calendario
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState('month'); // 'month' or 'week'
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null);
  
  // Estados para el panel de cajero
  const [carrito, setCarrito] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [cajeroLoading, setCajeroLoading] = useState(false);
  const [showCajeroConfirmModal, setShowCajeroConfirmModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [activeTab, setActiveTab] = useState('productos');

  const fetchPedidos = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error al cargar pedidos:', error);
        throw error;
      } else {
        // Pedidos cargados exitosamente

        // Detectar nuevos pedidos
        if (pedidos.length > 0 && data && data.length > 0) {
          const newPedidos = data.filter(newPedido => 
            !pedidos.some(existingPedido => existingPedido.id === newPedido.id)
          );
          
          if (newPedidos.length > 0) {
            setNotifications(prev => [
              ...prev,
              {
                id: Date.now(),
                message: `${newPedidos.length} nuevo${newPedidos.length > 1 ? 's' : ''} pedido${newPedidos.length > 1 ? 's' : ''}`,
                type: 'info',
                timestamp: new Date()
              }
            ]);
          }
        }

        setPedidos(data || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Error en fetchPedidos:', error);
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          message: 'Error al cargar pedidos',
          type: 'error',
          timestamp: new Date()
        }
      ]);
    }
    setLoading(false);
    setIsRefreshing(false);
  }, [pedidos.length]);

  useEffect(() => {
    fetchPedidos();

    const interval = setInterval(() => fetchPedidos(false), 30000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  // Memoizar estadísticas para evitar recálculos innecesarios
  const estadisticas = useMemo(() => {
    const stats = {
      total: pedidos.length,
      pendientes: 0,
      enPreparacion: 0,
      listos: 0,
      enEntrega: 0,
      entregados: 0,
      cancelados: 0
    };

    pedidos.forEach(pedido => {
      const estado = pedido.estado || 'PENDIENTE';
      switch (estado) {
        case 'PENDIENTE': stats.pendientes++; break;
        case 'EN_PREPARACION': stats.enPreparacion++; break;
        case 'LISTO': stats.listos++; break;
        case 'EN_ENTREGA': stats.enEntrega++; break;
        case 'ENTREGADO': stats.entregados++; break;
        case 'CANCELADO': stats.cancelados++; break;
      }
    });

    return stats;
  }, [pedidos]);

  // Memoizar pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    let filtered = pedidos;

    // Filtro por estado
    if (filterEstado !== 'TODOS') {
      filtered = filtered.filter(pedido => 
        (pedido.estado || 'PENDIENTE') === filterEstado
      );
    }

    // Filtro por tipo (domicilio vs retiro)
    if (filterTipo !== 'TODOS') {
      filtered = filtered.filter(pedido => {
        const esDomicilio = esPedidoDomicilio(pedido);
        return filterTipo === 'DOMICILIO' ? esDomicilio : !esDomicilio;
      });
    }

    // Filtro por tiempo
    if (filterTiempo !== 'TODOS') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(pedido => {
        const pedidoDate = new Date(pedido.created_at);
        const timeElapsed = Math.floor((now - pedidoDate) / 60000); // minutos
        
        switch (filterTiempo) {
          case 'HOY':
            return pedidoDate >= today;
          case 'URGENTE':
            return timeElapsed > 30 && !['ENTREGADO', 'CANCELADO'].includes(pedido.estado || 'PENDIENTE');
          default:
            return true;
        }
      });
    }

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pedido =>
        (pedido.nombre || '').toLowerCase().includes(term) ||
        (pedido.producto || '').toLowerCase().includes(term) ||
        (pedido.direccion || '').toLowerCase().includes(term) ||
        (pedido.telefono || '').includes(term)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'nombre':
          aValue = (a.nombre || '').toLowerCase();
          bValue = (b.nombre || '').toLowerCase();
          break;
        case 'precio':
          aValue = parseFloat(a.precio_total || 0);
          bValue = parseFloat(b.precio_total || 0);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [pedidos, filterEstado, filterTipo, filterTiempo, searchTerm, sortBy, sortOrder]);

  const cambiarEstado = useCallback(async (pedido, nuevoEstado) => {
    const actual = pedido.estado || 'PENDIENTE';
    const actualInfo = getEstadoInfo(actual);
    const nuevoInfo = getEstadoInfo(nuevoEstado);
    
    // Mensaje personalizado según el cambio
    let mensaje = `¿Confirmar cambio de estado?`;
    let detalles = `De "${actualInfo.label}" a "${nuevoInfo.label}"`;
    
    if (nuevoEstado === 'EN_PREPARACION') {
      mensaje = '¿Enviar a cocina?';
      detalles = `El pedido #${pedido.id} será enviado a preparación`;
    } else if (nuevoEstado === 'LISTO') {
      mensaje = '¿Marcar como listo?';
      detalles = `El pedido #${pedido.id} estará listo para entrega`;
    } else if (nuevoEstado === 'EN_ENTREGA') {
      mensaje = '¿Enviar a repartidor?';
      detalles = `El pedido #${pedido.id} será enviado a entrega`;
    } else if (nuevoEstado === 'ENTREGADO') {
      mensaje = '¿Confirmar entrega?';
      detalles = `El pedido #${pedido.id} será marcado como entregado`;
    } else if (nuevoEstado === 'CANCELADO') {
      mensaje = '¿Cancelar pedido?';
      detalles = `El pedido #${pedido.id} será cancelado`;
    }
    
    setPendingAction({ 
      pedido, 
      nuevoEstado, 
      mensaje, 
      detalles 
    });
    setShowConfirmModal(true);
  }, []);

  const confirmarCambioEstado = async () => {
    if (!pendingAction) return;

    const { pedido, nuevoEstado } = pendingAction;
    const actual = pedido.estado || 'PENDIENTE';

    // Validación más flexible para permitir transiciones
    const transicionesValidas = getTransicionesInteligentes(pedido, actual);
    if (!transicionesValidas || !transicionesValidas.includes(nuevoEstado)) {
      console.warn(`Transición no válida: ${actual} -> ${nuevoEstado}`);
      // Permitir la transición de todas formas para casos especiales
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedido.id);
      
      if (error) {
        console.error('Error al actualizar en Supabase:', error);
        throw error;
      }

      // Actualizar estado local
      setPedidos(pedidos => pedidos.map(p => 
        p.id === pedido.id ? { ...p, estado: nuevoEstado } : p
      ));
      
      // Mostrar notificación de éxito
      addNotification(`Estado cambiado a ${getEstadoInfo(nuevoEstado).label} - Pedido #${pedido.id} actualizado correctamente`, 'success');
      
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      // Mostrar notificación de error
      addNotification('Error al cambiar estado - No se pudo actualizar el pedido en la base de datos', 'error');
      
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  const bulkChangeStatus = async (nuevoEstado) => {
    if (selectedPedidos.size === 0) return;

    try {
      const pedidoIds = Array.from(selectedPedidos);
      await supabase.from('pedidos').update({ estado: nuevoEstado }).in('id', pedidoIds);
      setPedidos(pedidos => pedidos.map(p => 
        selectedPedidos.has(p.id) ? { ...p, estado: nuevoEstado } : p
      ));
      setSelectedPedidos(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error en cambio masivo de estado:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Producto', 'Cantidad', 'Teléfono', 'Dirección', 'Precio', 'Estado', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...pedidosFiltrados.map(pedido => [
        pedido.id,
        `"${pedido.nombre || ''}"`,
        `"${pedido.producto || ''}"`,
        pedido.cantidad || 1,
        `"${pedido.telefono || ''}"`,
        `"${pedido.direccion || ''}"`,
        pedido.precio_total || 0,
        pedido.estado || 'PENDIENTE',
        new Date(pedido.created_at).toLocaleString('es-CL')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_quenitas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para generar boleta simplificada (para cocina)
  const generarBoletaSimplificada = async (pedido) => {
    const doc = new jsPDF();
    let y = 20;

    // Header con logo y diseño mejorado
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo en la esquina superior derecha
    try {
      const logoBase64 = await loadImageAsBase64(logoQuenitas);
      doc.addImage(logoBase64, 'JPEG', 160, 8, 30, 30);
    } catch (error) {
      // Fallback si no carga el logo
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('🍔', 175, 25);
    }

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('COCINA - Quenita\'s', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Pedido #${pedido.id}`, 105, 32, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = 55;

    // Título de la boleta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PEDIDO PARA PREPARAR', 105, y, { align: 'center' });
    y += 20;

    // Línea separadora
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(15, y, 195, y);
    y += 15;

    // Información del pedido en secciones organizadas
    const leftMargin = 15;
    const sectionWidth = 85;
    const rightMargin = 110;

    // Sección 1: Información básica
    doc.setFillColor(240, 248, 255);
    doc.rect(leftMargin, y, sectionWidth, 35, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.rect(leftMargin, y, sectionWidth, 35, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('INFORMACIÓN BÁSICA', leftMargin + 5, y + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${pedido.nombre || 'N/A'}`, leftMargin + 5, y + 18);
    doc.text(`Producto: ${pedido.producto || 'N/A'}`, leftMargin + 5, y + 25);
    doc.text(`Cantidad: ${pedido.cantidad || 1}`, leftMargin + 5, y + 32);

    // Sección 2: Información de entrega
    doc.setFillColor(255, 248, 240);
    doc.rect(rightMargin, y, sectionWidth, 35, 'F');
    doc.setDrawColor(255, 140, 0);
    doc.rect(rightMargin, y, sectionWidth, 35, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 140, 0);
    doc.text('INFORMACIÓN DE ENTREGA', rightMargin + 5, y + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const esDomicilio = esPedidoDomicilio(pedido);
    doc.text(`Tipo: ${esDomicilio ? 'Domicilio' : 'Retiro'}`, rightMargin + 5, y + 18);
    
    if (pedido.bebida) {
      doc.text(`Bebida: ${pedido.bebida}`, rightMargin + 5, y + 25);
    }
    
    if (esDomicilio && pedido.direccion) {
      doc.text('Dirección incluida', rightMargin + 5, y + 32);
    } else {
      doc.text('Retiro en local', rightMargin + 5, y + 32);
    }

    y += 45;

    // Sección 3: Instrucciones de preparación
    doc.setFillColor(240, 255, 240);
    doc.rect(leftMargin, y, 180, 40, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.rect(leftMargin, y, 180, 40, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text('INSTRUCCIONES DE PREPARACIÓN', leftMargin + 5, y + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    try {
      const pers = pedido.personalizacion ? JSON.parse(pedido.personalizacion) : {};
      const included = Object.entries(pers).filter(([,v]) => v).map(([k]) => k);
      
      if (included.length > 0) {
        doc.text('✅ INCLUIR:', leftMargin + 5, y + 18);
        included.forEach((ing, index) => {
          if (index < 4) { // Máximo 4 ingredientes por línea
            doc.text(`• ${ing}`, leftMargin + 5 + (index * 40), y + 28);
          }
        });
      } else {
        doc.text('🍽️ Preparar según receta estándar', leftMargin + 5, y + 18);
      }
    } catch {
      doc.text('🍽️ Preparar según receta estándar', leftMargin + 5, y + 18);
    }

    y += 50;

    // Sección 4: Observaciones (si las hay)
    if (pedido.resumen) {
      doc.setFillColor(255, 255, 240);
      doc.rect(leftMargin, y, 180, 20, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.rect(leftMargin, y, 180, 20, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(245, 158, 11);
      doc.text('OBSERVACIONES', leftMargin + 5, y + 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(pedido.resumen, leftMargin + 5, y + 18);
      
      y += 30;
    }

    // Línea separadora final
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(15, y, 195, y);
    y += 15;

    // Sección final: Estado y total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, leftMargin, y);
    
    doc.setFontSize(16);
    doc.text(`Total: $${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP`, 105, y, { align: 'center' });

    y += 20;

    // Pie de página
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 105, y, { align: 'center' });
    doc.text('¡Gracias por elegir Quenita\'s!', 105, y + 5, { align: 'center' });

    // Guardar el PDF
    doc.save(`boleta_cocina_${pedido.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función para generar boleta completa mejorada
  const generarBoletaCompleta = (pedido) => {
    generarBoletaPDF(pedido);
  };

  // Función para generar boletas en lote
  const generarBoletasEnLote = (pedidos) => {
    if (pedidos.length === 0) {
      alert('No hay pedidos seleccionados para generar boletas');
      return;
    }

    // Generar boletas para todos los pedidos seleccionados
    pedidos.forEach((pedido, index) => {
      setTimeout(() => {
        generarBoletaSimplificada(pedido);
      }, index * 500); // Espaciado de 500ms entre cada boleta
    });

    alert(`Generando ${pedidos.length} boletas...`);
  };

  // Función para generar boletas de pedidos filtrados
  const generarBoletasFiltradas = () => {
    if (pedidosFiltrados.length === 0) {
      alert('No hay pedidos para generar boletas');
      return;
    }

    const confirmacion = confirm(`¿Generar boletas para ${pedidosFiltrados.length} pedidos?`);
    if (confirmacion) {
      generarBoletasEnLote(pedidosFiltrados);
    }
  };

  // Funciones para el calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const getWeekDays = () => {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
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

  const getPedidosForWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return pedidos.filter(pedido => {
      const pedidoDate = new Date(pedido.created_at);
      return pedidoDate >= startOfWeek && pedidoDate <= endOfWeek;
    });
  };

  // Función para obtener pedidos filtrados con soporte para calendario
  const getPedidosFiltradosConCalendario = useCallback(() => {
    let filtered = pedidosFiltrados;

    // Filtro por fecha si el calendario está activo y hay una fecha seleccionada
    if (showCalendar) {
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(pedido => {
        const pedidoDate = new Date(pedido.created_at);
        return pedidoDate >= selectedDateStart && pedidoDate <= selectedDateEnd;
      });
    }

    return filtered;
  }, [pedidosFiltrados, showCalendar, selectedDate]);

  const pedidosPorEstado = ESTADOS.reduce((acc, est) => {
    acc[est.key] = pedidosFiltrados.filter(p => (p.estado || 'PENDIENTE') === est.key);
    return acc;
  }, {});

  // Componente de Tooltip
  const Tooltip = ({ children, content, position = 'top' }) => {
    const [show, setShow] = useState(false);
    
    return (
      <div 
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        {show && showTooltips && (
          <div style={{
            position: 'absolute',
            zIndex: 1000,
            background: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8em',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            ...(position === 'top' && { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }),
            ...(position === 'bottom' && { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }),
            ...(position === 'left' && { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }),
            ...(position === 'right' && { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' })
          }}>
            {content}
            <div style={{
              position: 'absolute',
              width: 0,
              height: 0,
              border: '4px solid transparent',
              ...(position === 'top' && { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: '#1f2937' }),
              ...(position === 'bottom' && { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: '#1f2937' }),
              ...(position === 'left' && { left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: '#1f2937' }),
              ...(position === 'right' && { right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: '#1f2937' })
            }} />
          </div>
        )}
      </div>
    );
  };

  // Componente de Notificaciones
  const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => onClose(notification.id), 5000);
      return () => clearTimeout(timer);
    }, [notification.id, onClose]);

    const getIcon = () => {
      switch (notification.type) {
        case 'success': return <FiCheckCircle />;
        case 'error': return <FiXCircle />;
        case 'warning': return <FiAlertCircle />;
        default: return <FiInfo />;
      }
    };

    const getColor = () => {
      switch (notification.type) {
        case 'success': return '#10B981';
        case 'error': return '#EF4444';
        case 'warning': return '#F59E0B';
        default: return '#3B82F6';
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'white',
        border: `2px solid ${getColor()}`,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{ color: getColor(), fontSize: '1.2em' }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {notification.message}
          </div>
          <div style={{ fontSize: '0.8em', color: '#6B7280' }}>
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '1.1em'
          }}
        >
          <FiX />
        </button>
      </div>
    );
  };

  // Función para cerrar notificaciones
  const closeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Función para agregar notificación
  const addNotification = useCallback((message, type = 'info') => {
    setNotifications(prev => [
      ...prev,
      {
        id: Date.now(),
        message,
        type,
        timestamp: new Date()
      }
    ]);
  }, []);


  // Configuración del sidebar
  const sidebarConfig = {
    menuItems: [
      {
        id: 'orders',
        label: 'Gestión de Pedidos',
        icon: <FiShoppingCart />,
        badge: pedidos.filter(p => !['ENTREGADO', 'CANCELADO'].includes(p.estado || 'PENDIENTE')).length
      },
      {
        id: 'cocina',
        label: 'Panel de Cocina',
        icon: <FiPackage />,
        badge: pedidos.filter(p => ['PENDIENTE', 'EN_PREPARACION'].includes(p.estado || 'PENDIENTE') && p.estado !== 'CANCELADO').length
      },
      {
        id: 'caja',
        label: 'Panel de Caja',
        icon: <FiDollarSign />,
        badge: pedidos.filter(p => ['LISTO', 'PAGADO'].includes(p.estado) && p.estado !== 'CANCELADO').length
      },
      {
        id: 'cajero',
        label: 'Panel de Cajero',
        icon: <FiUser />,
        badge: pedidos.filter(p => p.estado === 'PENDIENTE' && p.estado !== 'CANCELADO').length
      },
      {
        id: 'repartidor',
        label: 'Panel de Repartidor',
        icon: <FiTruck />,
        badge: pedidos.filter(p => {
          const esDomicilio = esPedidoDomicilio(p);
          return ['EN_ENTREGA', 'LISTO'].includes(p.estado) && esDomicilio && p.estado !== 'CANCELADO';
        }).length
      },
      {
        id: 'calendario',
        label: 'Calendario',
        icon: <FiCalendar />,
        badge: pedidos.filter(p => {
          const today = new Date().toDateString();
          const pedidoDate = new Date(p.created_at).toDateString();
          return today === pedidoDate && p.estado !== 'CANCELADO';
        }).length
      }
    ],
    userInfo: {
      name: 'Administrador',
      role: 'Admin',
      avatar: logoQuenitas
    }
  };

  // Función para renderizar el contenido según la sección activa
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
      default:
        return renderOrdersSection();
    }
  };

  // Sección de Pedidos (contenido original del AdminPanel)
  const renderOrdersSection = () => {
    return (
      <div className="orders-section">
        {/* Header mejorado con estadísticas rápidas */}
        <div className="orders-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              📋 Gestión de Pedidos
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
              {pedidos.length} pedidos totales • {pedidos.filter(p => !['ENTREGADO', 'CANCELADO'].includes(p.estado || 'PENDIENTE')).length} activos
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              {viewMode === 'table' ? '📊 Vista Kanban' : '📋 Vista Tabla'}
            </button>
            <button
              onClick={() => fetchPedidos(true)}
              disabled={isRefreshing}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              {isRefreshing ? '🔄 Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        {/* Controles avanzados */}
        <div className="admin-controls" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 20,
          padding: '20px',
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          
          {/* Filtros principales */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <FiFilter style={{ fontSize: '1.2em', color: 'var(--text-secondary)' }} />
            <div style={{fontWeight: 700, color: 'var(--text-primary)'}}>
              Filtros:
            </div>
            
            {/* Filtro por estado */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterEstado('TODOS')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterEstado === 'TODOS' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: filterEstado === 'TODOS' ? 'white' : 'var(--text-secondary)',
                  border: filterEstado === 'TODOS' ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
                  boxShadow: filterEstado === 'TODOS' ? '0 4px 8px rgba(37, 99, 235, 0.2)' : 'none'
                }}>
                Todos
              </button>
              {ESTADOS.map(estado => (
                <button
                  key={estado.key}
                  onClick={() => setFilterEstado(estado.key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: filterEstado === estado.key ? estado.color : 'var(--bg-tertiary)',
                    color: filterEstado === estado.key ? estado.text : 'var(--text-secondary)',
                    border: `2px solid ${filterEstado === estado.key ? estado.border : 'var(--border-color)'}`,
                    boxShadow: filterEstado === estado.key ? `0 4px 8px ${estado.border}33` : 'none'
                  }}
                >
                  {estado.icon} {estado.label}
                </button>
              ))}
            </div>

            {/* Filtro por tipo */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterTipo('TODOS')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTipo === 'TODOS' ? '#10B981' : 'var(--bg-tertiary)',
                  color: filterTipo === 'TODOS' ? 'white' : 'var(--text-secondary)',
                  border: filterTipo === 'TODOS' ? '2px solid #10B981' : '2px solid var(--border-color)',
                  boxShadow: filterTipo === 'TODOS' ? '0 4px 8px rgba(16, 185, 129, 0.2)' : 'none'
                }}>
                🏠 Todos
              </button>
              <button
                onClick={() => setFilterTipo('DOMICILIO')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTipo === 'DOMICILIO' ? '#10B981' : 'var(--bg-tertiary)',
                  color: filterTipo === 'DOMICILIO' ? 'white' : 'var(--text-secondary)',
                  border: filterTipo === 'DOMICILIO' ? '2px solid #10B981' : '2px solid var(--border-color)',
                  boxShadow: filterTipo === 'DOMICILIO' ? '0 4px 8px rgba(16, 185, 129, 0.2)' : 'none'
                }}>
                🚚 Domicilio
              </button>
              <button
                onClick={() => setFilterTipo('RETIRO')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTipo === 'RETIRO' ? '#3B82F6' : 'var(--bg-tertiary)',
                  color: filterTipo === 'RETIRO' ? 'white' : 'var(--text-secondary)',
                  border: filterTipo === 'RETIRO' ? '2px solid #3B82F6' : '2px solid var(--border-color)',
                  boxShadow: filterTipo === 'RETIRO' ? '0 4px 8px rgba(59, 130, 246, 0.2)' : 'none'
                }}>
                🏪 Retiro
              </button>
            </div>

            {/* Filtro por tiempo */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterTiempo('TODOS')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTiempo === 'TODOS' ? '#F59E0B' : 'var(--bg-tertiary)',
                  color: filterTiempo === 'TODOS' ? 'white' : 'var(--text-secondary)',
                  border: filterTiempo === 'TODOS' ? '2px solid #F59E0B' : '2px solid var(--border-color)',
                  boxShadow: filterTiempo === 'TODOS' ? '0 4px 8px rgba(245, 158, 11, 0.2)' : 'none'
                }}>
                ⏰ Todos
              </button>
              <button
                onClick={() => setFilterTiempo('HOY')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTiempo === 'HOY' ? '#F59E0B' : 'var(--bg-tertiary)',
                  color: filterTiempo === 'HOY' ? 'white' : 'var(--text-secondary)',
                  border: filterTiempo === 'HOY' ? '2px solid #F59E0B' : '2px solid var(--border-color)',
                  boxShadow: filterTiempo === 'HOY' ? '0 4px 8px rgba(245, 158, 11, 0.2)' : 'none'
                }}>
                📅 Hoy
              </button>
              <button
                onClick={() => setFilterTiempo('URGENTE')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: filterTiempo === 'URGENTE' ? '#EF4444' : 'var(--bg-tertiary)',
                  color: filterTiempo === 'URGENTE' ? 'white' : 'var(--text-secondary)',
                  border: filterTiempo === 'URGENTE' ? '2px solid #EF4444' : '2px solid var(--border-color)',
                  boxShadow: filterTiempo === 'URGENTE' ? '0 4px 8px rgba(239, 68, 68, 0.2)' : 'none'
                }}>
                ⚡ Urgente
              </button>
            </div>
          </div>

          {/* Búsqueda y acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, width: '100%', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 300 }}>
              <FiSearch style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                id="admin-search"
                name="admin-search"
                placeholder="Buscar por nombre, producto, dirección o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            {/* Acciones en lote */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => bulkChangeStatus('EN_PREPARACION')}
                disabled={selectedPedidos.size === 0}
                style={{
                  padding: '10px 16px',
                  background: selectedPedidos.size > 0 ? '#3B82F6' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: selectedPedidos.size > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                ⚡ Preparar ({selectedPedidos.size})
              </button>
              <button
                onClick={() => bulkChangeStatus('LISTO')}
                disabled={selectedPedidos.size === 0}
                style={{
                  padding: '10px 16px',
                  background: selectedPedidos.size > 0 ? '#10B981' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: selectedPedidos.size > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                ✅ Listo ({selectedPedidos.size})
              </button>
              <button
                onClick={() => bulkChangeStatus('ENTREGADO')}
                disabled={selectedPedidos.size === 0}
                style={{
                  padding: '10px 16px',
                  background: selectedPedidos.size > 0 ? '#059669' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: selectedPedidos.size > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                🎉 Entregar ({selectedPedidos.size})
              </button>
            </div>
          </div>

          {/* Información de filtros activos */}
          {(filterEstado !== 'TODOS' || filterTipo !== 'TODOS' || filterTiempo !== 'TODOS' || searchTerm) && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <FiInfo style={{ color: '#F59E0B' }} />
              <span style={{ color: '#92400E', fontWeight: 600 }}>
                Filtros activos: 
                {filterEstado !== 'TODOS' && ` Estado: ${getEstadoInfo(filterEstado).label}`}
                {filterTipo !== 'TODOS' && ` Tipo: ${filterTipo}`}
                {filterTiempo !== 'TODOS' && ` Tiempo: ${filterTiempo}`}
                {searchTerm && ` Búsqueda: "${searchTerm}"`}
              </span>
              <button
                onClick={() => {
                  setFilterEstado('TODOS');
                  setFilterTipo('TODOS');
                  setFilterTiempo('TODOS');
                  setSearchTerm('');
                }}
                style={{
                  marginLeft: 'auto',
                  padding: '4px 8px',
                  background: '#F59E0B',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Contenido según modo de vista */}
        {viewMode === 'kanban' ? renderKanbanView() : renderTableView()}
      </div>
    );
  };

  // Vista Kanban mejorada
  const renderKanbanView = () => {
    const columnas = [
      { key: 'PENDIENTE', titulo: '🕐 Pendientes', color: '#FFF9DB' },
      { key: 'EN_PREPARACION', titulo: '👨‍🍳 En Preparación', color: '#E0F7FA' },
      { key: 'LISTO', titulo: '✅ Listos', color: '#F3E8FF' },
      { key: 'EN_ENTREGA', titulo: '🚚 En Entrega', color: '#FEF3C7' },
      { key: 'ENTREGADO', titulo: '🎉 Entregados', color: '#E6F9ED' }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        padding: '20px 0'
      }}>
        {columnas.map(columna => {
          const pedidosColumna = pedidosFiltrados.filter(p => p.estado === columna.key);
          
          return (
            <div key={columna.key} style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header de columna */}
              <div style={{
                padding: '16px',
                background: columna.color,
                borderBottom: '1px solid var(--border-color)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontWeight: 700, color: '#374151' }}>
                  {columna.titulo}
                </h3>
                <span style={{
                  background: 'rgba(0,0,0,0.1)',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {pedidosColumna.length}
                </span>
              </div>

              {/* Contenido de columna */}
              <div style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                maxHeight: '500px'
              }}>
                {pedidosColumna.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                  }}>
                    No hay pedidos
                  </div>
                ) : (
                  pedidosColumna.map(pedido => (
                    <div key={pedido.id} style={{
                      background: 'white',
                      borderRadius: 8,
                      padding: '12px',
                      marginBottom: '8px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onClick={() => setSelectedPedido(selectedPedido?.id === pedido.id ? null : pedido)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, color: '#374151' }}>
                          {pedido.nombre || 'Cliente'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {formatElapsedTime(pedido.created_at)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '8px' }}>
                        {pedido.producto} x{pedido.cantidad || 1}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                          ${(pedido.precio_total || 0).toLocaleString()}
                        </div>
                        <div style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: '0.7rem',
                          background: esPedidoDomicilio(pedido) ? '#E6F9ED' : '#E0F7FA',
                          color: esPedidoDomicilio(pedido) ? '#059669' : '#2563EB'
                        }}>
                          {esPedidoDomicilio(pedido) ? '🚚' : '🏪'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Vista Tabla mejorada
  const renderTableView = () => {
    return (
      <div className="admin-table" style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
            <div className="spinner"></div>
            <p>Cargando pedidos...</p>
          </div>
        )}
        {!loading && pedidosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
            <p>No se encontraron pedidos.</p>
          </div>
        )}
        {!loading && pedidosFiltrados.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>👤</div>
                  </th>
                  <th style={{ width: '120px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Cliente</div>
                  </th>
                  <th>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Producto</div>
                  </th>
                  <th style={{ width: '120px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Teléfono</div>
                  </th>
                  <th style={{ width: '100px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Entrega</div>
                  </th>
                  <th style={{ width: '80px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Precio</div>
                  </th>
                  <th style={{ width: '120px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Estado</div>
                  </th>
                  <th style={{ width: '100px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Tiempo</div>
                  </th>
                  <th style={{ width: '150px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Acciones</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(pedido => renderPedidoTableRow(pedido))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Sección de Cocina
  const renderCocinaSection = () => {
    const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE');
    const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION');
    
    return (
      <div className="cocina-section">
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
            👨‍🍳 Panel de Cocina
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Vista previa de pedidos pendientes y en preparación. Accede al panel completo para gestión detallada.
          </p>
          
          {/* Estadísticas rápidas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '1.1em' }}>
                📋 Pendientes
              </h3>
              <p style={{ color: 'var(--accent-primary)', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
                {pedidosPendientes.length}
              </p>
            </div>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '1.1em' }}>
                ⏳ En Preparación
              </h3>
              <p style={{ color: '#f59e0b', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
                {pedidosEnPreparacion.length}
              </p>
            </div>
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '1.1em' }}>
                🍳 Total Activos
              </h3>
              <p style={{ color: '#10b981', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>
                {pedidosPendientes.length + pedidosEnPreparacion.length}
              </p>
            </div>
          </div>

          {/* Vista previa de pedidos pendientes */}
          {pedidosPendientes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                📋 Pedidos Pendientes ({pedidosPendientes.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {pedidosPendientes.slice(0, 3).map(pedido => (
                  <div key={pedido.id} style={{
                    background: 'var(--bg-tertiary)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>#{pedido.id}</strong>
                      <span style={{ color: '#ef4444', fontSize: '0.8em', fontWeight: 'bold' }}>
                        {formatElapsedTime(pedido.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                      {pedido.nombre || 'Sin nombre'}
                    </p>
                    <p style={{ margin: '5px 0', color: 'var(--text-muted)', fontSize: '0.8em' }}>
                      {pedido.producto || 'Producto no especificado'}
                    </p>
                    {pedidosPendientes.length > 3 && (
                      <p style={{ margin: '10px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8em', fontStyle: 'italic' }}>
                        +{pedidosPendientes.length - 3} pedidos más...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista previa de pedidos en preparación */}
          {pedidosEnPreparacion.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                ⏳ En Preparación ({pedidosEnPreparacion.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {pedidosEnPreparacion.slice(0, 3).map(pedido => (
                  <div key={pedido.id} style={{
                    background: 'var(--bg-tertiary)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>#{pedido.id}</strong>
                      <span style={{ color: '#f59e0b', fontSize: '0.8em', fontWeight: 'bold' }}>
                        {formatElapsedTime(pedido.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                      {pedido.nombre || 'Sin nombre'}
                    </p>
                    <p style={{ margin: '5px 0', color: 'var(--text-muted)', fontSize: '0.8em' }}>
                      {pedido.producto || 'Producto no especificado'}
                    </p>
                    {pedidosEnPreparacion.length > 3 && (
                      <p style={{ margin: '10px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8em', fontStyle: 'italic' }}>
                        +{pedidosEnPreparacion.length - 3} pedidos más...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de acceso directo */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              🚀 Acceso Directo al Panel Completo
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '15px' }}>
              Accede al panel completo de cocina para gestionar todos los pedidos en tiempo real con funcionalidades avanzadas.
            </p>
            <button 
              onClick={() => window.location.href = '/cocina'}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-primary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              🍳 Ir al Panel de Cocina
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sección de Caja
  const renderCajaSection = () => (
    <div className="caja-section">
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
          💰 Panel de Caja
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Gestión de pagos y pedidos listos para entrega.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              ✅ Pedidos Listos
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
              {pedidos.filter(p => p.estado === 'LISTO').length} pedidos listos para entrega
            </p>
          </div>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              💳 Gestión de Pagos
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
              Procesa pagos y gestiona entregas
            </p>
          </div>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            gridColumn: 'span 2'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              🚀 Acceso Directo
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '15px' }}>
              Accede al panel completo de caja para gestionar pagos y entregas.
            </p>
            <button 
              onClick={() => setRoute('/caja')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-primary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              💰 Ir al Panel de Caja
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Sección de Cajero con flujo completo de tomar pedidos
  const renderCajeroSection = () => {

    // Productos disponibles
    const PRODUCTOS = [
      { id: 1, name: "Completo Italiano", price: 2500, category: "completos", image: "/src/assets/completo-italiano.jpg" },
      { id: 2, name: "Completo Clásico", price: 2200, category: "completos", image: "/src/assets/completo-italiano.jpg" },
      { id: 3, name: "Completo Especial", price: 2800, category: "completos", image: "/src/assets/completo-italiano.jpg" },
      { id: 4, name: "Churrasco", price: 3500, category: "sándwiches", image: "/src/assets/churrasco.png" },
      { id: 5, name: "Barros Luco", price: 3200, category: "sándwiches", image: "/src/assets/barro-luco.jpg" },
      { id: 6, name: "Papas Fritas", price: 1800, category: "acompañamientos", image: "/src/assets/papas-fritas.jpg" },
      { id: 7, name: "Empanada de Queso", price: 1500, category: "acompañamientos", image: "/src/assets/empanada-de-quesoo.png" }
    ];

    const BEBIDAS = [
      { id: 1, name: "Coca-Cola", price: 800, image: "https://via.placeholder.com/200x120/ff0000/ffffff?text=Coca-Cola" },
      { id: 2, name: "Fanta", price: 800, image: "https://via.placeholder.com/200x120/ff8800/ffffff?text=Fanta" },
      { id: 3, name: "Sprite", price: 800, image: "https://via.placeholder.com/200x120/00ff00/ffffff?text=Sprite" },
      { id: 4, name: "Café", price: 400, image: "https://via.placeholder.com/200x120/8B4513/ffffff?text=Café" },
      { id: 5, name: "Té", price: 300, image: "https://via.placeholder.com/200x120/228B22/ffffff?text=Té" }
    ];

    const agregarAlCarrito = (item) => {
      setCarrito(prev => {
        const existingItem = prev.find(cartItem => cartItem.name === item.name);
        
        if (existingItem) {
          return prev.map(cartItem => 
            cartItem.name === item.name 
              ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
              : cartItem
          );
        } else {
          return [...prev, { ...item, id: Date.now(), quantity: 1 }];
        }
      });
    };

    const removerDelCarrito = (index) => {
      setCarrito(prev => prev.filter((_, i) => i !== index));
    };

    const aumentarCantidad = (index) => {
      setCarrito(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      ));
    };

    const disminuirCantidad = (index) => {
      setCarrito(prev => prev.map((item, i) => {
        if (i === index) {
          const newQuantity = (item.quantity || 1) - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }));
    };

    const calcularTotal = () => {
      return carrito.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    const calcularCambio = () => {
      const total = calcularTotal();
      const recibido = parseFloat(montoRecibido) || 0;
      return Math.max(0, recibido - total);
    };

    const validarTelefono = (telefono) => {
      const telefonoLimpio = telefono.replace(/\s/g, '');
      const regex = /^(\+569|569|9)\d{8}$/;
      return regex.test(telefonoLimpio);
    };

    const limpiarTodo = () => {
      setCarrito([]);
      setClienteNombre('');
      setTelefono('');
      setTipoEntrega('retiro');
      setDireccion('');
      setObservaciones('');
      setMontoRecibido('');
      setMetodoPago('efectivo');
      setNumeroTarjeta('');
    };

    const confirmarPedido = async () => {
      if (!clienteNombre.trim()) {
        alert('Por favor ingresa el nombre del cliente');
        return;
      }

      if (!telefono.trim()) {
        alert('Por favor ingresa el teléfono del cliente');
        return;
      }

      if (!validarTelefono(telefono)) {
        alert('Por favor ingresa un teléfono válido (formato: +56912345678)');
        return;
      }

      if (carrito.length === 0) {
        alert('Por favor agrega al menos un producto al carrito');
        return;
      }

      if (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) {
        alert('El monto recibido debe ser mayor o igual al total del pedido');
        return;
      }

      if ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim()) {
        alert('Por favor ingresa el número de tarjeta');
        return;
      }

      setCajeroLoading(true);

      try {
        const pedidoData = {
          nombre: clienteNombre.trim(),
          telefono: telefono.trim(),
          producto: carrito.map(item => `${item.name} x${item.quantity || 1}`).join(', '),
          precio_total: calcularTotal(),
          estado: 'PENDIENTE',
          direccion: tipoEntrega === 'domicilio' ? direccion : 'Retiro en local',
          tipo_entrega: tipoEntrega === 'retiro' ? 'Retiro en local' : 'Domicilio',
          bebida: carrito.filter(item => item.name.includes('Coca') || item.name.includes('Fanta') || item.name.includes('Sprite') || item.name.includes('Café') || item.name.includes('Té')).map(item => `${item.name} x${item.quantity || 1}`).join(', '),
          personalizacion: JSON.stringify(carrito.map(item => ({
            nombre: item.name,
            cantidad: item.quantity || 1,
            precio: item.price
          }))),
          resumen: observaciones ? observaciones : carrito.map(item => `${item.name} x${item.quantity || 1}`).join(', '),
          cantidad: carrito.reduce((total, item) => total + (item.quantity || 1), 0),
          metodo_pago: metodoPago
        };

        const { data, error } = await supabase
          .from('pedidos')
          .insert([pedidoData])
          .select();

        if (error) throw error;

        setPedidoConfirmado(data[0]);
        setShowCajeroConfirmModal(true);
        limpiarTodo();
        
        // Actualizar la lista de pedidos
        fetchPedidos(true);
      } catch (error) {
        console.error('Error creating pedido:', error);
        alert('Error al crear el pedido. Por favor intenta de nuevo.');
      } finally {
        setCajeroLoading(false);
      }
    };

    return (
      <div className="cajero-section">
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
            👤 Panel de Cajero - Tomar Pedido
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Interfaz completa para tomar pedidos de clientes con gestión de pagos.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '24px',
            minHeight: '600px'
          }}>
            {/* Panel izquierdo - Formulario y productos */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Información del cliente */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                  👤 Información del Cliente
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '15px'
                }}>
                  <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="+56912345678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Tipo de entrega */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '15px'
                }}>
                  <button
                    onClick={() => setTipoEntrega('retiro')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: tipoEntrega === 'retiro' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: tipoEntrega === 'retiro' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🏪 Retiro
                  </button>
                  <button
                    onClick={() => setTipoEntrega('domicilio')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: tipoEntrega === 'domicilio' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: tipoEntrega === 'domicilio' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🚚 Domicilio
                  </button>
                </div>

                {tipoEntrega === 'domicilio' && (
                  <input
                    type="text"
                    placeholder="Dirección de entrega"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      width: '100%',
                      marginBottom: '15px'
                    }}
                  />
                )}

                {/* Método de pago */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '15px'
                }}>
                  <button
                    onClick={() => setMetodoPago('efectivo')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: metodoPago === 'efectivo' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: metodoPago === 'efectivo' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    💰 Efectivo
                  </button>
                  <button
                    onClick={() => setMetodoPago('debito')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: metodoPago === 'debito' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: metodoPago === 'debito' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    💳 Débito
                  </button>
                  <button
                    onClick={() => setMetodoPago('credito')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: metodoPago === 'credito' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: metodoPago === 'credito' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    💳 Crédito
                  </button>
                </div>

                {metodoPago === 'efectivo' && (
                  <input
                    type="number"
                    placeholder="Monto recibido"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      width: '100%',
                      marginBottom: '15px'
                    }}
                  />
                )}

                {(metodoPago === 'debito' || metodoPago === 'credito') && (
                  <input
                    type="text"
                    placeholder="Número de tarjeta"
                    value={numeroTarjeta}
                    onChange={(e) => setNumeroTarjeta(e.target.value)}
                    maxLength={16}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      width: '100%',
                      marginBottom: '15px'
                    }}
                  />
                )}

                <textarea
                  placeholder="Observaciones especiales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    width: '100%',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Productos */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                  🍽️ Productos Disponibles
                </h3>

                {/* Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={() => setActiveTab('productos')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: activeTab === 'productos' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: activeTab === 'productos' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🍽️ Productos
                  </button>
                  <button
                    onClick={() => setActiveTab('bebidas')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: activeTab === 'bebidas' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: activeTab === 'bebidas' ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🥤 Bebidas
                  </button>
                </div>

                {/* Grid de productos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {(activeTab === 'productos' ? PRODUCTOS : BEBIDAS).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                      onClick={() => agregarAlCarrito(item)}
                    >
                      <div style={{
                        fontSize: '1.2rem',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        {item.image ? '🍽️' : '🥤'}
                      </div>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: 'var(--accent-primary)',
                        textAlign: 'center'
                      }}>
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel derecho - Carrito y resumen */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              height: 'fit-content'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
                🛒 Carrito de Pedido
              </h3>

              {carrito.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                  No hay productos en el carrito
                </p>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  {carrito.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)'
                        }}>
                          ${item.price.toLocaleString()} x {item.quantity || 1}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => disminuirCantidad(index)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => aumentarCantidad(index)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removerDelCarrito(index)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ef4444',
                            background: '#fef2f2',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumen */}
              <div style={{
                borderTop: '2px solid var(--border-color)',
                paddingTop: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    ${calcularTotal().toLocaleString()}
                  </span>
                </div>
                {metodoPago === 'efectivo' && montoRecibido && (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Recibido:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        ${parseFloat(montoRecibido).toLocaleString()}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Cambio:</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                        ${calcularCambio().toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--accent-primary)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px'
                }}>
                  <span>Total:</span>
                  <span>${calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={limpiarTodo}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Limpiar
                </button>
                <button
                  onClick={confirmarPedido}
                  disabled={cajeroLoading || carrito.length === 0}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: cajeroLoading || carrito.length === 0 ? 'var(--border-color)' : 'var(--accent-primary)',
                    color: 'white',
                    cursor: cajeroLoading || carrito.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  {cajeroLoading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          </div>

          {/* Modal de confirmación */}
          {showCajeroConfirmModal && pedidoConfirmado && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '16px'
                }}>
                  ✅
                </div>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                  ¡Pedido Confirmado!
                </h3>
                <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)' }}>
                  El pedido #{pedidoConfirmado.id} ha sido creado exitosamente.
                </p>
                <button
                  onClick={() => setShowCajeroConfirmModal(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};
  

  const renderRepartidorSection = () => (
    <div className="repartidor-section">
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
          🚚 Panel de Repartidor
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Gestión de entregas a domicilio y seguimiento de rutas.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              📍 Entregas Activas
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
              {pedidos.filter(p => p.estado === 'EN_ENTREGA').length} pedidos en entrega
            </p>
          </div>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              🗺️ Gestión de Rutas
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
              Optimización de rutas de entrega
            </p>
          </div>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            gridColumn: 'span 2'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
              🚀 Acceso Directo
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '15px' }}>
              Accede al panel completo de repartidor para gestionar entregas.
            </p>
            <button 
              onClick={() => setRoute('/repartidor')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-primary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              🚚 Ir al Panel de Repartidor
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Sección de Calendario
  const renderCalendarioSection = () => {
    // Calcular estadísticas del día seleccionado
    const getDayStats = (date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPedidos = pedidos.filter(pedido => {
        const pedidoDate = new Date(pedido.created_at);
        return pedidoDate >= dayStart && pedidoDate <= dayEnd;
      });

      const totalPedidos = dayPedidos.length;
      const totalIngresos = dayPedidos.reduce((sum, p) => sum + (p.precio_total || 0), 0);
      const pedidosEntregados = dayPedidos.filter(p => p.estado === 'ENTREGADO').length;
      const pedidosCancelados = dayPedidos.filter(p => p.estado === 'CANCELADO').length;

      return {
        total: totalPedidos,
        ingresos: totalIngresos,
        entregados: pedidosEntregados,
        cancelados: pedidosCancelados,
        pedidos: dayPedidos
      };
    };

    // Obtener días del mes
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days = [];
      
      // Días del mes anterior
      for (let i = 0; i < startingDay; i++) {
        const prevDate = new Date(year, month, -startingDay + i + 1);
        days.push({ date: prevDate, isCurrentMonth: false });
      }

      // Días del mes actual
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        days.push({ date: currentDate, isCurrentMonth: true });
      }

      // Completar la semana
      const remainingDays = 42 - days.length; // 6 semanas * 7 días
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({ date: nextDate, isCurrentMonth: false });
      }

      return days;
    };

    const days = getDaysInMonth(calendarCurrentDate);

    const navigateMonth = (direction) => {
      setCalendarCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + direction);
        return newDate;
      });
    };

    const getMonthName = (date) => {
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const getDayName = (date) => {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    };

    return (
      <div className="calendario-section">
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
              📅 Calendario de Pedidos
            </h2>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => navigateMonth(-1)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ←
              </button>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', minWidth: '200px', textAlign: 'center' }}>
                {getMonthName(calendarCurrentDate)}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Calendario */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            {/* Días de la semana */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px'
            }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {days.map(({ date, isCurrentMonth }, index) => {
                const dayStats = getDayStats(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = calendarSelectedDate && calendarSelectedDate.toDateString() === date.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => setCalendarSelectedDate(date)}
                    style={{
                      padding: '8px',
                      minHeight: '80px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: isToday ? 'var(--accent-primary)' : 
                                isCurrentMonth ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      color: isToday ? 'white' : 
                             isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (isCurrentMonth) {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isCurrentMonth) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {date.getDate()}
                    </div>
                    
                    {isCurrentMonth && dayStats.total > 0 && (
                      <div style={{
                        fontSize: '0.7rem',
                        lineHeight: '1.2'
                      }}>
                        <div style={{ color: isToday ? 'white' : 'var(--accent-primary)' }}>
                          📦 {dayStats.total}
                        </div>
                        <div style={{ color: isToday ? 'white' : 'var(--text-secondary)' }}>
                          💰 ${dayStats.ingresos.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalles del día seleccionado */}
          {calendarSelectedDate && (
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                📊 Estadísticas del {calendarSelectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {(() => {
                const stats = getDayStats(calendarSelectedDate);
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                        {stats.total}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Total Pedidos
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>
                        ${stats.ingresos.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Ingresos Totales
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                        {stats.entregados}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Entregados
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#DC2626' }}>
                        {stats.cancelados}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Cancelados
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Lista de pedidos del día */}
              {(() => {
                const stats = getDayStats(calendarSelectedDate);
                return stats.pedidos.length > 0 ? (
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      📋 Pedidos del Día
                    </h4>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}>
                      {stats.pedidos.map(pedido => {
                        const info = getEstadoInfo(pedido.estado || 'PENDIENTE');
                        return (
                          <div
                            key={pedido.id}
                            style={{
                              padding: '12px',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                              }}>
                                #{pedido.id} - {pedido.nombre}
                              </div>
                              <div style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.8rem'
                              }}>
                                {pedido.producto}
                              </div>
                              <div style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem'
                              }}>
                                {new Date(pedido.created_at).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                backgroundColor: info.color,
                                color: info.text,
                                border: `1px solid ${info.border}`
                              }}>
                                {info.label}
                              </span>
                              <div style={{
                                fontWeight: '600',
                                color: 'var(--accent-primary)',
                                fontSize: '0.9rem'
                              }}>
                                ${(pedido.precio_total || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                    No hay pedidos registrados para este día
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getIngredientesPorDefecto = (producto) => {
    const ingredientesPorProducto = {
      "Completo Italiano": ["Pan", "Vienesa", "Tomate", "Palta", "Mayonesa", "Chucrut", "Salsa Verde"],
      "Completo Especial": ["Pan", "Vienesa", "Tomate", "Palta", "Mayonesa", "Chucrut", "Salsa Verde", "Queso"],
      "Completo XL Italiano": ["Pan XL", "Vienesa XL", "Tomate", "Palta", "Mayonesa", "Chucrut", "Salsa Verde"],
      "Churrasco Italiano": ["Pan", "Carne", "Tomate", "Palta", "Mayonesa", "Chucrut", "Salsa Verde"],
      "ASS Italiano": ["Pan", "Vienesa", "Tomate", "Palta", "Mayonesa", "Chucrut", "Salsa Verde"],
      
      // Papas fritas
      "Papas Fritas Chicas": ["Papas", "Sal", "Ketchup", "Mayonesa"],
      "Papas Fritas Grandes": ["Papas", "Sal", "Ketchup", "Mayonesa"],
      
      // Empanadas
      "Empanada de Pollo Merken": ["Masa", "Pollo", "Merken", "Cebolla"],
      "Empanada de Queso": ["Masa", "Queso", "Salsa de Tomate"],
      
      // Otros productos
      "Churrasco Luco": ["Pan", "Carne", "Queso", "Palta"],
      "Fajita de Pollo": ["Salsa de Tomate", "Queso", "Crema", "Guacamole", "Salsa Picante"],
      "Pan Queso Caliente": ["Mantequilla", "Mermelada", "Miel", "Queso Extra"],
      
      // Bebidas
      "Coca-Cola": ["Coca-Cola"],
      "Fanta": ["Fanta"],
      "Té": ["Té"],
      "Café Americano": ["Café", "Agua Caliente"]
    };

    return ingredientesPorProducto[producto] || [];
  };

  const renderIngredientes = (personalizacion, producto = '') => {
    const ingredientesPorDefecto = getIngredientesPorDefecto(producto);

    if (!personalizacion) {
      return (
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 8,
          border: '2px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.9em',
            fontWeight: 600,
            color: '#475569',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            🍽️ PREPARAR SEGÚN RECETA ESTÁNDAR
          </div>
          {ingredientesPorDefecto.length > 0 && (
            <div style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: 6,
              border: '1px solid #bae6fd',
              fontSize: '0.8em',
              color: '#0369a1',
              fontWeight: 500
            }}>
              <strong>📋 Ingredientes por defecto:</strong> {ingredientesPorDefecto.join(', ')}
            </div>
          )}
        </div>
      );
    }

    try {
      let parsed = personalizacion;
      if (typeof personalizacion === 'string') {
        parsed = JSON.parse(personalizacion);
      }

      

      // Manejar array de objetos (nuevo formato - múltiples productos)
      if (Array.isArray(parsed)) {


        // Si es un array de arrays (múltiples productos con múltiples customizaciones)
        if (parsed.length > 0 && Array.isArray(parsed[0])) {
          const allCustomizations = parsed.flat().map(item => {
            if (typeof item === 'object' && item.name) {
              return item.name;
            } else if (typeof item === 'string') {
              return item;
            } else {
              console.warn('Formato de personalización inválido en array:', item);
              return null;
            }
          }).filter(Boolean);

          if (allCustomizations.length === 0) {
            return (
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <span style={{color:'#64748b', fontStyle:'italic', fontWeight: 500}}>
                  🍽️ Preparar según receta estándar
                </span>
                {ingredientesPorDefecto.length > 0 && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px',
                    background: '#f0f9ff',
                    borderRadius: 6,
                    border: '1px solid #bae6fd',
                    fontSize: '0.85em',
                    color: '#0369a1'
                  }}>
                    <strong>Ingredientes por defecto:</strong> {ingredientesPorDefecto.join(', ')}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{
                fontSize:'0.9em',
                fontWeight:700,
                color:'#059669',
                marginBottom:4,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                ✅ <span>INGREDIENTES A INCLUIR:</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {allCustomizations.map((ing, index) => (
                  <span key={`${ing}-${index}`} style={{
                    background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color:'white',
                    borderRadius:10,
                    padding:'8px 14px',
                    fontSize:'0.9em',
                    fontWeight:700,
                    boxShadow:'0 3px 8px rgba(16, 185, 129, 0.4)',
                    border:'2px solid #047857',
                    textShadow:'0 1px 2px rgba(0,0,0,0.2)',
                    position:'relative'
                  }}>
                    <span style={{
                      position:'absolute',
                      top:-2,
                      right:-2,
                      background:'#fbbf24',
                      color:'#92400e',
                      borderRadius:'50%',
                      width:16,
                      height:16,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:'0.6em',
                      fontWeight:900,
                      border:'1px solid #f59e0b'
                    }}>
                      ✓
                    </span>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        // Si es un array simple de objetos
        const customizations = parsed.map(item => {
          if (typeof item === 'object' && item.name) {
            return item.name;
          } else if (typeof item === 'string') {
            return item;
          } else {
            console.warn('Formato de personalización inválido:', item);
            return null;
          }
        }).filter(Boolean);

        if (customizations.length === 0) {
          return (
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <span style={{color:'#64748b', fontStyle:'italic', fontWeight: 500}}>
                🍽️ Preparar según receta estándar
              </span>
              {ingredientesPorDefecto.length > 0 && (
                <div style={{
                  marginTop: 8,
                  padding: '8px',
                  background: '#f0f9ff',
                  borderRadius: 6,
                  border: '1px solid #bae6fd',
                  fontSize: '0.85em',
                  color: '#0369a1'
                }}>
                  <strong>Ingredientes por defecto:</strong> {ingredientesPorDefecto.join(', ')}
                </div>
              )}
            </div>
          );
        }

        return (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{
              fontSize:'0.9em',
              fontWeight:700,
              color:'#059669',
              marginBottom:4,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              ✅ <span>INGREDIENTES A INCLUIR:</span>
            </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {customizations.map((ing, index) => (
                <span key={`${ing}-${index}`} style={{
                  background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color:'white',
                  borderRadius:10,
                  padding:'8px 14px',
                  fontSize:'0.9em',
                  fontWeight:700,
                  boxShadow:'0 3px 8px rgba(16, 185, 129, 0.4)',
                  border:'2px solid #047857',
                  textShadow:'0 1px 2px rgba(0,0,0,0.2)',
                  position:'relative'
                }}>
                  <span style={{
                    position:'absolute',
                    top:-2,
                    right:-2,
                    background:'#fbbf24',
                    color:'#92400e',
                    borderRadius:'50%',
                    width:16,
                    height:16,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'0.6em',
                    fontWeight:900,
                    border:'1px solid #f59e0b'
                  }}>
                    ✓
                  </span>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        );
      }

      // Manejar objeto simple (formato anterior) - este es el formato real que se usa
      
      const entries = Object.entries(parsed);
      const included = entries.filter(([,v]) => v).map(([k]) => k);
      const excluded = entries.filter(([,v]) => !v).map(([k]) => k);

      

      if (included.length === 0 && excluded.length === 0) {
        return (
          <div style={{
            padding: '12px',
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <span style={{color:'#64748b', fontStyle:'italic', fontWeight: 500}}>
              🍽️ Preparar según receta estándar
            </span>
            {ingredientesPorDefecto.length > 0 && (
              <div style={{
                marginTop: 8,
                padding: '8px',
                background: '#f0f9ff',
                borderRadius: 6,
                border: '1px solid #bae6fd',
                fontSize: '0.85em',
                color: '#0369a1'
              }}>
                <strong>Ingredientes por defecto:</strong> {ingredientesPorDefecto.join(', ')}
              </div>
            )}
          </div>
        );
      }

      return (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Ingredientes incluidos */}
          {included.length > 0 && (
            <div>
              <div style={{
                fontSize:'1em',
                fontWeight:700,
                color:'#059669',
                marginBottom:12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                borderRadius: 6,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                ✅ <span>INGREDIENTES A INCLUIR EN EL PEDIDO:</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {included.map((ing, index) => (
                  <span key={`include-${ing}-${index}`} style={{
                    background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color:'white',
                    borderRadius:8,
                    padding:'10px 16px',
                    fontSize:'0.9em',
                    fontWeight:700,
                    boxShadow:'0 3px 8px rgba(16, 185, 129, 0.3)',
                    border:'2px solid #047857',
                    textShadow:'0 1px 2px rgba(0,0,0,0.2)',
                    position:'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{
                      background:'#fbbf24',
                      color:'#92400e',
                      borderRadius:'50%',
                      width:18,
                      height:18,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:'0.7em',
                      fontWeight:900,
                      border:'1px solid #f59e0b',
                      flexShrink: 0
                    }}>
                      ✓
                    </span>
                    <span>{ing}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resumen para el chef */}
          <div style={{
            marginTop: 8,
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: 8,
            border: '2px solid #f59e0b',
            fontSize: '0.9em',
            color: '#92400e',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4
            }}>
              <span style={{fontSize: '1.1em'}}>🍳</span>
              <span style={{fontWeight: 700}}>INSTRUCCIÓN PARA EL CHEF:</span>
            </div>
            <div style={{
              fontSize: '0.95em',
              lineHeight: 1.4
            }}>
              {included.length > 0 ?
                `✅ INCLUIR: ${included.join(', ')}` : 
                '🍽️ Preparar según receta estándar'}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.warn('❌ Error parsing personalización:', error, personalizacion);
      return (
        <div style={{
          padding: '12px',
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <span style={{color:'#64748b', fontStyle:'italic', fontWeight: 500}}>
            🍽️ Preparar según receta estándar
          </span>
          {ingredientesPorDefecto.length > 0 && (
            <div style={{
              marginTop: 8,
              padding: '8px',
              background: '#f0f9ff',
              borderRadius: 6,
              border: '1px solid #bae6fd',
              fontSize: '0.85em',
              color: '#0369a1'
            }}>
              <strong>Ingredientes por defecto:</strong> {ingredientesPorDefecto.join(', ')}
            </div>
          )}
        </div>
      );
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay, year, month } = getDaysInMonth(selectedDate);
    const weekDays = getWeekDays();
    const today = new Date();
    
    const renderCalendarDay = (day, isCurrentMonth = true) => {
      const date = new Date(year, month, day);
      const pedidosForDay = getPedidosForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      const entregados = pedidosForDay.filter(p => p.estado === 'ENTREGADO').length;
      const cancelados = pedidosForDay.filter(p => p.estado === 'CANCELADO').length;
      const enProceso = pedidosForDay.filter(p => !['ENTREGADO', 'CANCELADO'].includes(p.estado)).length;
      const total = pedidosForDay.length;
      
      // Calcular ingresos del día
      const ingresos = pedidosForDay
        .filter(p => p.estado === 'ENTREGADO')
        .reduce((sum, p) => sum + (p.precio_total || 0), 0);
      
      return (
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          style={{
            minHeight: 40,
            padding: '3px',
            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 
                               isToday ? '#F59E0B' : 
                               isWeekend ? '#E5E7EB' : 'var(--border-color)'}`,
            background: isSelected ? 'linear-gradient(135deg, var(--accent-primary) 0%, #2563EB 100%)' : 
                       isToday ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 
                       isWeekend ? '#F9FAFB' : 'var(--bg-secondary)',
            color: isSelected ? 'white' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 3,
            boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 
                       isToday ? '0 1px 2px rgba(245, 158, 11, 0.1)' : 'none',
            overflow: 'hidden'
          }}
        >
          {/* Indicador de día actual */}
          {isToday && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
            }} />
          )}
          
          {/* Número del día */}
          <div style={{
            fontSize: '0.7em',
            fontWeight: isToday ? 700 : 600,
            color: isSelected ? 'white' : (isWeekend ? '#6B7280' : 'var(--text-primary)'),
            opacity: isCurrentMonth ? 1 : 0.4,
            textAlign: 'right',
            marginBottom: 1
          }}>
            {day}
          </div>
          
          {/* Contenido ultra compacto */}
          {total > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5, 
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              {entregados > 0 && (
                <div style={{
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#10B981',
                  color: isSelected ? 'white' : 'white',
                  fontSize: '0.55em',
                  padding: '1px 2px',
                  borderRadius: 2,
                  fontWeight: 600,
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <span>✓</span>
                  <span>{entregados}</span>
                </div>
              )}
              {cancelados > 0 && (
                <div style={{
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#EF4444',
                  color: isSelected ? 'white' : 'white',
                  fontSize: '0.55em',
                  padding: '1px 2px',
                  borderRadius: 2,
                  fontWeight: 600,
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <span>✕</span>
                  <span>{cancelados}</span>
                </div>
              )}
              {enProceso > 0 && (
                <div style={{
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#F59E0B',
                  color: isSelected ? 'white' : 'white',
                  fontSize: '0.55em',
                  padding: '1px 2px',
                  borderRadius: 2,
                  fontWeight: 600,
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <span>⏳</span>
                  <span>{enProceso}</span>
                </div>
              )}
              {ingresos > 0 && (
                <div style={{
                  fontSize: '0.5em',
                  fontWeight: 600,
                  color: isSelected ? '#10B981' : '#059669',
                  textAlign: 'center',
                  padding: '1px 2px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 2,
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
                }}>
                  ${ingresos.toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              fontSize: '0.5em',
              color: isSelected ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)',
              textAlign: 'center',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              -
            </div>
          )}
        </div>
      );
    };

    const renderWeekView = () => {
      const weekDays = getWeekDays();
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              Vista Semanal - {getMonthName(selectedDate)}
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                ← Semana Anterior
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Siguiente Semana →
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {weekDays.map(day => (
              <div key={day} style={{
                padding: '12px',
                textAlign: 'center',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
                borderRadius: 6
              }}>
                {day}
              </div>
            ))}
            
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + i);
              return renderCalendarDay(date.getDate(), true);
            })}
          </div>
        </div>
      );
    };

    return (
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        border: '1px solid var(--border-color)',
        padding: '10px',
        marginBottom: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Header ultra compacto */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              {getMonthName(selectedDate)}
            </span>
            <span style={{
              fontSize: '0.75em',
              color: 'var(--text-secondary)'
            }}>
              Total: {(() => {
                const pedidosMes = pedidos.filter(p => {
                  const pedidoDate = new Date(p.created_at);
                  return pedidoDate.getMonth() === selectedDate.getMonth() && 
                         pedidoDate.getFullYear() === selectedDate.getFullYear();
                });
                return pedidosMes.length;
              })()} Entregados: {(() => {
                const pedidosMes = pedidos.filter(p => {
                  const pedidoDate = new Date(p.created_at);
                  return pedidoDate.getMonth() === selectedDate.getMonth() && 
                         pedidoDate.getFullYear() === selectedDate.getFullYear();
                });
                return pedidosMes.filter(p => p.estado === 'ENTREGADO').length;
              })()}
            </span>
          </div>
          
          {/* Controles ultra compactos */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.7em',
                fontWeight: 500
              }}
            >
              ←
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--accent-primary)',
                background: 'var(--accent-primary)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.7em',
                fontWeight: 500
              }}
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.7em',
                fontWeight: 500
              }}
            >
              →
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {weekDays.map(day => (
            <div key={day} style={{
              padding: '4px 2px',
              textAlign: 'center',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              borderRadius: 3,
              fontSize: '0.7em'
            }}>
              {day}
            </div>
          ))}
          
          {Array.from({ length: startingDay }, (_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: 40 }} />
          ))}
          
          {Array.from({ length: daysInMonth }, (_, i) => renderCalendarDay(i + 1))}
        </div>
        
        {/* Leyenda ultra compacta */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          marginTop: '8px',
          padding: '6px 10px',
          background: 'var(--bg-tertiary)',
          borderRadius: 4,
          fontSize: '0.65em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 8,
              height: 8,
              background: '#10B981',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.5em',
              fontWeight: 700
            }}>
              ✓
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>Entregados</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 8,
              height: 8,
              background: '#EF4444',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.5em',
              fontWeight: 700
            }}>
              ✕
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>Cancelados</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 8,
              height: 8,
              background: '#F59E0B',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.5em',
              fontWeight: 700
            }}>
              ⏳
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>En Proceso</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPedidoTableRow = (pedido) => {
    const actual = pedido.estado || 'PENDIENTE';
    const info = getEstadoInfo(actual);
    
    return (
      <tr key={pedido.id} className="order-row" onClick={() => setSelectedPedido(selectedPedido?.id === pedido.id ? null : pedido)}>
        <td style={{ textAlign: 'center', width: '60px' }}>
          <div style={{
            background: info.border,
            color: info.text,
            border: `2px solid ${info.border}`,
            fontWeight: 700,
            fontSize: '0.9rem',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            margin: '0 auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}
          </div>
        </td>
        <td style={{ fontWeight: 600, color: '#1f2937', width: '120px' }}>
          <div style={{ fontSize: '0.9rem' }}>
          {pedido.nombre || 'Cliente'}
          </div>
        </td>
        <td className="product-cell">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              {pedido.producto || 'Producto'} x{pedido.cantidad || 1}
            </div>
            {pedido.personalizacion && (() => {
              try {
                const parsed = JSON.parse(pedido.personalizacion);
                const included = Array.isArray(parsed) ? 
                  parsed.filter(item => typeof item === 'object' && item.name ? item.name : item).filter(Boolean) :
                  Object.entries(parsed).filter(([,v]) => v).map(([k]) => k);
                
                if (included.length > 0) {
                  return (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      fontSize: '0.7em'
                    }}>
                      <span style={{
                        color: '#059669',
                        fontWeight: 600,
                        fontSize: '0.65em'
                      }}>
                        ✅:
                      </span>
                      {included.slice(0, 2).map((ing, index) => (
                        <span key={index} style={{
                          padding: '1px 4px',
                          background: '#10B981',
                          color: 'white',
                          borderRadius: 3,
                          fontSize: '0.6em',
                          fontWeight: 600
                        }}>
                          {typeof ing === 'object' && ing !== null ? ing.name : ing}
                        </span>
                      ))}
                      {included.length > 2 && (
                        <span style={{
                          padding: '1px 4px',
                          background: '#F59E0B',
                          color: 'white',
                          borderRadius: 3,
                          fontSize: '0.6em',
                          fontWeight: 600
                        }}>
                          +{included.length - 2}
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              } catch {
                return null;
              }
            })()}
          </div>
        </td>
        <td style={{ color: '#6b7280', width: '120px' }}>
          <div style={{ fontSize: '0.85rem' }}>
          {pedido.telefono || 'N/A'}
          </div>
        </td>
        <td style={{ width: '100px' }}>
          <span className="status-badge" style={{
            color: esPedidoDomicilio(pedido) ? '#059669' : '#2563eb',
            background: esPedidoDomicilio(pedido) ? '#e6f9ed' : '#e0f7fa',
            border: `1px solid ${esPedidoDomicilio(pedido) ? '#10b981' : '#0ea5e9'}`
          }}>
            {esPedidoDomicilio(pedido) ? 'Domicilio' : 'Retiro'}
          </span>
        </td>
        <td style={{ fontWeight: 700, color: '#059669', width: '80px' }}>
          <div style={{ fontSize: '0.9rem' }}>
          ${pedido.precio_total?.toLocaleString() || 0}
          </div>
        </td>
        <td style={{ width: '120px' }}>
          <span className="status-badge" style={{
            color: info.text,
            background: info.color,
            border: `1px solid ${info.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {info.icon}
              {info.label}
          </div>
          </span>
        </td>
        <td style={{ color: '#9ca3af', width: '100px' }}>
          <div style={{ fontSize: '0.8rem' }}>
          {formatElapsedTime(pedido.created_at)}
          </div>
        </td>
        <td style={{ width: '150px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Botones de estado */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {getTransicionesInteligentes(pedido, actual)?.map(siguienteEstadoKey => {
              const siguienteEstadoInfo = getEstadoInfo(siguienteEstadoKey);
              return (
                  <Tooltip key={siguienteEstadoKey} content={`Cambiar a: ${siguienteEstadoInfo.label}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarEstado(pedido, siguienteEstadoKey);
                  }}
                      className="action-button"
                  style={{
                    background: siguienteEstadoInfo.color,
                    color: siguienteEstadoInfo.text,
                        border: `1px solid ${siguienteEstadoInfo.border}`,
                        fontSize: '0.75rem',
                        fontWeight: 600
                  }}
                >
                  {siguienteEstadoInfo.label}
                </button>
                  </Tooltip>
              );
            })}
            {actual !== 'CANCELADO' && actual !== 'ENTREGADO' && (
                <Tooltip content="Cancelar pedido">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cambiarEstado(pedido, 'CANCELADO');
                }}
                    className="action-button"
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                      border: '1px solid #fca5a5',
                      fontSize: '0.75rem',
                      fontWeight: 600
                }}
              >
                Cancelar
              </button>
                </Tooltip>
            )}
            </div>
            
            {/* Botones de boleta */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Tooltip content="Generar boleta para cocina">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  generarBoletaSimplificada(pedido);
                }}
                  className="action-button"
                style={{
                  background: '#3B82F6',
                  color: 'white',
                    border: '1px solid #2563eb',
                    fontSize: '0.8rem'
                  }}
              >
                📋
              </button>
              </Tooltip>
              <Tooltip content="Generar boleta completa">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  generarBoletaPDF(pedido);
                }}
                  className="action-button"
                style={{
                  background: '#10B981',
                  color: 'white',
                    border: '1px solid #059669',
                    fontSize: '0.8rem'
                  }}
              >
                📄
              </button>
              </Tooltip>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderPedidoCard = useCallback((pedido) => {
    const actual = pedido.estado || 'PENDIENTE';
    const info = getEstadoInfo(actual);
    const isExpanded = selectedPedido?.id === pedido.id;

    // Determinar el color de fondo según el estado
    const getCardBackground = () => {
      switch (actual) {
        case 'ENTREGADO':
          return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
        case 'CANCELADO':
          return 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
        case 'PENDIENTE':
          return 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
        case 'EN_PREPARACION':
          return 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
        case 'LISTO':
          return 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
        case 'EN_ENTREGA':
          return 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)';
        default:
          return 'var(--bg-secondary)';
      }
    };

    const renderCustomizationDetails = (personalizacion, pedido) => {
      if (!personalizacion) {
        return (
          <div style={{ marginTop: 8, padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
            <div style={{
              fontSize: '0.9em',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              🍽️ Sin personalización
            </div>
          </div>
        );
      }

      try {
        let obj = personalizacion;
        
        // Si es string, intentar parsear
        if (typeof personalizacion === 'string') {
          obj = JSON.parse(personalizacion);
        }
        
        let selected = [];
        
        // Manejar diferentes formatos de datos
        if (Array.isArray(obj)) {
          // Si es un array, buscar objetos con customizations
          if (obj.length > 0 && obj[0].customizations) {
            selected = Object.entries(obj[0].customizations)
              .filter(([,v]) => v === true)
              .map(([k]) => k);
          } else if (obj.length > 0 && typeof obj[0] === 'object') {
            // Si es un array con un objeto que contiene ingredientes directamente
            selected = Object.entries(obj[0])
              .filter(([,v]) => v === true)
              .map(([k]) => k);
          } else {
            // Si es un array simple, usar directamente
            selected = obj.filter(item => item && typeof item === 'string');
          }
        } else if (typeof obj === 'object' && obj !== null) {
          // Si es un objeto, buscar propiedades con valor true
          selected = Object.entries(obj)
            .filter(([,v]) => v === true)
            .map(([k]) => k);
        }
        
        if (selected.length === 0) {
          return (
            <div style={{ marginTop: 8, padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
              <div style={{
                fontSize: '0.9em',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                🍽️ Sin personalización
              </div>
            </div>
          );
        }

        return (
          <div style={{ marginTop: 8, padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
            <div style={{
              fontSize: '0.9em',
              fontWeight: 700,
              color: '#0c4a6e',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              🧀 INGREDIENTES SELECCIONADOS:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selected.map((ingrediente, index) => (
                <span key={index} style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8em',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                  border: '1px solid #047857'
                }}>
                  ✅ {ingrediente}
                </span>
              ))}
            </div>
          </div>
        );
      } catch (error) {
        return (
          <div style={{ marginTop: 8, padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '2px solid #fecaca' }}>
            <div style={{
              fontSize: '0.9em',
              fontWeight: 600,
              color: '#dc2626',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              ⚠️ Error al procesar personalización
            </div>
          </div>
        );
      }
    };

    return (
      <div
        key={pedido.id}
        onClick={() => setSelectedPedido(selectedPedido?.id === pedido.id ? null : pedido)}
        style={{
          background: getCardBackground(),
          borderRadius: 12,
          padding: '16px',
          border: `2px solid ${info.border}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header con avatar y estado */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1em',
              position: 'relative'
            }}>
              {pedido.nombre?.charAt(0)?.toUpperCase() || '?'}
              {(actual === 'ENTREGADO' || actual === 'CANCELADO') && (
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: actual === 'ENTREGADO' ? '#10B981' : '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6em',
                  fontWeight: 900,
                  border: '2px solid white'
                }}>
                  {actual === 'ENTREGADO' ? '✓' : '✕'}
                </span>
              )}
            </div>
            <div>
              <div style={{fontWeight: 700, fontSize: '1em', color: 'var(--text-primary)', marginBottom: 2}}>
                {pedido.nombre || 'Cliente'}
              </div>
              <div style={{fontSize: '0.8em', color: 'var(--text-muted)'}}>
                📞 {pedido.telefono || 'Sin teléfono'}
              </div>
            </div>
          </div>
          <div style={{
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: '0.75em',
            fontWeight: 700,
            color: info.text,
            background: info.color,
            border: `1px solid ${info.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {info.icon}
            {info.label}
          </div>
        </div>

        {/* Información del producto */}
        <div style={{marginBottom: 12, flex: 1}}>
          <div style={{fontWeight: 600, fontSize: '0.9em', color: 'var(--accent-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4}}>
            <span>🍽️</span>
            <span>{pedido.producto || 'Producto'}</span>
            <span style={{fontSize: '0.75em', color: 'var(--text-muted)'}}>x{pedido.cantidad || 1}</span>
            {pedido.personalizacion && (() => {
              try {
                const parsed = JSON.parse(pedido.personalizacion);
                const hasCustomizations = Array.isArray(parsed) ? parsed.length > 0 : Object.values(parsed).some(v => v);
                return hasCustomizations ? (
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 6,
                    padding: '2px 6px',
                    fontSize: '0.7em',
                    fontWeight: 700,
                    marginLeft: 6,
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                    border: '1px solid #047857'
                  }}>
                    🎯 Personalizado
                  </span>
                ) : null;
              } catch {
                return null;
              }
            })()}
          </div>

          {/* Bebida si existe */}
          {pedido.bebida && (
            <div style={{
              fontSize: '0.8em',
              color: '#059669',
              fontWeight: 600,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              🥤 {pedido.bebida} {pedido.tipo_bebida && `(${pedido.tipo_bebida})`}
            </div>
          )}

          {/* Instrucciones de preparación */}
          {renderCustomizationDetails(pedido.personalizacion, pedido)}

          {/* Tiempo transcurrido */}
          <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8em', color: 'var(--text-muted)', fontWeight: 500, marginTop: 8}}>
            <FiClock style={{fontSize: '0.7em'}}/> {formatElapsedTime(pedido.created_at)}
          </div>
        </div>

        {/* Footer con información adicional y botones */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <span style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: '0.75em',
              fontWeight: 600,
              color: esPedidoDomicilio(pedido) ? '#059669' : '#2563eb',
              background: esPedidoDomicilio(pedido) ? '#e6f9ed' : '#e0f7fa'
            }}>
              {esPedidoDomicilio(pedido) ? '🏠 Domicilio' : '🏪 Retiro'}
            </span>
            <span style={{fontSize: '0.9em', fontWeight: 700, color: 'var(--accent-secondary)'}}>
              💰 ${pedido.precio_total?.toLocaleString() || 0}
            </span>
          </div>
          
          {/* Botones de acción */}
          <div style={{display: 'flex', gap: 4}}>
            {getTransicionesInteligentes(pedido, actual)?.map(siguienteEstadoKey => {
              const siguienteEstadoInfo = getEstadoInfo(siguienteEstadoKey);
              return (
                <button
                  key={siguienteEstadoKey}
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarEstado(pedido, siguienteEstadoKey);
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: `1px solid ${siguienteEstadoInfo.border}`,
                    background: siguienteEstadoInfo.color,
                    color: siguienteEstadoInfo.text,
                    fontSize: '0.7em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  {siguienteEstadoInfo.icon}
                </button>
              );
            })}
            
            {actual !== 'CANCELADO' && actual !== 'ENTREGADO' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cambiarEstado(pedido, 'CANCELADO');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid #EF4444',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.7em',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
        
                generarBoletaSimplificada(pedido);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '2px solid #10B981',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontSize: '0.8em',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              title="Boleta rápida para cocina"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
              }}
            >
              📋
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();

                generarBoletaPDF(pedido);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '2px solid #3B82F6',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                fontSize: '0.8em',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              title="Boleta completa PDF"
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
              }}
            >
              📄
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedPedido, cambiarEstado, generarBoletaSimplificada, generarBoletaPDF]);
  
  // Renderizado del componente principal
  return (
    <div className="admin-panel" style={{
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Notificaciones */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={closeNotification}
        />
      ))}

      <AdminLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
        sidebar={
          <AdminSidebar
            menuItems={sidebarConfig.menuItems}
            userInfo={sidebarConfig.userInfo}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={onLogout}
          />
        }
        headerActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tooltip content={`Última actualización: ${lastUpdate.toLocaleTimeString()}`}>
              <button 
                onClick={() => fetchPedidos(true)} 
                disabled={isRefreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: isRefreshing ? '#f3f4f6' : 'var(--bg-secondary)',
                  color: isRefreshing ? '#9ca3af' : 'var(--text-secondary)',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiRefreshCw style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </Tooltip>
            
           
            
            {activeSection === 'orders' && (
              <>
                <Tooltip content="Exportar todos los pedidos a archivo CSV">
                  <button onClick={exportToCSV} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}>
                    <FiDownload />
                    Exportar CSV
                  </button>
                </Tooltip>
                
                <Tooltip content="Generar boletas para todos los pedidos filtrados">
                  <button onClick={generarBoletasFiltradas} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}>
                    <FiFileText />
                    Generar Boletas
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        }
      >
        {renderSectionContent()}
      </AdminLayout>

      {showConfirmModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            maxWidth: 400,
            width: '90%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              {pendingAction?.mensaje || '¿Estás seguro?'}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {pendingAction?.detalles || `Vas a cambiar el estado del pedido de "${getEstadoInfo(pendingAction?.pedido?.estado || 'PENDIENTE').label}" a "${getEstadoInfo(pendingAction?.nuevoEstado).label}".`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid var(--accent-primary)',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;