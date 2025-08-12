import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import Menu from "./components/Home/Menu";
import Location from "./components/Home/Location";
import WhatsAppButton from "./components/Common/WhatsAppButton";
import OrderForm from "./components/Orders/OrderForm";
import logoQuenitasHero from "./assets/logoquenitamejorcalidad.jpeg";
import "./App.css";
import "./styles/components/cart-modern.css";
import logoQuenitas from "./assets/logoquenitamejorcalidad.jpeg";

import { supabase } from './components/lib/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthContainer from './components/Auth/AuthContainer';

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
    if (order.products && Array.isArray(order.products)) {
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
      
      setCart(prev => [...prev, orderWithCorrectTotal]);
    } else {
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
      if (item.products && Array.isArray(item.products)) {
        // Para órdenes con múltiples productos
        if (item.total && item.total > 0) {
          return acc + item.total;
        } else {
          // Calcular manualmente basándose en los productos
          const calculatedTotal = item.products.reduce((sum, product) => {
            const basePrice = product.price || 0;
            const beveragePrice = product.beveragePrice || 0;
            const customizationPrice = product.customizationPrice || 0;
            const itemTotal = (basePrice + beveragePrice + customizationPrice) * (product.quantity || 1);
            return sum + itemTotal;
          }, 0);
          return acc + calculatedTotal;
        }
      } else {
        // Para items individuales
        const basePrice = item.price || 0;
        const beveragePrice = item.beveragePrice || 0;
        const customizationPrice = item.customizationPrice || 0;
        const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
        return acc + itemTotal;
      }
    }, 0);
    
    const envio = cart.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + envio;
    
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

  const showNotification = useCallback((message, type = 'success', duration = 4000) => {
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
    
    // Auto-ocultar después del tiempo especificado
    if (duration > 0) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, isVisible: false }));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Helper functions for common notification types
  const showSuccess = useCallback((message, duration) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  return { 
    notification, 
    showNotification, 
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
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

function SectionDivider() {
  return (
    <div className="section-divider">
      <div className="divider-content">
        <div className="divider-line"></div>
        <div className="divider-icon">
          <span>🌟</span>
        </div>
        <div className="divider-line"></div>
      </div>
    </div>
  );
}

function Hero({ onShowNotificationDemo }) {
  return (
    <section className="hero-section-modern" role="banner" aria-label="Bienvenidos a Quenitas Foodtruck">
      <div className="hero-background-pattern"></div>
      <div className="hero-container-modern">
        <div className="hero-content-grid">
          <div className="hero-text-content">
            <h1 className="hero-title-modern">
              <span className="title-highlight">¡El sabor chileno</span>
              <span className="title-main">sobre ruedas!</span>
            </h1>
            
            <p className="hero-description-modern">
              Disfruta de auténticos <strong>completos</strong>, <strong>papas fritas</strong> crujientes 
              y mucho más en nuestro foodtruck. Sabor tradicional, calidad premium y la mejor onda chilena en cada bocado.
            </p>

            {/* Demo button for notifications */}
            <button 
              onClick={onShowNotificationDemo}
              className="notification-demo-btn"
              aria-label="Ver demostración de notificaciones"
            >
              🎯 Ver Notificaciones
            </button>
          </div>
          
          <div className="hero-visual-content">
            <div className="hero-image-container">
              <div className="image-decoration"></div>
              <img 
                src={logoQuenitasHero} 
                alt="Logo Quenita's - El sabor chileno sobre ruedas" 
                className="hero-logo-modern"
                loading="eager"
                decoding="async"
              />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Notification({ message, type, isVisible, onClose }) {
  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    info: '💡',
    warning: '⚠️'
  };

  const titles = {
    success: '¡Éxito!',
    error: 'Error',
    info: 'Información',
    warning: 'Advertencia'
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
      className={`notification notification-${type} ${isVisible ? 'show' : 'hide'}`}
      role="alert"
      aria-live="polite"
      aria-label={`Notificación ${type}`}
    >
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-icon" aria-hidden="true">
            {icons[type] || '💡'}
          </span>
          <span className="notification-title">{titles[type]}</span>
          <button 
            className="notification-close" 
            onClick={onClose}
            aria-label="Cerrar notificación"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="notification-message">{getMessage(message)}</div>
        <div className="notification-progress"></div>
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
    <div className="cart-item-img-mcdonalds">
      <img 
        src={isMultiProduct ? item.products[0]?.image : item.image} 
        alt={isMultiProduct ? "Pedido múltiple" : (item.product || item.name)} 
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextElementSibling.style.display = 'flex';
        }}
      />
      <div className="cart-item-fallback-mcdonalds">
        🍽️
      </div>
    </div>
  );

  const renderProductInfo = () => {
    if (isMultiProduct) {
      return (
        <div className="cart-item-info">
          <div className="item-header">
            <h3 className="item-title">Pedido de {item.name}</h3>
            <div className="item-badge">
              <span className="badge-icon">📦</span>
              <span className="badge-text">{item.products.length} producto{item.products.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="product-details">
            {item.products.map((product, pIdx) => (
              <div key={pIdx} className="product-line">
                <div className="product-main">
                  <span className="product-name">
                    {product.name} x{product.quantity || 1}
                  </span>
                  {product.beverage && product.beverage !== 'Sin bebida' && (
                    <span className="beverage-info">
                      🥤 {product.beverage}
                    </span>
                  )}
                </div>
                {product.customizations && Object.keys(product.customizations).length > 0 && (
                  <div className="customizations-list">
                    {Object.entries(product.customizations)
                      .filter(([key, value]) => value === true)
                      .filter(([key]) => key !== 'undefined' && key !== 'null')
                      .map(([customizationName], index) => (
                        <span key={index} className="customization-tag">
                          + {customizationName}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="cart-item-info">
        <div className="item-header">
          <h3 className="item-title">{item.product || item.name}</h3>
          <div className="item-badge">
            {item.beverage && item.beverage !== 'Sin bebida' ? (
              <span className="beverage-tag">
                🥤 {item.beverage}
              </span>
            ) : (
              <span className="no-beverage">Sin bebida</span>
            )}
          </div>
        </div>
        {item.customizations && (
          <div className="customizations-list">
            {Array.isArray(item.customizations) ? (
              // Handle array format (legacy)
              item.customizations.map((custom, i) => (
                <span key={i} className="customization-tag">
                  + {custom.name || custom}
                </span>
              ))
            ) : (
              // Handle object format (current)
              Object.entries(item.customizations)
                .filter(([key, value]) => value === true)
                .map(([customizationName], index) => (
                  <span key={index} className="customization-tag">
                    + {customizationName}
                  </span>
                ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuantityControls = () => {
    if (isMultiProduct) return null;
    
    return (
      <div className="cart-item-qty">
        <button 
          onClick={() => onQuantityChange(idx, -1)}
          className="qty-btn qty-minus"
          aria-label="Reducir cantidad"
          disabled={item.quantity <= 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span className="qty-display" aria-label={`Cantidad: ${item.quantity}`}>
          {item.quantity}
        </span>
        <button 
          onClick={() => onQuantityChange(idx, 1)}
          className="qty-btn qty-plus"
          aria-label="Aumentar cantidad"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    );
  };

  const renderPrice = () => {
    const itemTotal = isMultiProduct ? item.total : ((item.price || 0) * (item.quantity || 1));
    return (
      <div className="cart-item-price" aria-label={`Precio: ${itemTotal} CLP`}>
        <span className="price-currency">$</span>
        <span className="price-amount">{itemTotal?.toLocaleString()}</span>
        <span className="price-unit"> CLP</span>
      </div>
    );
  };

  const renderRemoveButton = () => {
    if (isMultiProduct) {
      return (
        <button 
          onClick={() => onRemove(idx, `Pedido de ${item.name}`)}
          className="remove-btn-multi"
          aria-label="Eliminar pedido"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      );
    }
    return null;
  };

  return (
    <div className="cart-item-row-mcdonalds" role="listitem">
      {renderProductImage()}
      <div className="cart-item-content-mcdonalds">
        <div className="item-main-info-mcdonalds">
          {renderProductInfo()}
          <div className="item-controls-mcdonalds">
            {renderQuantityControls()}
            {renderPrice()}
          </div>
        </div>
        {renderRemoveButton()}
      </div>
      
      {/* Enhanced Remove Button for Single Items */}
      {!isMultiProduct && (
        <button 
          onClick={() => onRemoveItem(idx, item.name)} 
          className="cart-remove-btn-enhanced"
          aria-label={`Eliminar ${item.name} del carrito`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span className="remove-text">Eliminar</span>
        </button>
      )}
    </div>
  );
}

// McDonald's-style upselling suggestions
const upsellingSuggestions = [
  { name: "Papas Fritas Chicas", price: 2000, image: "/src/assets/papas-fritas.jpg", emoji: "🍟", description: "Perfectas para acompañar" },
  { name: "Coca-Cola", price: 1200, image: "/src/assets/coca-cola.png", emoji: "🥤", description: "Refresca tu comida" },
  { name: "Empanada de Queso", price: 1500, image: "/src/assets/empanada-de-quesoo.png", emoji: "🥟", description: "Para picar algo más" }
];

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
  onOrderSubmit,
  user,
  goTo
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced upselling suggestions
  const upsellingSuggestions = [
    {
      name: 'Papas Fritas Chicas',
      description: 'Perfectas para acompañar',
      price: 2000,
      emoji: '🍟',
      image: 'papas-fritas.jpg'
    },
    {
      name: 'Coca-Cola',
      description: 'Refresca tu comida',
      price: 1200,
      emoji: '🥤',
      image: 'coca-cola.jpg'
    },
    {
      name: 'Empanada de Queso',
      description: 'Para picar algo más',
      price: 1500,
      emoji: '🥟',
      image: 'empanada.jpg'
    }
  ];
  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => {
      if (item.products && Array.isArray(item.products)) {
        if (item.total && item.total > 0) {
          return acc + item.total;
        } else {
          const calculatedTotal = item.products.reduce((sum, product) => {
            const basePrice = product.price || 0;
            const beveragePrice = product.beveragePrice || 0;
            const customizationPrice = product.customizationPrice || 0;
            const itemTotal = (basePrice + beveragePrice + customizationPrice) * (product.quantity || 1);
            return sum + itemTotal;
          }, 0);
          return acc + calculatedTotal;
        }
      } else {
        const basePrice = item.price || 0;
        const beveragePrice = item.beveragePrice || 0;
        const customizationPrice = item.customizationPrice || 0;
        const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
        return acc + itemTotal;
      }
    }, 0);
    
    const envio = cart.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + envio;
    
    return { subtotal, envio, total };
  };

  const { subtotal, envio, total } = calculateTotals();

  const quickAddToCart = async (suggestion) => {
    setIsAnimating(true);
    
    const newItem = {
      name: suggestion.name,
      product: suggestion.name,
      price: suggestion.price,
      quantity: 1,
      image: suggestion.image,
      beverage: 'Sin bebida',
      customizations: []
    };
    
    setCart(prev => [...prev, newItem]);
    
    // Animated success feedback
    showNotification(`¡${suggestion.name} añadido al carrito! 🎉`, 'success');
    
    // Add animation delay
    setTimeout(() => setIsAnimating(false), 500);
  };

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

  // Enhanced order submission with loading state
  const handleOrderSubmission = async () => {
    setIsProcessing(true);
    try {
      await onOrderSubmit();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmationClose = async () => {
      console.log('🚀 Iniciando guardado de pedidos...');
      console.log('🛒 Carrito:', cart);
      console.log('📦 Es orden múltiple?', cart.length > 0 && cart[0].products);
      
      try {
        const isMultiProductOrder = cart.length > 0 && cart[0].products;
        
        if (isMultiProductOrder) {
          console.log('📦 Guardando orden múltiple...');
          await saveMultiProductOrders(cart);
        } else {
          console.log('🍔 Guardando pedidos individuales...');
          await saveIndividualOrders(cart);
        }
        
        console.log('✅ Todos los pedidos guardados exitosamente');
        setShowOrderConfirmation(false);
        setCart([]);
        showNotification('¡Pedido enviado exitosamente! Te contactaremos pronto.', 'success');
        goTo('/');
      } catch (error) {
        console.error('❌ Error al guardar pedidos:', error);
        showNotification('Error al guardar los pedidos. Por favor intenta de nuevo.', 'error');
      }
    };

  const saveMultiProductOrders = async (orders) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    for (const order of orders) {
      try {
        // Crear pedido en tabla 'pedidos' (el cliente ya debe existir)
        const productsSummary = order.products.map(product => 
          `${product.name} x${product.quantity}`
        ).join(', ');
        
        const customizationsForDB = order.products.map(p => p.customizations);
        
        const { data: pedidoData, error: pedidoError } = await supabase
          .from('pedidos')
          .insert([{
            user_id: user.id, // Link order to authenticated user
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
          }])
          .select()
          .single();

        if (pedidoError) {
          console.error('Error guardando pedido:', pedidoError);
          throw pedidoError;
        }

        console.log('✅ Pedido guardado:', pedidoData);

      } catch (error) {
        console.error('Error en saveMultiProductOrders:', error);
        throw error;
      }
    }
  };

  const saveIndividualOrders = async (items) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    for (const item of items) {
      try {
        // Crear pedido en tabla 'pedidos' (el cliente ya debe existir)
        const { data: pedidoData, error: pedidoError } = await supabase
          .from('pedidos')
          .insert([{
            user_id: user.id, // Link order to authenticated user
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
          }])
          .select()
          .single();

        if (pedidoError) {
          console.error('Error guardando pedido:', pedidoError);
          throw pedidoError;
        }

        console.log('✅ Pedido guardado:', pedidoData);

      } catch (error) {
        console.error('Error en saveIndividualOrders:', error);
        throw error;
      }
    }
  };

  return (
    <div className="cart-outer-card-modern">
        <div className="cart-card-modern">
          {/* Enhanced Header with Gradient Background */}
          <div className="cart-header-modern">
            <div className="header-background">
              <div className="header-pattern"></div>
            </div>
            <div className="header-content">
              <div className="header-left">
                <button 
                  onClick={onBack} 
                  className="back-btn-modern"
                  aria-label="Volver al menú"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Volver
                </button>
              </div>
              <div className="header-center">
                <h1 className="cart-title-modern">
                  <span className="title-icon">🛒</span>
                  Mi Pedido
                </h1>
                <p className="cart-subtitle">Revisa y confirma tu pedido</p>
              </div>
              <div className="header-right">
                {cart.length > 0 && (
                  <button 
                    onClick={handleClear} 
                    className="cart-clear-btn-modern"
                    aria-label="Vaciar carrito completo"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        
                  {/* Enhanced Products Section */}
          <div className="cart-products-section-modern">
            <div className="section-header">
              <h2 className="section-title-modern">
                <span className="title-icon">🍽️</span>
                Productos ({cart.length})
              </h2>
              <div className="section-decoration"></div>
            </div>
            
            {cart.length === 0 ? (
              <div className="cart-empty-container-modern">
                <div className="empty-animation">
                  <div className="empty-icon-modern">🛒</div>
                  <div className="empty-pulse"></div>
                </div>
                <h3 className="empty-title-modern">¡Tu carrito está vacío!</h3>
                <p className="empty-desc-modern">
                  ¿Qué te apetece hoy? Tenemos completos, papas fritas y mucho más.
                </p>
                <div className="empty-actions-modern">
                  <button 
                    onClick={onBack} 
                    className="empty-btn-primary"
                  >
                    <span className="btn-icon">🍽️</span>
                    Ver Menú
                  </button>
                  <button 
                    onClick={() => document.getElementById('menu').scrollIntoView({behavior:'smooth'})} 
                    className="empty-btn-secondary"
                  >
                    <span className="btn-icon">🔍</span>
                    Explorar Productos
                  </button>
                </div>
                <div className="empty-tip-modern">
                  <div className="tip-icon">💡</div>
                  <div className="tip-content">
                    <h4>¿Sabías que?</h4>
                    <p>
                      Nuestros completos son 100% caseros y las papas fritas se preparan al momento. 
                      ¡Sabor auténtico chileno en cada bocado!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="products-grid-modern" role="list" aria-label="Productos en el carrito">
                {cart.map((item, idx) => (
                  <div key={idx} className="product-card-modern">
                    <CartItem
                      item={item}
                      idx={idx}
                      onRemove={handleRemove}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemove}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        
        {/* Enhanced Recommendations Section */}
        {cart.length > 0 && (
          <div className="recommendations-section-modern">
            <div className="section-header">
              <h3 className="section-title-modern">
                <span className="title-icon">💡</span>
                ¿Te gustaría agregar algo más?
              </h3>
              <p className="section-subtitle">Completa tu pedido con estas recomendaciones</p>
              <div className="section-decoration"></div>
            </div>
            
            <div className="recommendations-grid-modern">
              {upsellingSuggestions
                .filter(suggestion => !cart.some(item => 
                  (item.name || item.product) === suggestion.name
                ))
                .slice(0, 3)
                .map((suggestion, idx) => (
                  <div 
                    key={idx} 
                    className={`recommendation-card-modern ${isAnimating ? 'adding' : ''}`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="card-image-modern">
                      <span className="card-emoji">{suggestion.emoji}</span>
                      <div className="image-glow"></div>
                    </div>
                    <div className="card-content-modern">
                      <h4 className="card-title">{suggestion.name}</h4>
                      <p className="card-description">{suggestion.description}</p>
                      <div className="card-footer-modern">
                        <span className="card-price">${suggestion.price.toLocaleString()} CLP</span>
                        <button 
                          onClick={() => quickAddToCart(suggestion)}
                          className="add-btn-modern"
                          disabled={isAnimating}
                        >
                          <span className="btn-icon">+</span>
                          <span className="btn-text">Agregar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Enhanced Order Summary Section */}
        <div className="order-summary-modern">
          <div className="summary-header">
            <h3 className="summary-title">
              <span className="title-icon">📋</span>
              Resumen del Pedido
            </h3>
            <div className="summary-decoration"></div>
          </div>
          
          <div className="summary-content-modern">
            <div className="summary-row">
              <span className="row-label">Subtotal</span>
              <span className="row-value">${subtotal.toLocaleString()} CLP</span>
            </div>
            <div className="summary-row">
              <span className="row-label">Envío</span>
              <span className="row-value">${envio.toLocaleString()} CLP</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span className="row-label">Total</span>
              <span className="row-value">${total.toLocaleString()} CLP</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Action Buttons */}
        {cart.length > 0 && (
          <div className="cart-actions-modern">
            <div className="actions-container">
              <button 
                onClick={handleOrderSubmission} 
                className="order-btn-modern"
                disabled={isProcessing}
                aria-label="Realizar pedido"
              >
                <div className="btn-content">
                  {isProcessing ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🚀</span>
                      <span className="btn-text">Realizar Pedido</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </div>
                <div className="btn-glow"></div>
              </button>
              
              <button 
                onClick={onBack} 
                className="back-btn-modern-secondary"
                aria-label="Volver al menú"
              >
                <span className="btn-icon">←</span>
                <span className="btn-text">Volver al Menú</span>
              </button>
            </div>
            
            <div className="order-note">
              <div className="note-icon">💡</div>
              <p>Tu pedido será procesado inmediatamente y te contactaremos pronto</p>
            </div>
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
} // End of CartPage function

function Navbar({ cart, darkMode, toggleTheme, onCartClick, onLogoClick, onUserClick, isLoggedIn, userInfo, onLogout, isLoading, refreshUserProfile }) {
  // Debug: Log what we're receiving
  console.log('🔍 Navbar Debug:', { isLoggedIn, userInfo, isLoading });
  
  // Función para generar mensaje de bienvenida personalizado
  const getWelcomeMessage = (nombre) => {
    const hora = new Date().getHours();
    let saludo = '';
    
    if (hora >= 5 && hora < 12) {
      saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      saludo = 'Buenas tardes';
    } else {
      saludo = 'Buenas noches';
    }
    
    if (nombre) {
      return `${saludo}, ${nombre}`;
    } else {
      return saludo;
    }
  };
  
  // Efecto para refrescar el perfil cuando el usuario esté autenticado
  useEffect(() => {
    if (isLoggedIn && userInfo?.id && !userInfo?.nombre && !userInfo?.name && refreshUserProfile) {
      console.log('Usuario autenticado sin perfil completo, refrescando...');
      refreshUserProfile();
    }
  }, [isLoggedIn, userInfo, refreshUserProfile]);

  // Función para generar color único del avatar basado en la inicial
  const getAvatarColor = (inicial) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
      '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea', '#fed6e3',
      '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef', '#fecfef', '#fad0c4'
    ];
    
    if (!inicial) return colors[0];
    
    const charCode = inicial.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };
  
  const userInitial = userInfo?.nombre?.charAt(0)?.toUpperCase() || userInfo?.name?.charAt(0)?.toUpperCase() || 'U';
  const avatarColor = getAvatarColor(userInitial);
  
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
          
          {/* Cart Button */}
          <button 
            onClick={onCartClick} 
            className="cart-btn" 
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
          
          {/* Enhanced User Section */}
          <div className="user-section">
            {isLoading ? (
              <div className="loading-spinner-small"></div>
            ) : isLoggedIn ? (
              <>
                {/* User Info Display */}
                <div className="user-info-display">
                  <div className="user-avatar-enhanced" 
                       style={{ backgroundColor: avatarColor }}
                       title={`${userInfo?.nombre || userInfo?.name || 'Usuario'} - ${userInfo?.email || 'Sin email'}`}>
                    <span className="user-initial-enhanced">
                      {userInitial}
                    </span>
                    <div className="user-status-indicator" title="Usuario activo"></div>
                  </div>
                  <div className="user-details">
                    <span className="user-name">
                      {userInfo?.nombre || userInfo?.name || 'Usuario'}
                    </span>
                    <span className="user-welcome">
                      {getWelcomeMessage(userInfo?.nombre || userInfo?.name)}
                    </span>
                  </div>
                </div>

                {/* Debug Button - Solo en desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      console.log('=== DEBUG INFO ===');
                      console.log('isLoggedIn:', isLoggedIn);
                      console.log('userInfo:', userInfo);
                      console.log('isLoading:', isLoading);
                      if (refreshUserProfile) {
                        refreshUserProfile();
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      backgroundColor: '#ff6b35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '8px'
                    }}
                    title="Debug Info"
                  >
                    🐛
                  </button>
                )}
                
                {/* Enhanced Logout Button */}
                <button
                  onClick={onLogout}
                  className="logout-btn-enhanced"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span className="logout-text">Salir</span>
                </button>
              </>
            ) : (
              /* Login Button for non-authenticated users */
              <button 
                onClick={onUserClick}
                className="login-btn"
                aria-label="Iniciar sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="login-text">Iniciar Sesión</span>
              </button>
            )}
          </div>
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

function AppContent() {
  const { user, profile, signIn, signUp, signOut, isAuthenticated, loading: authContextLoading, refreshUserProfile } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, updateQuantity, setCart } = useCart();
  const { 
    notification, 
    showNotification, 
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  } = useNotifications();
  const { darkMode, toggleTheme } = useTheme();
  const { route, goTo } = useNavigation();

  // Ensure page starts at top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);




  
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  
  // Account-related state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

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
    if (!isAuthenticated) {
      setShowAccountModal(true);
      showNotification('Debes iniciar sesión para realizar el pedido', 'error');
      return;
    }
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
  
  const handleUserClick = useCallback(() => {
    if (isAuthenticated) {
      setShowAccountModal(true);
    } else {
      setShowAccountModal(true);
    }
  }, [isAuthenticated]);



  const handleShowLoginSection = useCallback(() => {
    setShowAccountModal(true);
  }, []);
  
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoginMode) {
      // Login logic
      if (!accountData.email || !accountData.password) {
        setAuthError('Por favor completa todos los campos');
        return;
      }
      
      setAuthError('');
      setAuthLoading(true);
      
      try {
        // Use the useAuth hook for login
        const result = await signIn(accountData.email, accountData.password);
        
        if (result.success) {
          setShowAccountModal(false);
          setAccountData({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
          
          // Check if there's a last clicked item to add to cart
          const lastClickedItem = localStorage.getItem('lastClickedItem');
          if (lastClickedItem) {
            const item = JSON.parse(lastClickedItem);
            addToCart(item);
            localStorage.removeItem('lastClickedItem');
          }
          
          showSuccess('¡Inicio de sesión exitoso!');
        } else {
          setAuthError(result.error);
        }
      } catch (error) {
        console.error('Login error:', error);
        setAuthError('Error inesperado. Inténtalo de nuevo.');
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Registration logic
      if (accountData.password !== accountData.confirmPassword) {
        setAuthError('Las contraseñas no coinciden');
        return;
      }

      if (accountData.password.length < 6) {
        setAuthError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      setAuthError('');
      setAuthLoading(true);
      
      try {
        console.log('Iniciando registro con datos:', { email: accountData.email, name: accountData.name, phone: accountData.phone });
        
        // Use the useAuth hook for registration
        const result = await signUp(accountData.email, accountData.password, {
          full_name: accountData.name,
          phone: accountData.phone
        });
        
        console.log('Resultado del registro:', result);
        
        if (result.success) {
          setShowAccountModal(false);
          setAccountData({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
          
          // Check if there's a last clicked item to add to cart
          const lastClickedItem = localStorage.getItem('lastClickedItem');
          if (lastClickedItem) {
            const item = JSON.parse(lastClickedItem);
            addToCart(item);
            localStorage.removeItem('lastClickedItem');
          }
          
          showSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
          // Switch to login mode
          setIsLoginMode(true);
        } else {
          console.error('Error en el registro:', result.error);
          setAuthError(result.error);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setAuthError('Error inesperado. Inténtalo de nuevo.');
      } finally {
        setAuthLoading(false);
      }
    }
  };
  
  const handleAccountSkip = () => {
    setShowAccountModal(false);
    localStorage.removeItem('lastClickedItem');
  };
  
  const handleResendConfirmation = async () => {
    if (!accountData.email) {
      setAuthError('Por favor ingresa tu email para reenviar la confirmación.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: accountData.email,
      });
      
              if (error) {
          setAuthError('Error al reenviar el email: ' + error.message);
        } else {
          showSuccess('Email de confirmación reenviado. Revisa tu bandeja de entrada.');
        }
    } catch (error) {
      setAuthError('Error inesperado al reenviar el email.');
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
        showError('Error al cerrar sesión');
        return;
      }

      // Clear cart and close modals
      setCart([]);
      setShowAccountModal(false);
      showSuccess('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error during logout:', error);
      showNotification('Error al cerrar sesión', 'error');
    }
  };
  
  const handleToggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setAuthError('');
    setAccountData({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
  };

  // Demo function to showcase different notification types
  const showNotificationDemo = () => {
    showSuccess('¡Esta es una notificación de éxito!');
    setTimeout(() => showInfo('Esta es una notificación informativa'), 1000);
    setTimeout(() => showWarning('Esta es una notificación de advertencia'), 2000);
    setTimeout(() => showError('Esta es una notificación de error'), 3000);
  };



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
        <OrderForm 
          onAddToCart={order => {
            handleAddToCart(order);
            setShowOrderForm(false);
          }}
                      onClose={() => setShowOrderForm(false)}
            isLoggedIn={isAuthenticated}
            userInfo={profile || user}
          />
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
          user={user}
          goTo={goTo}
        />
      );
    }

    return (
      <>
        <Hero onShowNotificationDemo={showNotificationDemo} />
        <SectionDivider />
        <div id="menu" role="region" aria-label="Menú de productos">
          <Menu 
            cart={cart}
            setCart={setCart}
            isLoggedIn={isAuthenticated}
            userInfo={profile || user}
          />
        </div>
        <SectionDivider />
        <div id="order-form" role="region" aria-label="Formulario de pedido">
                     <OrderForm 
             onAddToCart={handleAddToCart} 
             isLoggedIn={isAuthenticated}
             userInfo={profile || user}
           />
        </div>
        <SectionDivider />
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
          onUserClick={handleUserClick}
          isLoggedIn={isAuthenticated}
          userInfo={profile || user}
          onLogout={handleLogout}
          isLoading={authContextLoading}
          refreshUserProfile={refreshUserProfile}
        />
      )}
      
      <main role="main">
        {renderContent()}
      </main>
      
      <WhatsAppButton />
      <footer role="contentinfo">
        <p>&copy; {new Date().getFullYear()} Quenitas - El sabor chileno sobre ruedas</p>
      </footer>
      
      {/* Account Modal */}
      {showAccountModal && (
        <div className="account-modal-overlay" onClick={handleAccountSkip}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="account-header">
              <h2>{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
              <p>{isLoginMode ? 'Accede a tu cuenta para continuar' : 'Crea tu cuenta para hacer pedidos'}</p>
            </div>
            
            <form onSubmit={handleAccountSubmit} className="account-form">
              <div className="form-section">
                <h3>Información de la cuenta</h3>
                
                {!isLoginMode && (
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="name" className="form-label">
                        Nombre completo <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={accountData.name}
                        onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Tu nombre completo"
                        required={!isLoginMode}
                      />
                    </div>
                    
                    <div className="form-field">
                      <label htmlFor="phone" className="form-label">
                        Teléfono <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={accountData.phone}
                        onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                        className="form-input"
                        placeholder="+56 9 1234 5678"
                        required={!isLoginMode}
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="password" className="form-label">
                      Contraseña <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={accountData.password}
                      onChange={(e) => setAccountData(prev => ({ ...prev, password: e.target.value }))}
                      className="form-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                {!isLoginMode && (
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirmar contraseña <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="form-input"
                        placeholder="••••••••"
                        required={!isLoginMode}
                      />
                    </div>
                  </div>
                )}
                
                {authError && (
                  <div className="auth-error">
                    <span>⚠️</span>
                    <span>{authError}</span>
                  </div>
                )}
                
                {!isLoginMode && (
                  <div className="email-note">
                    <p>📧 <strong>Importante:</strong> Después de crear tu cuenta, recibirás un email de confirmación. Debes hacer clic en el enlace del email antes de poder iniciar sesión.</p>
                  </div>
                )}
                
                {isLoginMode && (
                  <div className="login-help">
                    <p>💡 <strong>¿Problemas para iniciar sesión?</strong> Asegúrate de haber confirmado tu email después de crear la cuenta.</p>
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResendConfirmation}
                      disabled={authLoading || !accountData.email}
                    >
                      📧 Reenviar email de confirmación
                    </button>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={authLoading}
                >
                  {authLoading ? 'Procesando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </button>
                
                <button
                  type="button"
                  className="skip-btn"
                  onClick={handleAccountSkip}
                  disabled={authLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
            
            <div className="auth-toggle">
              <p>
                {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={handleToggleAuthMode}
                  disabled={authLoading}
                >
                  {isLoginMode ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
