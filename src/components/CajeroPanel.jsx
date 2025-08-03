import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiUser, FiShoppingCart, FiPlus, FiX, FiCheck, FiCoffee, FiArrowLeft, FiPackage, FiDollarSign, FiSun, FiMoon } from 'react-icons/fi';
import '../App.css';

const IMAGES = {
  completoItaliano: new URL('../assets/completo-italiano.jpg', import.meta.url).href,
  churrasco: new URL('../assets/churrasco.png', import.meta.url).href,
  barroLuco: new URL('../assets/barro-luco.jpg', import.meta.url).href,
  papasFritas: new URL('../assets/papas-fritas.jpg', import.meta.url).href,
  empanadaQueso: new URL('../assets/empanada-de-quesoo.png', import.meta.url).href,
  cocaCola: new URL('../assets/coca-cola.png', import.meta.url).href,
  fanta: new URL('../assets/fanta.jpg', import.meta.url).href,
  cafe: new URL('../assets/cafe.jpg', import.meta.url).href,
  te: new URL('../assets/te.jpg', import.meta.url).href,
  logoQuenitas: new URL('../assets/logoquenitamejorcalidad.jpeg', import.meta.url).href
};

const PRODUCTOS = [
  { id: 1, name: "Completo Italiano", price: 2500, category: "completos", image: IMAGES.completoItaliano },
  { id: 2, name: "Completo Clásico", price: 2200, category: "completos", image: IMAGES.completoItaliano },
  { id: 3, name: "Completo Especial", price: 2800, category: "completos", image: IMAGES.completoItaliano },
  { id: 4, name: "Churrasco", price: 3500, category: "sándwiches", image: IMAGES.churrasco },
  { id: 5, name: "Barros Luco", price: 3200, category: "sándwiches", image: IMAGES.barroLuco },
  { id: 6, name: "Papas Fritas", price: 1800, category: "acompañamientos", image: IMAGES.papasFritas },
  { id: 7, name: "Empanada de Queso", price: 1500, category: "acompañamientos", image: IMAGES.empanadaQueso }
];

const BEBIDAS = [
  { id: 1, name: "Coca-Cola", price: 800, image: IMAGES.cocaCola },
  { id: 2, name: "Fanta", price: 800, image: IMAGES.fanta },
  { id: 3, name: "Sprite", price: 800, image: IMAGES.cocaCola }, // Usar imagen de Coca-Cola como placeholder
  { id: 4, name: "Café", price: 400, image: IMAGES.cafe },
  { id: 5, name: "Té", price: 300, image: IMAGES.te }
];

const CajeroPanel = ({ onBack, setRoute }) => {
  const [carrito, setCarrito] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [activeTab, setActiveTab] = useState('productos');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('quenitas-dark', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

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

    setLoading(true);

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
      setShowConfirmModal(true);
      limpiarTodo();
    } catch (error) {
      console.error('Error creating pedido:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <div className="order-form-content">
        <div className="order-form-left">
          <h2 className="order-form-title">¡Haz tu pedido!</h2>
              
          <div className="progress-bar">
            <div className="progress-step active">1</div>
            <div className="progress-step active">2</div>
            <div className="progress-step active">3</div>
            <div className="progress-step active">4</div>
      </div>

          <div className="step-container">
            <h3>👤 Información del Cliente</h3>
            
            <div className="customer-inputs">
                <input
                  type="text"
                  id="cliente-nombre"
                  name="cliente-nombre"
                  placeholder="Nombre del cliente"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="form-input"
                  required
                />
                <input
                  type="tel"
                  id="cliente-telefono"
                  name="cliente-telefono"
                  placeholder="+56912345678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="form-input"
                  required
                />
            </div>
            
            <div className="options-grid">
              <button
                type="button"
                className={`option-btn ${tipoEntrega === 'retiro' ? 'selected' : ''}`}
                onClick={() => setTipoEntrega('retiro')}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                className={`option-btn ${tipoEntrega === 'domicilio' ? 'selected' : ''}`}
                onClick={() => setTipoEntrega('domicilio')}
              >
                🚚 Domicilio
              </button>
            </div>
            
            {tipoEntrega === 'domicilio' && (
              <div className="address-input">
                <input
                  type="text"
                  id="direccion-entrega"
                  name="direccion-entrega"
                  placeholder="Dirección de entrega"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}
            
            <div className="options-grid">
              <button
                type="button"
                className={`option-btn ${metodoPago === 'efectivo' ? 'selected' : ''}`}
                onClick={() => setMetodoPago('efectivo')}
              >
                💰 Efectivo
              </button>
              <button
                type="button"
                className={`option-btn ${metodoPago === 'debito' ? 'selected' : ''}`}
                onClick={() => setMetodoPago('debito')}
              >
                💳 Débito
              </button>
              <button
                type="button"
                className={`option-btn ${metodoPago === 'credito' ? 'selected' : ''}`}
                onClick={() => setMetodoPago('credito')}
              >
                💳 Crédito
              </button>
            </div>

            {metodoPago === 'efectivo' && (
              <div className="customer-inputs">
                <input
                  type="number"
                  id="monto-recibido"
                  name="monto-recibido"
                  placeholder="Monto recibido"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="form-input"
                  min={calcularTotal()}
                />
              </div>
            )}

            {(metodoPago === 'debito' || metodoPago === 'credito') && (
              <div className="customer-inputs">
                <input
                  type="text"
                  id="numero-tarjeta"
                  name="numero-tarjeta"
                  placeholder="Número de tarjeta"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  className="form-input"
                  maxLength={16}
                />
              </div>
            )}

            <div className="customer-inputs">
              <textarea
                id="observaciones"
                name="observaciones"
                placeholder="Observaciones especiales..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="step-container">
            <h3>🍽️ Productos Disponibles</h3>
            
            <div className="tab-navigation" style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              background: 'var(--bg-tertiary)',
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setActiveTab('productos')}
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: activeTab === 'productos' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'productos' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  boxShadow: activeTab === 'productos' ? '0 4px 12px rgba(46, 204, 113, 0.3)' : 'none',
                  transform: activeTab === 'productos' ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'productos') {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'productos') {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                🍽️ Productos
              </button>
              <button
                onClick={() => setActiveTab('bebidas')}
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: activeTab === 'bebidas' ? 'var(--accent-secondary)' : 'transparent',
                  color: activeTab === 'bebidas' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  boxShadow: activeTab === 'bebidas' ? '0 4px 12px rgba(52, 152, 219, 0.3)' : 'none',
                  transform: activeTab === 'bebidas' ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'bebidas') {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'bebidas') {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                🥤 Bebidas
              </button>
            </div>

            {activeTab === 'productos' && (
              <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                padding: '0',
                marginTop: '20px'
              }}>
                {PRODUCTOS.map((producto) => (
                  <div
                    key={producto.id}
                    className="product-card"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '2px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                      e.target.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* Badge de categoría */}
                    <div className="category-badge" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      zIndex: 2
                    }}>
                      {producto.category}
                    </div>

                    {/* Imagen del producto */}
                    <div className="product-image" style={{
                      width: '100%',
                      height: '160px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      background: 'linear-gradient(135deg, var(--bg-tertiary), var(--border-color))'
                    }}>
                      <img 
                        src={producto.image} 
                        alt={producto.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: '12px',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--border-color))',
                        borderRadius: '12px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'var(--text-muted)',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}>
                        🍽️
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="product-info" style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          lineHeight: '1.3'
                        }}>
                          {producto.name}
                        </h4>
                        
                        <div className="product-price" style={{
                          fontSize: '1.3rem',
                          fontWeight: '800',
                          color: 'var(--accent-primary)',
                          textAlign: 'center',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$</span>
                          {producto.price.toLocaleString()}
                        </div>
                      </div>

                      <button
                        className="admin-btn"
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#059669';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--accent-primary)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          agregarAlCarrito(producto);
                        }}
                      >
                        <FiPlus size={16} />
                        Agregar al Pedido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bebidas' && (
              <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                padding: '0',
                marginTop: '20px'
              }}>
                {BEBIDAS.map((bebida) => (
                  <div
                    key={bebida.id}
                    className="product-card"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '2px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                      e.target.style.borderColor = 'var(--accent-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* Badge de categoría */}
                    <div className="category-badge" style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'var(--accent-secondary)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      zIndex: 2
                    }}>
                      Bebida
                    </div>

                    {/* Imagen del producto */}
                    <div className="product-image" style={{
                      width: '100%',
                      height: '160px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      background: 'linear-gradient(135deg, var(--bg-tertiary), var(--border-color))'
                    }}>
                      <img 
                        src={bebida.image} 
                        alt={bebida.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: '12px',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--border-color))',
                        borderRadius: '12px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'var(--text-muted)',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}>
                        🥤
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="product-info" style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          lineHeight: '1.3'
                        }}>
                          {bebida.name}
                        </h4>
                        
                        <div className="product-price" style={{
                          fontSize: '1.3rem',
                          fontWeight: '800',
                          color: 'var(--accent-secondary)',
                          textAlign: 'center',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$</span>
                          {bebida.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Botón de agregar */}
                      <button
                        className="admin-btn"
                        style={{
                          background: 'var(--accent-secondary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2563eb';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--accent-secondary)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          agregarAlCarrito(bebida);
                        }}
                      >
                        <FiPlus size={16} />
                        Agregar al Pedido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

          <div className="step-buttons" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 0',
            borderTop: '1px solid var(--border-color)',
            marginTop: '20px'
          }}>
            {/* Botones de la izquierda */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <button 
                onClick={toggleDarkMode} 
                className="dark-mode-toggle"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--bg-tertiary)'}
              >
                {darkMode ? <FiMoon size={16}/> : <FiSun size={16}/>}
                {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
              </button>
              <button 
                onClick={onBack} 
                style={{
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4B5563'}
                onMouseLeave={(e) => e.target.style.background = '#6B7280'}
              >
                <FiArrowLeft size={16}/> Volver
              </button>
            </div>

            {/* Botón principal de confirmar */}
            <button 
              onClick={confirmarPedido}
              disabled={loading || carrito.length === 0}
              className="confirm-pedido-btn"
              style={{
                background: carrito.length === 0 ? '#9CA3AF' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '1.1em',
                fontWeight: '700',
                cursor: carrito.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                minWidth: '200px',
                justifyContent: 'center',
                boxShadow: carrito.length === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (carrito.length > 0) {
                  e.target.style.background = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (carrito.length > 0) {
                  e.target.style.background = '#10B981';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}/>
                  Procesando...
                </>
              ) : (
                <>
                  💰 Confirmar Pedido
                  {carrito.length > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.8em',
                      fontWeight: '600'
                    }}>
                      ${calcularTotal().toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
                      </div>

        <div className="order-summary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>📋 Resumen:</h3>
            {carrito.length > 0 && (
                    <button
                onClick={limpiarTodo}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                  padding: '8px 12px',
                        cursor: 'pointer',
                  fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                  gap: '4px'
                      }}
                    >
                🗑️ Limpiar
                    </button>
            )}
                  </div>
          <div className="summary-content">
            {clienteNombre && (
              <p><strong>Cliente:</strong> {clienteNombre}</p>
            )}
            {telefono && (
              <p><strong>Teléfono:</strong> {telefono}</p>
            )}
            <p><strong>Tipo de entrega:</strong> {tipoEntrega === 'retiro' ? 'Retiro en local' : 'Domicilio'}</p>
            {tipoEntrega === 'domicilio' && direccion && (
              <p><strong>Dirección:</strong> {direccion}</p>
            )}
            <p><strong>Método de pago:</strong> {metodoPago}</p>
            
            {carrito.length > 0 && (
              <>
                <p><strong>Productos:</strong></p>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {carrito.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name} x{item.quantity || 1}</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          ${(item.price * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                <div style={{
                  display: 'flex',
                        gap: '8px', 
                        marginTop: '4px',
                        justifyContent: 'center'
                      }}>
                <button
                          onClick={(e) => {
                            e.stopPropagation();
                            disminuirCantidad(index);
                          }}
                  style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                    cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                  }}
                >
                          -
                </button>
                        <span style={{ 
                          minWidth: '20px', 
                          textAlign: 'center',
                          fontWeight: 600
                        }}>
                          {item.quantity || 1}
                        </span>
                <button
                          onClick={(e) => {
                            e.stopPropagation();
                            aumentarCantidad(index);
                          }}
                  style={{
                            background: '#10b981',
                  color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removerDelCarrito(index);
                          }}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            marginLeft: '8px'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {metodoPago === 'efectivo' && montoRecibido && (
              <>
                <p><strong>Monto recibido:</strong> ${parseFloat(montoRecibido).toLocaleString()}</p>
                <p><strong>Cambio:</strong> ${calcularCambio().toLocaleString()}</p>
                    </>
                  )}
            
            <div className="total-price">
              <strong>Total: ${calcularTotal().toLocaleString()}</strong>
              </div>
          </div>
        </div>
      </div>

      
      {showConfirmModal && pedidoConfirmado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              background: '#10b981',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '2rem'
            }}>
              ✅
            </div>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              ¡Pedido Confirmado!
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              El pedido ha sido guardado exitosamente en la base de datos.
            </p>
            <div style={{
              background: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <p><strong>ID:</strong> {pedidoConfirmado.id}</p>
              <p><strong>Cliente:</strong> {pedidoConfirmado.nombre}</p>
              <p><strong>Total:</strong> ${pedidoConfirmado.precio_total?.toLocaleString()}</p>
              <p><strong>Estado:</strong> {pedidoConfirmado.estado}</p>
            </div>
            <button
              onClick={() => setShowConfirmModal(false)}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajeroPanel; 