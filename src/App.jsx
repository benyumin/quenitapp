import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import Menu from "./components/Home/Menu";
import Location from "./components/Home/Location";
import WhatsAppButton from "./components/Common/WhatsAppButton";
import OrderForm from "./components/Orders/OrderForm";
import logoQuenitasHero from "./assets/logoquenitamejorcalidad.jpeg";
import "./App.css";
import logoQuenitas from "./assets/logoquenitamejorcalidad.jpeg";

import { supabase } from './lib/supabaseClient';

const LazyAdminPanel = lazy(() => import('./components/Admin/AdminPanel'));
const LazyCocinaPanel = lazy(() => import('./components/Cocina/CocinaPanel'));
const LazyCajaPanel = lazy(() => import('./components/Caja/CajaPanel'));
const LazyCajeroPanel = lazy(() => import('./components/Caja/CajeroPanel'));
const LazyRepartidorPanel = lazy(() => import('./components/Repartidor/RepartidorPanel'));
const LazyCalendarView = lazy(() => import('./components/Orders/CalendarView'));
const LazyLogin = lazy(() => import('./components/Auth/Login'));

const ADMIN_EMAIL = 'benjaminalvarao12@gmail.com';
const CART_STORAGE_KEY = 'quenitas-cart';
const THEME_STORAGE_KEY = 'quenitas-dark';
const DELIVERY_FEE = 1500;

const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = useCallback((order) => {
    console.log('🛒 Agregando orden al carrito - total:', order.total);
    
    if (order.products && Array.isArray(order.products)) {
      console.log('📦 Orden con múltiples productos detectada');
      // Asegurar que el total esté correctamente calculado
      const calculatedTotal = order.products.reduce((sum, product) => {
        const basePrice = product.price || 0;
        const beveragePrice = product.beveragePrice || 0;
        const customizationPrice = product.customizationPrice || 0;
        return sum + (basePrice + beveragePrice + customizationPrice) * (product.quantity || 1);
      }, 0);
      
      const orderWithCorrectTotal = {
        ...order,
        total: calculatedTotal
      };
      
      console.log('🛒 Orden con total corregido:', orderWithCorrectTotal);
      setCart(prev => [...prev, orderWithCorrectTotal]);
    } else {
      console.log('🍽️ Orden individual detectada');
      setCart(prev => [...prev, { ...order, quantity: order.quantity || 1 }]);
    }
  }, []);

  const removeFromCart = useCallback((idx, itemName) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar "${itemName}" del carrito?`);
    if (confirmDelete) {
      setCart(prev => prev.filter((_, i) => i !== idx));
      return true;
    }
    return false;
  }, []);

  const clearCart = useCallback(() => {
    if (cart.length === 0) return false;
    const confirmClear = window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?');
    if (confirmClear) {
      setCart([]);
      return true;
    }
    return false;
  }, [cart.length]);

  const updateQuantity = useCallback((idx, delta) => {
    setCart(prev => prev.map((item, i) => 
      i === idx ? { ...item, quantity: item.quantity+delta } : item
    ).filter(item => item.quantity > 0));
  }, []);

  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((acc, item) => {
      console.log('🔍 calculateTotals - procesando item:', item);
      
      if (item.products && Array.isArray(item.products)) {
        // Para órdenes con múltiples productos
        if (item.total && item.total > 0) {
          console.log('🔍 calculateTotals - usando item.total:', item.total);
          return acc + item.total;
        } else {
          // Calcular manualmente basándose en los productos
          const calculatedTotal = item.products.reduce((sum, product) => {
            const basePrice = product.price || 0;
            const beveragePrice = product.beveragePrice || 0;
            const customizationPrice = product.customizationPrice || 0;
            const itemTotal = (basePrice + beveragePrice + customizationPrice) * (product.quantity || 1);
            console.log('🔍 calculateTotals - producto:', product.name, 'precio:', itemTotal);
            return sum + itemTotal;
          }, 0);
          console.log('🔍 calculateTotals - total calculado manualmente:', calculatedTotal);
          return acc + calculatedTotal;
        }
      } else {
        // Para items individuales
        const basePrice = item.price || 0;
        const beveragePrice = item.beveragePrice || 0;
        const customizationPrice = item.customizationPrice || 0;
        const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
        console.log('🔍 calculateTotals - item individual:', item.name, 'precio:', itemTotal);
        return acc + itemTotal;
      }
    }, 0);
    
    const envio = cart.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + envio;
    
    console.log('🔍 calculateTotals - resultados finales:', { subtotal, envio, total, cartLength: cart.length });
    
    return { subtotal, envio, total };
  }, [cart]);

  return { 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    updateQuantity, 
    setCart,
    calculateTotals
  };
};

const useNotifications = () => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showNotification = useCallback((message, type = 'success') => {
    // Ocultar notificación anterior si existe
    setNotification(prev => ({ ...prev, isVisible: false }));
    
    // Pequeño delay para la transición
    setTimeout(() => {
      setNotification({
        message,
        type,
        isVisible: true
      });
    }, 100);
    
    // Auto-ocultar después de 4 segundos
    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { notification, showNotification, hideNotification };
};

const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      return false;
    }
  });

  useEffect(() => {
    // Aplicar clase al body para el tema oscuro
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return { darkMode, toggleTheme };
};

const useNavigation = () => {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goTo = useCallback((path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  }, []);

  return { route, goTo };
};

function Hero() {
  return (
    <section className="hero-section" role="banner" aria-label="Bienvenidos a Quenitas Foodtruck">
      <div className="hero-content">
        <img 
          src={logoQuenitasHero} 
          alt="Logo Quenita's - El sabor chileno sobre ruedas" 
          className="hero-img"
          loading="eager"
          decoding="async"
        />
        <div>
          <h1 className="hero-title">¡El sabor chileno sobre ruedas!</h1>
          <p className="hero-desc">
            Disfruta completos, papas fritas y más en Quenitas Foodtruck. 
            Sabor, calidad y buena onda en cada bocado.
          </p>
          <a 
            href="#menu" 
            className="hero-btn"
            aria-label="Ver nuestro menú completo"
          >
            Ver Menú
          </a>
        </div>
      </div>
    </section>
  );
}

function Notification({ message, type, isVisible, onClose }) {
  if (!isVisible) return null;

  const icons = {
    success: '🎉',
    error: '⚠️',
    info: '💡'
  };

  const getMessage = (msg) => {
    // Corregir errores comunes de texto
    const corrections = {
      'sas anauido al canto': '¡Se ha añadido al carrito!',
      'anauido al canto': '¡Añadido al carrito!',
      'canto': 'carrito',
      'pedrri': 'pedido'
    };

    let correctedMsg = msg;
    Object.entries(corrections).forEach(([wrong, correct]) => {
      correctedMsg = correctedMsg.replace(new RegExp(wrong, 'gi'), correct);
    });

    return correctedMsg;
  };

  return (
    <div 
      className={`notification ${type}`}
      role="alert"
      aria-live="polite"
      aria-label={`Notificación ${type}`}
    >
      <div className="notification-content">
        <span className="notification-icon" aria-hidden="true">
          {icons[type] || '💡'}
        </span>
        <span className="notification-message">{getMessage(message)}</span>
        <button 
          className="notification-close" 
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function OrderConfirmation({ onConfirm, onCancel, total }) {
  return (
    <div className="order-confirmation-overlay">
      <div className="order-confirmation-modal">
        <div className="confirmation-icon">
          <span role="img" aria-label="Éxito">🎉</span>
          <span>¡Éxito!</span>
        </div>
        <h2>¡Pedido Confirmado!</h2>
        
        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          padding: '15px',
          background: 'linear-gradient(135deg, #e6f9ed 0%, #f0f9ff 100%)',
          borderRadius: '12px',
          border: '2px solid #34d399'
        }}>
          <p style={{
            fontSize: '1.1em',
            color: '#166534',
            fontWeight: 600,
            margin: '0 0 10px 0'
          }}>
            🚀 ¡Tu pedido ya está en nuestras manos!
          </p>
          <p style={{
            fontSize: '1em',
            color: '#059669',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Nuestros chefs están preparando tu pedido con el amor y la calidad que caracteriza a Quenita's
          </p>
        </div>
        
        <div style={{
          margin: '15px 0',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b'
        }}>
          <p style={{
            fontSize: '1em',
            color: '#92400e',
            margin: '0',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ⏰ Tu pedido estará listo en aproximadamente 15-20 minutos
          </p>
        </div>
        
        <div className="confirmation-total">
          <strong>Total: ${total} CLP</strong>
        </div>
        
        <div style={{
          margin: '15px 0',
          padding: '10px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '0.9em',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <p style={{margin: '0 0 5px 0'}}>
            📱 Te notificaremos cuando esté listo
          </p>
          <p style={{margin: '0', fontSize: '0.85em'}}>
            ¡Gracias por elegir el sabor chileno de Quenita's!
          </p>
        </div>
        
        <div className="confirmation-actions">
          <button onClick={onConfirm} className="confirm-btn" aria-label="Confirmar pedido">
            ¡Perfecto! 🎯
          </button>
        </div>
      </div>
    </div>
  );
}

function CartItem({ item, idx, onRemove, onQuantityChange, onRemoveItem }) {
  const isMultiProduct = item.products && Array.isArray(item.products);
  
  const renderProductImage = () => (
    <div className="cart-item-img">
      <img 
        src={isMultiProduct ? item.products[0]?.image : item.image} 
        alt={isMultiProduct ? "Pedido múltiple" : (item.product || item.name)} 
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="cart-item-fallback">
        🍽️
      </div>
    </div>
  );

  const renderProductInfo = () => {
    if (isMultiProduct) {
      return (
        <div className="cart-item-info">
          <h3>Pedido de {item.name}</h3>
          <div className="product-count">
            {item.products.length} producto{item.products.length > 1 ? 's' : ''}
          </div>
          <div className="product-details">
            {item.products.map((product, pIdx) => (
              <span key={pIdx}>
                {product.name} x{product.quantity || 1}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="cart-item-info">
        <h3>{item.product || item.name}</h3>
        <div className="product-count">
          {item.beverage && item.beverage !== 'Sin bebida' ? (
            <span className="beverage-tag">
              {item.beverageIcon} {item.beverage}
            </span>
          ) : (
            <span className="no-beverage">Sin bebida</span>
          )}
        </div>
        {item.customizations && item.customizations.length > 0 && (
          <div className="product-details">
            {item.customizations.map((custom, i) => (
              <span key={i}>
                {custom.name}
              </span>
            ))}
          </div>
        )}
        <button 
          onClick={() => onRemoveItem(idx, item.name)} 
          className="cart-remove-btn"
          aria-label={`Eliminar ${item.name} del carrito`}
        >
          <span role="img" aria-label="Eliminar">🗑️</span> Eliminar
        </button>
      </div>
    );
  };

  const renderQuantityControls = () => {
    if (isMultiProduct) return null;
    
    return (
      <div className="cart-item-qty">
        <button 
          onClick={() => onQuantityChange(idx, -1)}
          aria-label="Reducir cantidad"
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <span aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span>
        <button 
          onClick={() => onQuantityChange(idx, 1)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    );
  };

  const renderPrice = () => {
    const itemTotal = isMultiProduct ? item.total : ((item.price || 0) * (item.quantity || 1));
    return (
      <div className="cart-item-price" aria-label={`Precio: ${itemTotal} CLP`}>
        ${itemTotal?.toLocaleString()} CLP
      </div>
    );
  };

  const renderRemoveButton = () => {
    if (isMultiProduct) {
      return (
        <button 
          onClick={() => onRemove(idx, `Pedido de ${item.name}`)}
          className="remove-btn"
          aria-label="Eliminar pedido"
        >
          🗑️
        </button>
      );
    }
    return null;
  };

  return (
    <div className="cart-item-row" role="listitem">
      {renderProductImage()}
      {renderProductInfo()}
      {renderQuantityControls()}
      {renderPrice()}
      {renderRemoveButton()}
    </div>
  );
}

function CartPage({ 
  cart, 
  setCart, 
  onBack, 
  showNotification, 
  removeFromCart, 
  clearCart, 
  updateQuantity, 
  showOrderConfirmation, 
  setShowOrderConfirmation, 
  onOrderSubmit 
}) {
  // Calcular totales directamente usando el cart que se pasa como prop
  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => {
      console.log('🔍 CartPage calculateTotals - procesando item:', item);
      
      if (item.products && Array.isArray(item.products)) {
        // Para órdenes con múltiples productos
        if (item.total && item.total > 0) {
          console.log('🔍 CartPage calculateTotals - usando item.total:', item.total);
          return acc + item.total;
        } else {
          // Calcular manualmente basándose en los productos
          const calculatedTotal = item.products.reduce((sum, product) => {
            const basePrice = product.price || 0;
            const beveragePrice = product.beveragePrice || 0;
            const customizationPrice = product.customizationPrice || 0;
            const itemTotal = (basePrice + beveragePrice + customizationPrice) * (product.quantity || 1);
            console.log('🔍 CartPage calculateTotals - producto:', product.name, 'precio:', itemTotal);
            return sum + itemTotal;
          }, 0);
          console.log('🔍 CartPage calculateTotals - total calculado manualmente:', calculatedTotal);
          return acc + calculatedTotal;
        }
      } else {
        // Para items individuales
        const basePrice = item.price || 0;
        const beveragePrice = item.beveragePrice || 0;
        const customizationPrice = item.customizationPrice || 0;
        const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
        console.log('🔍 CartPage calculateTotals - item individual:', item.name, 'precio:', itemTotal);
        return acc + itemTotal;
      }
    }, 0);
    
    const envio = cart.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + envio;
    
    console.log('🔍 CartPage calculateTotals - resultados finales:', { subtotal, envio, total, cartLength: cart.length });
    
    return { subtotal, envio, total };
  };

  const { subtotal, envio, total } = calculateTotals();

  const handleRemove = (idx, itemName) => {
    if (removeFromCart(idx, itemName)) {
      showNotification(`¡${itemName} eliminado del carrito! 🗑️`, 'success');
    }
  };
  
  const handleClear = () => {
    if (clearCart()) {
      showNotification('¡Carrito vaciado completamente! 🛒', 'info');
    }
  };

  const handleQuantityChange = (idx, delta) => {
    updateQuantity(idx, delta);
  };

  const handleConfirmationClose = async () => {
    try {
      console.log('🛒 Iniciando guardado de pedidos del carrito:', cart.length, 'items');
      
      const isMultiProductOrder = cart.length > 0 && cart[0].products;
      
      if (isMultiProductOrder) {
        await saveMultiProductOrders(cart);
      } else {
        await saveIndividualOrders(cart);
      }

      console.log('✅ Todos los pedidos guardados exitosamente en la base de datos');
      
      setShowOrderConfirmation(false);
      setCart([]);
      window.location.href = '/';
    } catch (error) {
      console.error('Error al guardar pedidos:', error);
      alert('Error al guardar los pedidos. Por favor intenta de nuevo.');
    }
  };

  const saveMultiProductOrders = async (orders) => {
    for (const order of orders) {
      console.log('📝 Guardando orden con múltiples productos:', order);
      
      const productsSummary = order.products.map(product => 
        `${product.name} x${product.quantity}`
      ).join(', ');
      
      const customizationsForDB = order.products.map(p => p.customizations);
      
      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          nombre: order.name,
          telefono: order.phone,
          direccion: order.address || 'Retiro en local',
          producto: productsSummary,
          precio_total: order.total,
          estado: 'PENDIENTE',
          tipo_entrega: order.deliveryMethod === 'Retiro en local' ? 'Retiro en local' : 'Domicilio',
          bebida: order.products.map(p => p.beverage).filter(b => b !== 'Sin bebida').join(', '),
          personalizacion: JSON.stringify(customizationsForDB),
          resumen: productsSummary,
          cantidad: order.products.reduce((total, p) => total + (p.quantity || 1), 0),
          metodo_pago: order.paymentMethod ? order.paymentMethod.toLowerCase() : 'efectivo',
          rut_titular: order.cardRut || '',
          numero_tarjeta: order.cardNumber || '',
          fecha_vencimiento: order.cardExpiry || '',
          cvv: order.cardCVV || ''
        }]);

      if (error) {
        console.error('Error guardando orden con múltiples productos:', error);
        throw error;
      }

      console.log('✅ Orden con múltiples productos guardada exitosamente:', {
        id: data?.[0]?.id,
        nombre: data?.[0]?.nombre,
        producto: data?.[0]?.producto,
        estado: data?.[0]?.estado,
        created_at: data?.[0]?.created_at
      });
    }
  };

  const saveIndividualOrders = async (items) => {
    for (const item of items) {
      console.log('📝 Guardando item individual:', item);
      
      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          nombre: item.name,
          telefono: item.phone,
          direccion: item.address || 'Retiro en local',
          producto: item.product,
          precio_total: (item.price || 0) * (item.quantity || 1),
          estado: 'PENDIENTE',
          tipo_entrega: item.deliveryMethod === 'Retiro en local' ? 'Retiro en local' : 'Domicilio',
          bebida: item.beverage,
          personalizacion: JSON.stringify(item.customizations),
          resumen: `${item.product}${item.customizations && Object.keys(item.customizations).length > 0 ? ` con ${Object.entries(item.customizations).filter(([,v]) => v).map(([k]) => k).join(', ')}` : ''}`,
          cantidad: item.quantity || 1,
          metodo_pago: item.paymentMethod ? item.paymentMethod.toLowerCase() : 'efectivo',
          rut_titular: item.cardRut || '',
          numero_tarjeta: item.cardNumber || '',
          fecha_vencimiento: item.cardExpiry || '',
          cvv: item.cardCVV || ''
        }]);

      if (error) {
        console.error('Error guardando pedido individual:', error);
        throw error;
      }

      console.log('✅ Pedido individual guardado exitosamente:', {
        id: data?.[0]?.id,
        nombre: data?.[0]?.nombre,
        producto: data?.[0]?.producto,
        estado: data?.[0]?.estado,
        created_at: data?.[0]?.created_at
      });
    }
  };

  return (
    <div className="cart-outer-card">
      <div className="cart-card">
        <div className="cart-header-row">
          <h1>Mi pedido</h1>
          {cart.length > 0 && (
            <button 
              className="cart-clear-btn" 
              onClick={handleClear}
              aria-label="Vaciar carrito completo"
            >
              <span role="img" aria-label="Limpiar">🧹</span> Limpiar
            </button>
          )}
        </div>
        
        <div className="cart-products-list">
          <h2 className="cart-products-title">Productos</h2>
          
          {cart.length === 0 ? (
            <div className="cart-empty-container">
              <div className="cart-empty-icon" aria-hidden="true">🛒</div>
              <h3 className="cart-empty-title">¡Tu carrito está vacío!</h3>
              <p className="cart-empty-desc">
                ¿Qué te apetece hoy? Tenemos completos, papas fritas y mucho más.
              </p>
              <div className="cart-empty-actions">
                <button 
                  onClick={onBack} 
                  className="hero-btn"
                >
                  Ver Menú
                </button>
                <button 
                  onClick={() => document.getElementById('menu').scrollIntoView({behavior:'smooth'})} 
                  className="hero-btn"
                >
                  Explorar Productos
                </button>
              </div>
              <div className="cart-empty-tip">
                <h4>💡 ¿Sabías que?</h4>
                <p>
                  Nuestros completos son 100% caseros y las papas fritas se preparan al momento. 
                  ¡Sabor auténtico chileno en cada bocado!
                </p>
              </div>
            </div>
          ) : (
            <div role="list" aria-label="Productos en el carrito">
              {cart.map((item, idx) => (
                <CartItem
                  key={idx}
                  item={item}
                  idx={idx}
                  onRemove={handleRemove}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="cart-summary-block">
          <div className="cart-totals">
            <div className="cart-totals-row">
              <span>Subtotal</span>
              <span>${subtotal} CLP</span>
            </div>
            <div className="cart-totals-row">
              <span>Envío</span>
              <span>${envio} CLP</span>
            </div>
            <div className="cart-totals-row cart-totals-total">
              <strong>Total</strong>
              <strong>${total} CLP</strong>
            </div>
          </div>
        </div>
        
        {cart.length > 0 && (
          <div className="cart-actions">
            <button 
              onClick={onOrderSubmit} 
              className="cart-wa-btn"
              aria-label="Realizar pedido"
            >
              <span role="img" aria-label="Realizar pedido">📱</span> 
              Realizar Pedido
            </button>
            <button 
              onClick={onBack} 
              className="cart-back-btn"
              aria-label="Volver al menú"
            >
              Volver al menú
            </button>
          </div>
        )}
      </div>
      
      {showOrderConfirmation && (
        <OrderConfirmation 
          onConfirm={handleConfirmationClose}
          onCancel={handleConfirmationClose}
          total={total}
        />
      )}
    </div>
  );
}

function Navbar({ cart, darkMode, toggleTheme, onCartClick, onLogoClick }) {
  return (
    <header className="main-header" role="banner">
      <nav role="navigation" aria-label="Navegación principal">
        <span 
          className="logo" 
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio"
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick()}
        >
          <img 
            src={logoQuenitas} 
            alt="Logo Quenita's" 
          />
          <span>
            quenita's
          </span>
        </span>
        
        <div className="navbar-buttons-container">
          <button
            className="dark-toggle"
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${darkMode ? 'claro' : 'oscuro'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button 
            className="cart-btn" 
            onClick={onCartClick} 
            aria-label={`Ver carrito (${cart.length} productos)`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.61-1.61l1.38-7.39H6.5"/>
            </svg>
            {cart.length > 0 && (
              <span className="cart-count" aria-label={`${cart.length} productos en el carrito`}>
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}

function AdminLogin({ onLogin, adminError }) {
  return (
    <div style={{
      maxWidth:400,
      margin:'3rem auto',
      padding:24,
      background:'var(--bg-secondary)',
      borderRadius:12,
      boxShadow:'0 2px 12px var(--shadow-dark)'
    }}>
      <LazyLogin onLogin={onLogin} />
      {adminError && (
        <div style={{
          color:'red',
          marginTop:12,
          textAlign:'center',
          fontWeight:600
        }}>
          {adminError}
        </div>
      )}
    </div>
  );
}

function App() {
  const { cart, addToCart, removeFromCart, clearCart, updateQuantity, setCart } = useCart();
  const { notification, showNotification, hideNotification } = useNotifications();
  const { darkMode, toggleTheme } = useTheme();
  const { route, goTo } = useNavigation();
  
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  const handleAddToCart = useCallback((order) => {
    addToCart(order);
    setShowCart(true);
    
    
    let message = '';
    if (order.products && Array.isArray(order.products)) {
      const productCount = order.products.length;
      message = `¡Pedido de ${order.name} añadido al carrito! (${productCount} producto${productCount > 1 ? 's' : ''}) 🛒`;
    } else {
      message = `¡${order.product || order.name} añadido al carrito! 🛒`;
    }
    
    showNotification(message, 'success');
  }, [addToCart, showNotification]);

  const handleOrderSubmit = () => {
    setShowOrderConfirmation(true);
  };

  const handleAdminLogin = useCallback((user) => {
    if (user.email === ADMIN_EMAIL) {
      setAdminUser(user);
      setAdminError('');
    } else {
      setAdminUser(null);
      setAdminError('Acceso denegado: solo el administrador puede ingresar.');
    }
  }, []);

  const handleLogoClick = useCallback(() => {
    goTo('/');
    setShowCart(false);
  }, [goTo]);

  const handleCartClick = useCallback(() => {
    setShowCart(true);
  }, []);

  const renderContent = () => {
    if (route === '/admin-quenita') {
      return (
        <Suspense fallback={<div className="loading-spinner">Cargando panel de administración...</div>}>
          {adminUser && adminUser.email === ADMIN_EMAIL ? (
                         <LazyAdminPanel 
               onLogout={() => { setAdminUser(null); setAdminError(''); }} 
               onBack={() => { goTo('/'); setAdminError(''); }} 
               setRoute={goTo}
             />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} adminError={adminError} />
          )}
        </Suspense>
      );
    }

    if (route === '/cocina') {
      return (
        <Suspense fallback={<div className="loading-spinner">Cargando panel de cocina...</div>}>
          <LazyCocinaPanel onBack={() => goTo('/')} setRoute={goTo} />
        </Suspense>
      );
    }

    if (route === '/caja') {
      return (
        <Suspense fallback={<div className="loading-spinner">Cargando panel de caja...</div>}>
          <LazyCajaPanel onBack={() => goTo('/')} setRoute={goTo} />
        </Suspense>
      );
    }

    if (route === '/cajero') {
      return (
        <Suspense fallback={<div className="loading-spinner">Cargando panel de cajero...</div>}>
          <LazyCajeroPanel onBack={() => goTo('/')} setRoute={goTo} />
        </Suspense>
      );
    }

    if (route === '/repartidor') {
      return (
        <Suspense fallback={<div className="loading-spinner">Cargando panel de repartidor...</div>}>
          <LazyRepartidorPanel onBack={() => goTo('/')} setRoute={goTo} />
        </Suspense>
      );
    }

    if (route === '/calendario') {
      return (
                 <Suspense fallback={<div className="loading-spinner">Cargando calendario de pedidos...</div>}>
           <LazyCalendarView onBack={() => goTo('/')} setRoute={goTo} />
         </Suspense>
      );
    }

    if (showOrderForm) {
      return (
        <OrderForm onAddToCart={order => {
          handleAddToCart(order);
          setShowOrderForm(false);
        }} />
      );
    }

    if (showCart) {
      return (
        <CartPage 
          cart={cart} 
          setCart={setCart} 
          onBack={() => setShowCart(false)} 
          showNotification={showNotification}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          updateQuantity={updateQuantity}
          showOrderConfirmation={showOrderConfirmation}
          setShowOrderConfirmation={setShowOrderConfirmation}
          onOrderSubmit={handleOrderSubmit}
        />
      );
    }

    return (
      <>
        <Hero />
        <div id="menu" role="region" aria-label="Menú de productos">
          <Menu />
        </div>
        <div id="order-form" role="region" aria-label="Formulario de pedido">
          <OrderForm onAddToCart={handleAddToCart} />
        </div>
        <div id="location" role="region" aria-label="Información de ubicación">
          <Location />
        </div>
      </>
    );
  };

  return (
    <div className="App">
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      {route !== '/admin-quenita' && (
        <Navbar
          cart={cart}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onCartClick={handleCartClick}
          onLogoClick={handleLogoClick}
        />
      )}
      
      <main role="main">
        {renderContent()}
      </main>
      
      <WhatsAppButton />
      <footer role="contentinfo">
        <p>&copy; {new Date().getFullYear()} Quenitas - El sabor chileno sobre ruedas</p>
      </footer>
    </div>
  );
}

export default App;
