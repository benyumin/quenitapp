import React from "react";

const Contact = () => (
  <section className="contact-section">
    <h2>Contacto</h2>
    <p>¿Tienes alguna pregunta o quieres hacer un pedido? ¡Contáctanos!</p>
    <ul>
      <li>Teléfono: 555-123-456</li>
      <li>Email: quenitas@ejemplo.com</li>
      <li>Instagram: <a href="https://www.instagram.com/quenitas.food/" target="_blank" rel="noopener noreferrer">@quenitas.food</a></li>
    </ul>
    <form className="contact-form">
      <input type="text" id="contact-name" name="contact-name" placeholder="Tu nombre" required style={{width:'100%',marginBottom:'0.7rem',padding:'0.7rem',borderRadius:'7px',border:'1px solid var(--border-color)',fontSize:'1rem',background:'var(--bg-secondary)',color:'var(--text-primary)'}} />
      <input type="email" id="contact-email" name="contact-email" placeholder="Tu email" required style={{width:'100%',marginBottom:'0.7rem',padding:'0.7rem',borderRadius:'7px',border:'1px solid var(--border-color)',fontSize:'1rem',background:'var(--bg-secondary)',color:'var(--text-primary)'}} />
      <textarea id="contact-message" name="contact-message" placeholder="Tu mensaje" required style={{width:'100%',marginBottom:'0.7rem',padding:'0.7rem',borderRadius:'7px',border:'1px solid var(--border-color)',fontSize:'1rem',minHeight:'90px',background:'var(--bg-secondary)',color:'var(--text-primary)'}}></textarea>
      <button type="submit" disabled style={{width:'100%',padding:'0.7rem',borderRadius:'7px',background:'var(--accent-primary)',color:'var(--bg-primary)',fontWeight:'bold',fontSize:'1.1rem',border:'none',cursor:'not-allowed',opacity:0.7}}>Enviar (próximamente)</button>
    </form>
  </section>
);

export default Contact; 