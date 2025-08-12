import React from "react";
import "./Location-modern.css";

const Location = () => (
  <section className="location-section-modern">
    <div className="location-background-pattern"></div>
    
    <div className="location-container-modern">
      <div className="location-header-modern">
        <div className="location-badge">
          <span className="badge-emoji">📍</span>
          <span className="badge-text">Nuestra Ubicación</span>
        </div>
        
        <h2 className="location-title-modern">
          <span className="title-highlight">¡Aquí estamos</span>
          <span className="title-main">ubicados!</span>
        </h2>
        
        <p className="location-description-modern">
          Visítanos en nuestro <strong>foodtruck</strong> en el corazón de Melipilla. 
          Te esperamos con el mejor sabor chileno y la atención más cálida.
        </p>
      </div>
      
      <div className="location-content-grid">
        <div className="location-info-card">
          <div className="info-card-header">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3>Dirección</h3>
          </div>
          <div className="info-card-content">
            <p className="address">Melipilla 1350, Ortúzar</p>
            <p className="city">Santiago, Chile</p>
          </div>
          
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <span className="contact-label">Teléfono</span>
                <span className="contact-value">+56 9 1234 5678</span>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">⏰</div>
              <div className="contact-details">
                <span className="contact-label">Horarios</span>
                <span className="contact-value">Lun - Sab: 11:00 - 21:00</span>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">🚚</div>
              <div className="contact-details">
                <span className="contact-label">Delivery</span>
                <span className="contact-value">Radio 5km - Gratis</span>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <a 
              href="https://maps.google.com/?q=Melipilla+1350,+Ortúzar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Cómo llegar</span>
            </a>
            
            <a 
              href="tel:+56912345678" 
              className="action-btn secondary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Llamar</span>
            </a>
          </div>
        </div>
        
        <div className="location-map-container">
          <div className="map-header">
            <h3>Encuéntranos aquí</h3>
            <div className="map-badge">
              <span>🗺️ Vista interactiva</span>
            </div>
          </div>
          
          <div className="map-wrapper">
            <div className="map-glow"></div>
            <iframe
              title="Ubicación Quenitas Foodtruck"
              src="https://www.google.com/maps?q=Melipilla+1350,+Ortúzar&output=embed"
              width="100%"
              height="100%"
              className="location-map"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="map-overlay"></div>
          </div>
          
          <div className="map-features">
            <div className="feature-item">
              <span className="feature-icon">🅿️</span>
              <span>Estacionamiento disponible</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">♿</span>
              <span>Acceso para todos</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏪</span>
              <span>Zona comercial activa</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="location-cta">
        <div className="cta-content">
          <h3 className="cta-title">¿Listo para visitarnos?</h3>
          <p className="cta-subtitle">
            Te esperamos con el mejor sabor chileno y un servicio excepcional
          </p>
          <div className="cta-buttons">
            <a href="#order-form" className="cta-btn primary">
              <span>Hacer pedido</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
            <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className="cta-btn secondary">
              <span>WhatsApp</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Location; 