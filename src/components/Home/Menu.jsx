import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import completoImg from "../../assets/completo-italiano.jpg";
import papasImg from "../../assets/papas-fritas.jpg";
import barrosImg from "../../assets/barro-luco.jpg";
import fajitaImg from "../../assets/fajitasdepollo.png";
import assImg from "../../assets/ass.jpg";
import empanadaImg from "../../assets/empanada-de-quesoo.png";
import churrascoImg from "../../assets/churrasco.png";
import "./Menu.css";
import "./Menu-modern.css";

const Menu = ({ 
  cart, 
  setCart, 
  isLoggedIn, 
  userInfo
}) => {

  // Order form is now handled by parent App component

  const addToCart = (item) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Store the item that was clicked for later use
      localStorage.setItem('lastClickedItem', JSON.stringify(item));
      // User will be prompted to login when they try to complete the order
      return;
    }
    
    // If user is logged in, add to cart normally
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddToCartClick = (item) => {
    // Store the item that was clicked for later use
    localStorage.setItem('lastClickedItem', JSON.stringify(item));
    addToCart(item);
  };

  const products = [
    {
      id: 1,
      name: "Completo Italiano",
      description: "Hot dog con palta, tomate, mayonesa, chucrut y mayo de ajo",
      price: 5000,
      image: completoImg,
      category: "Hot Dogs",
      time: "10 min",
      ingredients: "Pan de hot dog, vienesa, palta, tomate, mayonesa, chucrut, mayo de ajo"
    },
    {
      id: 2,
      name: "Papas Fritas Chicas",
      description: "Porción de papas fritas crujientes",
      price: 2000,
      image: papasImg,
      category: "Acompañamientos",
      time: "8 min",
      ingredients: "Papas, aceite, sal"
    },
    {
      id: 3,
      name: "Churrasco Italiano",
      description: "Sándwich de carne con palta, tomate y mayonesa",
      price: 4500,
      image: churrascoImg,
      category: "Sándwiches",
      time: "12 min",
      ingredients: "Pan de molde, carne de vacuno, palta, tomate, mayonesa"
    },
    {
      id: 4,
      name: "Barros Luco",
      description: "Sándwich de carne con queso derretido",
      price: 4800,
      image: barrosImg,
      category: "Sándwiches",
      time: "10 min",
      ingredients: "Pan de molde, carne de vacuno, queso gouda"
    },
    {
      id: 5,
      name: "Fajita de Pollo",
      description: "Fajita de pollo con verduras y salsas",
      price: 5600,
      image: fajitaImg,
      category: "Fajitas",
      time: "15 min",
      ingredients: "Tortilla de trigo, pollo, pimiento, cebolla, salsa de tomate, queso, crema, guacamole, salsa picante"
    },
    {
      id: 6,
      name: "ASS Italiano",
      description: "Hot dog especial con palta, tomate, mayonesa, chucrut y mayo de ajo",
      price: 5000,
      image: assImg,
      category: "Hot Dogs",
      time: "10 min",
      ingredients: "Pan de hot dog, vienesa, palta, tomate, mayonesa, chucrut, mayo de ajo"
    },
    {
      id: 7,
      name: "Empanada de Queso",
      description: "Empanada rellena de queso derretido",
      price: 1500,
      image: empanadaImg,
      category: "Empanadas",
      time: "5 min",
      ingredients: "Masa de empanada, queso gouda, huevo"
    }
  ];

  const filteredAndSortedProducts = products;

  const formatPrice = (price) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  return (
    <div className="menu-wrapper">
      <section className="menu-section-modern" role="region" aria-label="Menú de productos">
        {/* Order form is now handled by parent App component */}
        
        <div className="menu-background-pattern"></div>
        
        <div className="menu-container-modern">
          <div className="menu-header-modern">
            <div className="menu-badge">
              <span className="badge-emoji">🍽️</span>
              <span className="badge-text">Nuestro Menú</span>
            </div>
            
            <h2 className="menu-title-modern">
              <span className="title-highlight">Sabores auténticos</span>
              <span className="title-main">chilenos</span>
            </h2>
            
            <p className="menu-description-modern">
              Descubre nuestra selección de <strong>completos tradicionales</strong>, 
              <strong>papas fritas caseras</strong> y especialidades únicas. 
              Cada plato preparado con ingredientes frescos y el sabor de la tradición chilena.
            </p>
            
            <div className="menu-divider">
              <div className="divider-line"></div>
              <div className="divider-star">★</div>
              <div className="divider-line"></div>
            </div>
            
            <div className="menu-socials-modern">
              <a 
                href="https://www.instagram.com/quenitas.food/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Síguenos en Instagram"
                className="social-link-modern instagram"
              >
                <div className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8A4.8 4.8 0 1 0 12 7.2Z" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="16.2" y="6.6" width="1.2" height="1.2" rx="0.6" fill="currentColor"/>
                    <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5.4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                </div>
                <span>Instagram</span>
              </a>
              <a 
                href="https://wa.me/56912345678" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Contactar por WhatsApp"
                className="social-link-modern whatsapp"
              >
                <div className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.03 2 11.05C2 13.13 2.88 15.06 4.36 16.54L2.5 21.5L7.66 19.7C9.06 20.44 10.68 20.87 12.5 20.87C18.02 20.87 22.5 16.84 22.5 11.82C22.5 6.8 18.02 2 12 2ZM12 18.87C10.5 18.87 9.09 18.5 7.91 17.84L7.5 17.62L5.5 18.25L6.13 16.29L5.91 15.88C4.7 14.5 4 12.82 4 11.05C4 7.13 7.58 4 12 4C16.42 4 20 7.13 20 11.05C20 14.97 16.42 18.87 12 18.87Z" fill="currentColor"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="cart-summary-section">
              <div className="cart-summary-content">
                <div className="cart-summary-info">
                  <h3>🛒 Tu Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</h3>
                  <p className="cart-total">Total: {formatPrice(calculateTotal())}</p>
                </div>
                <div className="cart-summary-actions">
                  <button 
                    className="view-cart-btn"
                    onClick={() => window.location.href = '/cart'}
                    aria-label="Ver carrito y hacer pedido"
                  >
                    Ver Carrito y Hacer Pedido
                  </button>
                  <button 
                    className="clear-cart-btn"
                    onClick={() => setCart([])}
                    aria-label="Limpiar carrito"
                  >
                    🗑️ Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="menu-grid-modern" role="list" aria-label="Lista de productos">
            {filteredAndSortedProducts.map((item, idx) => (
              <div 
                className="menu-card-modern" 
                key={item.id}
                role="listitem"
                aria-label={`${item.name} - ${formatPrice(item.price)}`}
                style={{animationDelay: `${idx * 100}ms`}}
              >
                <div className="card-glow"></div>
                
                <div className="card-image-container">
                  <div className="image-overlay"></div>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    loading="lazy"
                    decoding="async"
                    className="card-image"
                  />
                  <div className="image-shine"></div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{item.name}</h3>
                  <p className="card-description">{item.description}</p>
                  
                  <div className="card-price-section">
                    <div className="price-container">
                      <span className="price-amount">{formatPrice(item.price)}</span>
                      <span className="price-currency">CLP</span>
                    </div>
                    <button 
                      className="add-to-cart-btn" 
                      aria-label={`Agregar ${item.name} al carrito`}
                      onClick={() => handleAddToCartClick(item)}
                    >
                      <span className="btn-text">Agregar</span>
                      <div className="btn-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu; 