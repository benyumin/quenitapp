import React from "react";

const images = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
];

const Gallery = () => (
  <section className="gallery-section">
    <h2>Galería</h2>
    <div style={{display:'flex',flexWrap:'wrap',gap:'1.2rem',justifyContent:'center'}}>
      {images.map((img, idx) => (
        <img key={idx} src={img} alt={`Galería ${idx+1}`} style={{width:'180px',height:'120px',objectFit:'cover',borderRadius:'10px',boxShadow:'0 2px 8px var(--shadow-medium)'}} />
      ))}
    </div>
  </section>
);

export default Gallery; 