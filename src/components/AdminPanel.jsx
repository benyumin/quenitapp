import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import {
  FiPhone, FiClock, FiFileText, FiChevronRight, FiChevronLeft, FiCheckCircle, FiXCircle, FiInfo, FiUser
} from 'react-icons/fi';
import '../App.css';

// Estados y reglas de transición
const ESTADOS = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#FFF9DB', border: '#FFE066', text: '#B59B00', icon: <FiInfo /> },
  { key: 'EN_PREPARACION', label: 'En preparación', color: '#E0F7FA', border: '#4DD0E1', text: '#007C91', icon: <FiClock /> },
  { key: 'LISTO', label: 'Listo para entrega', color: '#F3E8FF', border: '#C084FC', text: '#7C3AED', icon: <FiChevronRight /> },
  { key: 'ENTREGADO', label: 'Entregado', color: '#E6F9ED', border: '#34D399', text: '#166534', icon: <FiCheckCircle /> },
  { key: 'CANCELADO', label: 'Cancelado', color: '#FFE5E5', border: '#F87171', text: '#B91C1C', icon: <FiXCircle /> },
];

const TRANSICIONES = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['LISTO', 'CANCELADO'],
  LISTO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: []
};

// Utilidad para obtener info de estado
const getEstadoInfo = (key) => ESTADOS.find(e => e.key === key) || ESTADOS[0];

// Generar boleta PDF
function generarBoletaPDF(pedido) {
  const doc = new jsPDF();
  let y = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Boleta de Pedido', 105, y, { align: 'center' });
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(pedido.created_at).toLocaleString()}`, 15, y); y += 8;
  doc.text(`Cliente: ${pedido.nombre || 'N/A'}`, 15, y); y += 8;
  doc.text(`Producto: ${pedido.producto || 'N/A'}`, 15, y); y += 8;
  doc.text('Ingredientes:', 15, y); y += 7;
  try {
    const pers = pedido.personalizacion ? JSON.parse(pedido.personalizacion) : {};
    const selected = Object.entries(pers).filter(([,v]) => v).map(([k]) => k);
    if (selected.length > 0) {
      selected.forEach(ing => { doc.text(`- ${ing}`, 22, y); y += 6; });
    } else {
      doc.text('- Sin personalización', 22, y); y += 6;
    }
  } catch {
    doc.text(`- ${pedido.personalizacion || 'Sin personalización'}`, 22, y); y += 6;
  }
  doc.text(`Estado: ${pedido.estado || 'PENDIENTE'}`, 15, y); y += 8;
  doc.text(`Total: $${pedido.precio_total ? pedido.precio_total.toLocaleString() : '0'} CLP`, 15, y);
  doc.save(`boleta_${(pedido.nombre || 'desconocido').replace(/\s/g, '_')}_${pedido.id ? String(pedido.id).substring(0,8).toUpperCase() : 'N_A'}.pdf`);
}

// Formato de hora relativa
function formatElapsedTime(createdAt) {
  const timeElapsed = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (timeElapsed < 1) return 'recién';
  if (timeElapsed < 60) return `hace ${timeElapsed} min`;
  if (timeElapsed < 1440) {
    const hours = Math.floor(timeElapsed / 60);
    return `hace ${hours} hr${hours === 1 ? '' : 's'}`;
  }
  const days = Math.floor(timeElapsed / 1440);
  return `hace ${days} día${days === 1 ? '' : 's'}`;
}

const AdminPanel = ({ onLogout, onBack }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
  const fetchPedidos = async () => {
    setLoading(true);
      const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
      setPedidos(data || []);
    setLoading(false);
  };
    fetchPedidos();
  }, []);

  // Cambiar estado con validación de transición
  const cambiarEstado = async (id, actual, nuevo) => {
    if (!TRANSICIONES[actual]?.includes(nuevo)) return;
    await supabase.from('pedidos').update({ estado: nuevo }).eq('id', id);
    setPedidos(pedidos => pedidos.map(p => p.id === id ? { ...p, estado: nuevo } : p));
  };

  // Agrupar pedidos por estado
  const pedidosPorEstado = ESTADOS.reduce((acc, est) => {
    acc[est.key] = pedidos.filter(p => (p.estado || 'PENDIENTE') === est.key);
    return acc;
  }, {});

  // Render ingredientes
  const renderIngredientes = (personalizacion) => {
    if (!personalizacion) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
    try {
      const obj = JSON.parse(personalizacion);
      const selected = Object.entries(obj).filter(([,v]) => v).map(([k]) => k);
      if (selected.length === 0) return <span style={{color:'#aaa', fontStyle:'italic'}}>Sin personalización</span>;
      return (
        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
          {selected.map(ing => <span key={ing} style={{background:'#f1f5f9',color:'#2563eb',borderRadius:6,padding:'2px 8px',fontSize:'0.93em',fontWeight:600,marginBottom:2}}>{ing}</span>)}
        </div>
      );
    } catch {
      return <span style={{color:'#64748b'}}>{personalizacion}</span>;
    }
  };

  // Responsivo: columnas horizontales en desktop, apiladas en móvil
  return (
    <div style={{minHeight:'100vh',background:'#f6f8fa',padding:0,fontFamily:'Inter,Poppins,Montserrat,sans-serif'}}>
      <header style={{position:'sticky',top:0,zIndex:20,background:'#f6f8fa',boxShadow:'0 1px 4px #0001',padding:'0.5rem 0',marginBottom:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'100vw',margin:'0 auto',padding:'0 2vw'}}>
          <span style={{fontWeight:900,fontSize:'1.7rem',color:'#2563eb',letterSpacing:'-1px',display:'flex',alignItems:'center',gap:10}}><FiUser/> quenita's</span>
          <div style={{display:'flex',gap:10}}>
            <button onClick={onBack} className="admin-btn secondary" style={{fontSize:'1em',padding:'7px 16px'}}>Volver</button>
            <button onClick={onLogout} className="admin-btn danger" style={{fontSize:'1em',padding:'7px 16px'}}>Salir</button>
      </div>
        </div>
      </header>
      <div style={{display:'flex',gap:18,alignItems:'flex-start',width:'100vw',overflowX:'auto',padding:'1.5rem 0 1.5rem 0',boxSizing:'border-box',flexWrap:'wrap'}}>
        {ESTADOS.map(estado => {
          const info = getEstadoInfo(estado.key);
          return (
            <div key={estado.key} style={{
              flex:1,minWidth:260,maxWidth:400,background:info.color,borderRadius:18,boxShadow:'0 2px 12px #0001',padding:'1rem 0.5rem 1.2rem 0.5rem',display:'flex',flexDirection:'column',alignItems:'center',border:`2px solid ${info.border}`
            }}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:12}}>
                <span style={{fontSize:'2rem',marginBottom:2}}>{info.icon}</span>
                <span style={{fontWeight:900,fontSize:'1.1rem',color:info.text,letterSpacing:'-1px'}}>{info.label}</span>
                <span style={{marginTop:2,background:'#fff',color:info.text,borderRadius:10,padding:'2px 14px',fontWeight:800,fontSize:'1em',boxShadow:'0 1px 4px #0001'}}>{pedidosPorEstado[estado.key].length}</span>
            </div>
              <div style={{width:'100%',display:'flex',flexDirection:'column',gap:12}}>
                {pedidosPorEstado[estado.key].length===0 ? (
                  <div style={{textAlign:'center',color:'#b2bec3',fontSize:'1em',fontStyle:'italic',marginTop:18}}>Sin pedidos</div>
            ) : (
                  pedidosPorEstado[estado.key].map((pedido) => {
                    const actual = pedido.estado || 'PENDIENTE';
                    const esFinal = actual === 'ENTREGADO' || actual === 'CANCELADO';
                return (
                      <div key={pedido.id} className="admin-card" style={{background:'#fff',borderRadius:14,boxShadow:'0 1px 6px #0001',padding:'0.9rem 0.7rem',margin:'0 auto',maxWidth:380,display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'box-shadow 0.2s',border:`1.5px solid ${info.border}`,position:'relative',cursor:'pointer'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:2}}>
                          <span className="admin-avatar" style={{background:info.border,color:info.text,border:`2px solid ${info.border}`,fontWeight:900,fontSize:'1.1em',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%'}}>{pedido.nombre ? pedido.nombre.charAt(0).toUpperCase() : '?'}</span>
                          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',minWidth:0}}>
                            <span style={{fontWeight:900,fontSize:'1em',color:'#23272f',lineHeight:1.1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{pedido.nombre || 'Cliente'}</span>
                            <span style={{fontWeight:700,fontSize:'0.97em',color:'#38bdf8',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{pedido.producto || 'Producto'}</span>
                          </div>
                        </div>
                        <div style={{width:'100%',display:'flex',flexWrap:'wrap',gap:4,margin:'4px 0 2px 0'}}>{renderIngredientes(pedido.personalizacion)}</div>
                        <div style={{width:'100%',display:'flex',alignItems:'center',gap:6,margin:'2px 0 0 0',fontSize:'0.93em',color:'#64748b'}}>
                          <FiClock/> {formatElapsedTime(pedido.created_at)}
                      </div>
                        <div style={{width:'100%',display:'flex',gap:8,marginTop:8,justifyContent:'center'}}>
                          {/* Botón de boleta siempre visible */}
                          <button onClick={()=>generarBoletaPDF(pedido)} className="admin-btn" style={{background:'#38BDF8',padding:'7px 12px',fontWeight:800,fontSize:'0.97em',borderRadius:7}} title="Descargar boleta"><FiFileText/> Boleta</button>
                          {/* Botón detalles solo si no es final */}
                          {!esFinal && (
                            <button onClick={()=>setExpandedId(expandedId===pedido.id?null:pedido.id)} className="admin-btn secondary" style={{padding:'7px 12px',fontWeight:800,fontSize:'0.97em',borderRadius:7}}>{expandedId===pedido.id?'Ocultar':'Detalles'}</button>
                          )}
                        </div>
                        {/* Botones de transición solo si no es final */}
                        {!esFinal && (
                          <div style={{width:'100%',marginTop:5,display:'flex',gap:8,justifyContent:'center'}}>
                            {TRANSICIONES[actual].map(nuevo => (
                              <button
                                key={nuevo}
                                onClick={()=>cambiarEstado(pedido.id,actual,nuevo)}
                                className="admin-btn"
                                style={{background:getEstadoInfo(nuevo).border,color:'#fff',padding:'7px 12px',fontWeight:800,fontSize:'0.97em',borderRadius:7,opacity:TRANSICIONES[actual].includes(nuevo)?1:0.5,cursor:TRANSICIONES[actual].includes(nuevo)?'pointer':'not-allowed'}}
                                disabled={!TRANSICIONES[actual].includes(nuevo)}
                              >
                                {getEstadoInfo(nuevo).label}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Detalles expandidos */}
                        {expandedId===pedido.id && !esFinal && (
                          <div style={{marginTop:10,padding:'10px 8px',background:'#f6f8fa',borderRadius:8,boxShadow:'0 1px 4px #0001',fontSize:'0.95em',color:'#23272f',fontWeight:500,width:'100%'}}>
                            <div style={{marginBottom:5}}><b>Dirección:</b> {pedido.direccion||'Retiro'}</div>
                            <div style={{marginBottom:5}}><b>Bebida:</b> {pedido.bebida} {pedido.tipo_bebida?`(${pedido.tipo_bebida})`:''}</div>
                            <div style={{marginBottom:5}}><b>Resumen:</b> {pedido.resumen}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPanel;