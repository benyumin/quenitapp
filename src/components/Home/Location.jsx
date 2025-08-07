import React from "react";

const Location = () => (
  <section className="location-section" style={{width:'100%', padding:'0 0 2rem 0'}}>
    <h2 style={{textAlign:'center',marginBottom:'1.2rem'}}>¡Aqui estamos ubicados!</h2>
    <div style={{ width: "100%", height: "min(420px,40vw)", minHeight: "320px", margin: "auto", borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 24px var(--shadow-medium)', border: '2px solid var(--accent-primary)', display:'flex', alignItems:'stretch', justifyContent:'center', background:'#fff' }}>
      <iframe
        title="Ubicación Quenitas"
        src="https://www.google.com/maps?q=Melipilla+1350,+Ortúzar&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0, minHeight:'320px', display:'block' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </section>
);

export default Location; 