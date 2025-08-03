import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import completoImg from "../assets/completo-italiano.jpg";
import papasImg from "../assets/papas-fritas.jpg";
import barrosImg from "../assets/barro-luco.jpg";
import fajitaImg from "../assets/fajitasdepollo.png";
import assImg from "../assets/ass.jpg";
import empanadaImg from "../assets/empanada-de-quesoo.png";
import churrascoImg from "../assets/churrasco.png";
import "./Menu.css";

const Menu = () => {

  const products = [
    {
      id: 1,
      name: "Completo Italiano",
      description: "Hot dog chileno con palta, tomate y mayonesa.",
      price: 2500,
      time: "5-8 min",
      image: completoImg,
      category: "completos",
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 2,
      name: "Papas Fritas",
      description: "Papas crujientes, servidas con salsa a elección.",
      price: 1800,
      time: "3-5 min",
      image: papasImg,
      category: "acompañamientos",
      popular: true,
      spicy: false,
      vegetarian: true
    },
    {
      id: 3,
      name: "Churrasco",
      description: "Sándwich de carne laminada con queso derretido, palta y tomate, coronado con papas fritas.",
      price: 3500,
      time: "8-12 min",
      image: churrascoImg,
      category: "sándwiches",
      popular: true,
      spicy: false,
      vegetarian: false
    },
    {
      id: 4,
      name: "Barros Luco",
      description: "Sándwich de carne y queso fundido en pan frica.",
      price: 3200,
      time: "7-10 min",
      image: barrosImg,
      category: "sándwiches",
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 5,
      name: "Fajita de Pollo",
      description: "Tortilla rellena de pollo, verduras frescas y salsa especial.",
      price: 2700,
      time: "6-9 min",
      image: fajitaImg,
      category: "especialidades",
      popular: false,
      spicy: true,
      vegetarian: false
    },
    {
      id: 6,
      name: "Completo Ass",
      description: "Completo especial con ingredientes sorpresa.",
      price: 2800,
      time: "5-8 min",
      image: assImg,
      category: "completos",
      popular: false,
      spicy: false,
      vegetarian: false
    },
    {
      id: 7,
      name: "Empanada de Queso",
      description: "Empanada frita rellena de queso fundido, crujiente por fuera y suave por dentro.",
      price: 1500,
      time: "4-7 min",
      image: empanadaImg,
      category: "acompañamientos",
      popular: false,
      spicy: false,
      vegetarian: true
    }
  ];

  const filteredAndSortedProducts = products;

  const formatPrice = (price) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  return (
    <section className="menu-section" role="region" aria-label="Menú de productos">
      <div className="menu-header">
        <div className="menu-socials">
          <a 
            href="https://www.instagram.com/quenitas.food/" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Síguenos en Instagram"
            className="social-link instagram"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#fff"/>
              <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8A4.8 4.8 0 1 0 12 7.2Z" stroke="#E1306C" strokeWidth="1.5"/>
              <rect x="16.2" y="6.6" width="1.2" height="1.2" rx="0.6" fill="#E1306C"/>
              <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5.4" stroke="#E1306C" strokeWidth="1.2" fill="none"/>
            </svg>
          </a>
          <a 
            href="https://wa.me/56912345678" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Contactar por WhatsApp"
            className="social-link whatsapp"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#fff"/>
              <path d="M12 2C6.48 2 2 6.03 2 11.05C2 13.13 2.88 15.06 4.36 16.54L2.5 21.5L7.66 19.7C9.06 20.44 10.68 20.87 12.5 20.87C18.02 20.87 22.5 16.84 22.5 11.82C22.5 6.8 18.02 2 12 2ZM12 18.87C10.5 18.87 9.09 18.5 7.91 17.84L7.5 17.62L5.5 18.25L6.13 16.29L5.91 15.88C4.7 14.5 4 12.82 4 11.05C4 7.13 7.58 4 12 4C16.42 4 20 7.13 20 11.05C20 14.97 16.42 18.87 12 18.87Z" fill="#25D366"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Mostrando {filteredAndSortedProducts.length} productos
        </p>
      </div>

      <div className="menu-list" role="list" aria-label="Lista de productos">
        {filteredAndSortedProducts.map((item, idx) => (
          <div 
            className="menu-item" 
            key={item.id}
            role="listitem"
            aria-label={`${item.name} - ${formatPrice(item.price)}`}
          >
            {item.popular && (
              <div className="card-category popular" aria-label="Producto popular">
                🔥 Popular
              </div>
            )}
            {item.spicy && (
              <div className="card-category spicy" aria-label="Producto picante">
                🌶️ Picante
              </div>
            )}
            {item.vegetarian && (
              <div className="card-category vegetarian" aria-label="Producto vegetariano">
                🌱 Vegetariano
              </div>
            )}
            
            <div className="menu-item-image-container">
              <img 
                src={item.image} 
                alt={item.name} 
                loading="lazy"
                decoding="async"
                className="menu-item-image"
              />
            </div>
            
            <div className="menu-item-content">
              <h3 className="menu-item-title">{item.name}</h3>
            <p className="description">{item.description}</p>
              
            <div className="product-info">
              <div className="time-info">
                  <span className="time-icon" aria-hidden="true">⏱️</span>
                <span>{item.time}</span>
                </div>
                <div className="category-info">
                  <span className="category-icon" aria-hidden="true">🍽️</span>
                  <span>{item.category}</span>
                </div>
              </div>
              
            <div className="price-section">
                <span className="price">{formatPrice(item.price)}</span>
              <span className="currency">CLP</span>
              </div>
            </div>
          </div>
        ))}
      </div>


    </section>
  );
};

export default Menu; 