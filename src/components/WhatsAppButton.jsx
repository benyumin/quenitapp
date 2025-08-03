import React from "react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/56912345678"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      background: '#25D366',
      color: '#fff',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      zIndex: 100,
      textDecoration: 'none',
    }}
    aria-label="WhatsApp"
  >
    <span role="img" aria-label="WhatsApp">💬</span>
  </a>
);

export default WhatsAppButton; 