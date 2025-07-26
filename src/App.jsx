import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import Menu from "./components/Menu";
import Location from "./components/Location";
import WhatsAppButton from "./components/WhatsAppButton";
import OrderForm from "./components/OrderForm";
import completoImg from "./assets/completo-italiano.jpg";
import logoQuenitas from "./assets/logo quenitass.png";
import "./App.css";
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

// Lazy load components for better performance
const LazyAdminPanel = lazy(() => import('./components/AdminPanel'));
const LazyLogin = lazy(() => import('./components/Login'));

// Custom hook for cart management
const useCart = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('quenitas-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('quenitas-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((order) => {
    setCart(prev => [...prev, { ...order, quantity: order.quantity || 1 }]);
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
      i === idx ? { ...item, price: (item.price/item.quantity)*(item.quantity+delta), quantity: item.quantity+delta } : item
    ).filter(item => item.quantity > 0));
  }, []);

  return { cart, addToCart, removeFromCart, clearCart, updateQuantity, setCart };
};

// Custom hook for notifications
const useNotifications = () => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { notification, showNotification, hideNotification };
};

// Custom hook for theme management
const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('quenitas-dark') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('quenitas-dark', darkMode);
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return { darkMode, toggleTheme };
};

function Hero() {
  return (
    <section className="hero-section" role="banner" aria-label="Bienvenidos a Quenitas Foodtruck">
      <div className="hero-content">
        <img 
          src={completoImg} 
          alt="Completo Quenitas - El sabor chileno sobre ruedas" 
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

  return (
    <div 
      className={`notification ${type}`}
      role="alert"
      aria-live="polite"
      aria-label={`Notificación ${type}`}
    >
      <div className="notification-content">
        <span className="notification-icon" aria-hidden="true">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span className="notification-message">{message}</span>
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
          <span role="img" aria-label="Éxito">✅</span>
        </div>
        <h2>¡Pedido Realizado!</h2>
        <p>Su pedido ha sido enviado correctamente.</p>
        <p><strong>Prontamente su pedido estará LISTO</strong></p>
        <div className="confirmation-total">
          <strong>Total: ${total} CLP</strong>
        </div>
        <div className="confirmation-actions">
          <button 
            onClick={onConfirm} 
            className="confirm-btn"
            aria-label="Confirmar pedido"
          >
            ¡Perfecto!
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, setCart, onBack, showNotification, removeFromCart, clearCart, updateQuantity, showOrderConfirmation, setShowOrderConfirmation }) {
  const envio = cart.length > 0 ? 1500 : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal + envio;
  const waText = cart.map((item, i) => `Pedido ${i+1}: ${item.summary}`).join("\n\n");
  const waLink = `https://wa.me/56971297911?text=${encodeURIComponent(waText + `\n\nTotal: $${total} CLP`)}&app_absent=0`;
  
  const handleRemove = (idx, itemName) => {
    if (removeFromCart(idx, itemName)) {
      showNotification(`¡${itemName} eliminado del carrito! 🗑️`, 'success');
    }
  };
  
  const handleClear = () => {
    if (clearCart()) {
      showNotification('¡Carrito vaciado! 🛒', 'info');
    }
  };

  const handleQuantityChange = (idx, delta) => {
    updateQuantity(idx, delta);
  };

  const handleOrderSubmit = () => {
    setShowOrderConfirmation(true);
    // Abrir WhatsApp después de mostrar la confirmación
    setTimeout(() => {
      window.open(waLink, '_blank');
    }, 500);
  };

  const handleConfirmationClose = () => {
    setShowOrderConfirmation(false);
    // Limpiar el carrito después de confirmar
    setCart([]);
    onBack();
  };

  return (
    <>
      {showOrderConfirmation && (
        <OrderConfirmation 
          onConfirm={handleConfirmationClose}
          total={total}
        />
      )}
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
                  style={{background:'#ffb347',color:'#232323',padding:'0.8rem 1.5rem'}}
                >
                Ver Menú
              </button>
                <button 
                  onClick={() => document.getElementById('menu').scrollIntoView({behavior:'smooth'})} 
                  className="hero-btn" 
                  style={{background:'#e67e22',color:'white',padding:'0.8rem 1.5rem'}}
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
                <div key={idx} className="cart-item-row" role="listitem">
                  <div className="cart-item-img">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
              <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <div style={{fontSize:'0.98em',color:'var(--text-secondary)'}}>
                      {item.summary}
                    </div>
                {item.beverage && (
                      <div style={{fontSize:'0.98em',color:'var(--text-secondary)'}}>
                        {item.beverage} ({item.beverageType})
                      </div>
                )}
                <button 
                  onClick={() => handleRemove(idx, item.name)} 
                    className="cart-remove-btn"
                      aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    <span role="img" aria-label="Eliminar">🗑️</span> Eliminar
                </button>
              </div>
              <div className="cart-item-qty">
                    <button 
                      onClick={() => handleQuantityChange(idx, -1)}
                      aria-label="Reducir cantidad"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(idx, 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-price" aria-label={`Precio: ${item.price} CLP`}>
                    ${item.price} CLP
                  </div>
              </div>
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
              onClick={handleOrderSubmit}
              className="cart-wa-btn"
              aria-label="Realizar pedido"
            >
              <span className="wa-icon" role="img" aria-label="WhatsApp">🟢</span> 
              Enviar pedido por WhatsApp
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
      </div>
    </>
  );
}

function App() {
  const { cart, addToCart, removeFromCart, clearCart, updateQuantity, setCart } = useCart();
  const { notification, showNotification, hideNotification } = useNotifications();
  const { darkMode, toggleTheme } = useTheme();
  
  const [showCart, setShowCart] = useState(false);
  const [cartPage, setCartPage] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [route, setRoute] = useState(window.location.pathname);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);

  const ADMIN_EMAIL = 'benjaminalvarao12@gmail.com';

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goTo = useCallback((path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  }, []);

  const handleAddToCart = useCallback((order) => {
    addToCart(order);
    setShowCart(true);
    showNotification(`¡${order.name} añadido al carrito! 🛒`, 'success');
  }, [addToCart, showNotification]);

  const renderNavbar = () => (
    <header className="main-header" role="banner">
      <nav role="navigation" aria-label="Navegación principal">
        <span 
          className="logo" 
          style={{display:'flex',alignItems:'center',gap:'0.6rem',cursor:'pointer'}} 
          onClick={()=>{goTo('/'); setCartPage(false);}}
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio"
          onKeyDown={(e) => e.key === 'Enter' && (goTo('/'), setCartPage(false))}
        >
          <img 
            src={logoQuenitas} 
            alt="Logo Quenita's" 
            style={{
              height:'38px',
              width:'38px',
              objectFit:'contain',
              borderRadius:'8px',
              background:'#fff',
              padding:'2px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.10)'
            }} 
          />
          <span style={{
            fontFamily:'Poppins,Montserrat,sans-serif',
            fontWeight:700,
            fontSize:'1.45rem',
            color:'var(--accent-primary)',
            letterSpacing:'-1px'
          }}>
            quenita's
          </span>
        </span>
        <div className="header-actions">
          {route !== '/admin-quenita' && (
            <>
              <button
                className="dark-toggle"
                onClick={toggleTheme}
                aria-label={`Cambiar a modo ${darkMode ? 'claro' : 'oscuro'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button 
                className="cart-btn" 
                onClick={() => setCartPage(true)} 
                aria-label={`Ver carrito (${cart.length} productos)`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6.5"/>
                </svg>
                {cart.length > 0 && (
                  <span className="cart-count" aria-label={`${cart.length} productos en el carrito`}>
                    {cart.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );

  return (
    <div className="App">
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      {renderNavbar()}
      <main role="main">
        {route === '/admin-quenita' ? (
          <Suspense fallback={<div className="loading-spinner">Cargando panel de administración...</div>}>
            {adminUser && adminUser.email === ADMIN_EMAIL ? (
              <LazyAdminPanel 
              onLogout={() => { setAdminUser(null); setAdminError(''); }} 
              onBack={() => { goTo('/'); setAdminError(''); }} 
            />
          ) : (
              <div style={{
                maxWidth:400,
                margin:'3rem auto',
                padding:24,
                background:'var(--bg-secondary)',
                borderRadius:12,
                boxShadow:'0 2px 12px var(--shadow-dark)'
              }}>
                <LazyLogin onLogin={user => {
                if (user.email === ADMIN_EMAIL) {
                  setAdminUser(user);
                  setAdminError('');
                } else {
                  setAdminUser(null);
                  setAdminError('Acceso denegado: solo el administrador puede ingresar.');
                }
              }} />
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
            )}
          </Suspense>
        ) : cartPage ? (
          <CartPage 
            cart={cart} 
            setCart={setCart} 
            onBack={()=>setCartPage(false)} 
            showNotification={showNotification}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            updateQuantity={updateQuantity}
            showOrderConfirmation={showOrderConfirmation}
            setShowOrderConfirmation={setShowOrderConfirmation}
          />
        ) : (
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
        )}
      </main>
      <WhatsAppButton />
      <footer role="contentinfo">
        <p>&copy; {new Date().getFullYear()} Quenitas - El sabor chileno sobre ruedas</p>
      </footer>
    </div>
  );
}

export default App;
