import React, { useState, useMemo, useCallback } from "react";
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('popular');

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

  const categories = [
    { id: 'todos', name: 'Todos', icon: '🍽️' },
    { id: 'completos', name: 'Completos', icon: '🌭' },
    { id: 'sándwiches', name: 'Sándwiches', icon: '🥪' },
    { id: 'especialidades', name: 'Especialidades', icon: '⭐' },
    { id: 'acompañamientos', name: 'Acompañamientos', icon: '🍟' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Más populares', icon: '🔥' },
    { id: 'price-low', name: 'Menor precio', icon: '💰' },
    { id: 'price-high', name: 'Mayor precio', icon: '💎' },
    { id: 'time', name: 'Más rápidos', icon: '⚡' }
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.popular - a.popular);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'time':
        filtered.sort((a, b) => parseInt(a.time.split('-')[0]) - parseInt(b.time.split('-')[0]));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const formatPrice = (price) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  return (
    <section className="menu-section" role="region" aria-label="Menú de productos">
      <div className="menu-header">
        <h2>🍔 ¡Descubre el sabor chileno sobre ruedas!</h2>
        <p>
          En Quenitas Foodtruck te ofrecemos los mejores completos, papas fritas y sándwiches. 
          ¡Sabor, calidad y buena onda en cada bocado!
        </p>
        
        {}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              aria-label="Buscar productos en el menú"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          <h3>Categorías</h3>
          <div className="category-buttons" role="tablist" aria-label="Filtrar por categoría">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                role="tab"
                aria-selected={selectedCategory === category.id}
                aria-label={`Filtrar por ${category.name}`}
              >
                <span className="category-icon" aria-hidden="true">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="sort-container">
          <label htmlFor="sort-select" className="sort-label">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
            aria-label="Ordenar productos"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.icon} {option.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="menu-action-btn" 
          onClick={() => document.getElementById('order-form').scrollIntoView({behavior: 'smooth'})}
          aria-label="Ir al formulario de pedido"
        >
          ¡Hacer Pedido Ahora!
        </button>
        
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
              <path d="M12 2C6.48 2 2 6.03 2 11.05C2 13.13 2.88 15.06 4.36 16.54L2.5 21.5L7.66 19.7C9.06 20.44 10.68 20.87 12.5 20.87C18.02 20.87 22.5 16.84 22.5 11.82C22.5 6.8 18.02 2 12 2ZM12 18.87C10.5 18.87 9.09 18.5 7.91 17.84L7.5 17.62L5.5 18.25L6.13 16.29L5.91 15.88C4.7 14.5 4 12.82 4 11.05C4 7.13 7.58 4 12 4C16.42 4 20 7.13 20 11.05C20 14.97 16.42 18.87 12 18.87ZM16.09 14.09C15.91 13.91 15.5 13.75 15.09 13.62C14.68 13.5 14.5 13.5 14.32 13.75C14.14 14 13.77 14.5 13.59 14.68C13.41 14.86 13.23 14.91 13.05 14.82C12.86 14.73 12.09 14.5 11.09 13.5C10.09 12.5 9.86 11.73 9.77 11.54C9.68 11.36 9.73 11.18 9.91 11C10.09 10.82 10.59 10.45 10.82 10.27C11.05 10.09 11.05 9.91 10.95 9.73C10.86 9.55 10.68 9.14 10.5 8.91C10.32 8.68 10.14 8.68 9.95 8.68C9.77 8.68 9.5 8.68 9.23 8.91C8.95 9.14 8.5 9.59 8.5 10.18C8.5 10.77 8.91 11.68 9.77 12.54C10.64 13.41 11.55 13.82 12.14 13.82C12.73 13.82 13.18 13.36 13.41 13.09C13.64 12.82 13.64 12.64 13.64 12.45C13.64 12.27 13.64 12.09 13.41 11.91C13.18 11.73 12.77 11.55 12.5 11.55C12.23 11.55 12.05 11.73 11.86 11.91C11.68 12.09 11.68 12.27 11.68 12.45C11.68 12.64 11.68 12.82 11.86 13.09C12.05 13.36 12.5 13.82 13.09 13.82C13.68 13.82 14.09 13.41 14.09 12.82C14.09 12.23 13.68 11.82 13.09 11.82C12.5 11.82 12.09 12.23 12.09 12.82C12.09 13.41 12.5 13.82 13.09 13.82C13.68 13.82 14.09 13.41 14.09 12.82Z" fill="#25D366"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          {filteredAndSortedProducts.length === 0 
            ? 'No se encontraron productos que coincidan con tu búsqueda.'
            : `Mostrando ${filteredAndSortedProducts.length} de ${products.length} productos`
          }
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
                  <span className="category-icon" aria-hidden="true">
                    {categories.find(cat => cat.id === item.category)?.icon || '🍽️'}
                  </span>
                  <span>{categories.find(cat => cat.id === item.category)?.name || item.category}</span>
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

      {filteredAndSortedProducts.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon" aria-hidden="true">🔍</div>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todos');
            }}
            className="reset-filters-btn"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
};

export default Menu; 