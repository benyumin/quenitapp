import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiUser, FiShoppingCart, FiPlus, FiX, FiCheck, FiCoffee, FiArrowLeft, FiPackage, FiDollarSign } from 'react-icons/fi';
import '../App.css';

const PRODUCTOS = [
  { id: 1, name: "Completo Italiano", price: 2500, category: "completos" },
  { id: 2, name: "Completo Clásico", price: 2200, category: "completos" },
  { id: 3, name: "Completo Especial", price: 2800, category: "completos" },
  { id: 4, name: "Churrasco", price: 3500, category: "sándwiches" },
  { id: 5, name: "Barros Luco", price: 3200, category: "sándwiches" },
  { id: 6, name: "Papas Fritas", price: 1800, category: "acompañamientos" },
  { id: 7, name: "Empanada de Queso", price: 1500, category: "acompañamientos" }
];

const BEBIDAS = [
  { id: 1, name: "Coca-Cola", price: 800 },
  { id: 2, name: "Fanta", price: 800 },
  { id: 3, name: "Sprite", price: 800 },
  { id: 4, name: "Café", price: 400 },
  { id: 5, name: "Té", price: 300 }
];

const CajeroPanel = ({ onBack, setRoute }) => {
  const [carrito, setCarrito] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [activeTab, setActiveTab] = useState('productos');

  const agregarAlCarrito = (item) => {
    setCarrito(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const removerDelCarrito = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.price, 0);
  };

  const calcularCambio = () => {
    const total = calcularTotal();
    const recibido = parseFloat(montoRecibido) || 0;
    return Math.max(0, recibido - total);
  };

  const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\s/g, '');
    const regex = /^(\+569|569|9)\d{8}$/;
    return regex.test(telefonoLimpio);
  };

  const limpiarTodo = () => {
    setCarrito([]);
    setClienteNombre('');
    setTelefono('');
    setTipoEntrega('retiro');
    setDireccion('');
    setObservaciones('');
    setMontoRecibido('');
    setMetodoPago('efectivo');
    setNumeroTarjeta('');
  };

  const confirmarPedido = async () => {
    if (!clienteNombre.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    if (!telefono.trim()) {
      alert('Por favor ingresa el teléfono del cliente');
      return;
    }

    if (!validarTelefono(telefono)) {
      alert('Por favor ingresa un teléfono válido (formato: +56912345678)');
      return;
    }

    if (carrito.length === 0) {
      alert('Por favor agrega al menos un producto al carrito');
      return;
    }

    if (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) {
      alert('El monto recibido debe ser mayor o igual al total del pedido');
      return;
    }

    if ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim()) {
      alert('Por favor ingresa el número de tarjeta');
      return;
    }

    setLoading(true);

    try {
      const pedidoData = {
        nombre: clienteNombre.trim(),
        telefono: telefono.trim(),
        producto: carrito.map(item => item.name).join(', '),
        precio_total: calcularTotal(),
        estado: 'PENDIENTE',
        direccion: tipoEntrega === 'domicilio' ? direccion : 'Retiro en local',
        tipo_entrega: tipoEntrega === 'retiro' ? 'Retiro en local' : 'Domicilio',
        bebida: carrito.filter(item => item.name.includes('Coca') || item.name.includes('Fanta') || item.name.includes('Sprite') || item.name.includes('Café') || item.name.includes('Té')).map(item => item.name).join(', '),
        personalizacion: JSON.stringify({}),
        resumen: observaciones ? observaciones : carrito.map(item => item.name).join(', '),
        cantidad: carrito.length,
        metodo_pago: metodoPago
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select();

      if (error) throw error;

      setPedidoConfirmado(data[0]);
      setShowConfirmModal(true);
      limpiarTodo();
    } catch (error) {
      console.error('Error creating pedido:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header mejorado */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              💰
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1f2937'
              }}>
                Cajero - Nuevo Pedido
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#6b7280',
                fontSize: '0.85rem'
              }}>
                Tomar pedidos de clientes en el local
              </p>
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '12px'}}>
            <button
              onClick={() => setRoute('/admin-quenita')}
              style={{
                background: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🏠 Panel Principal
            </button>
            
            <button
              onClick={() => setRoute('/cocina')}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🍳 Cocina
            </button>
            
            <button
              onClick={() => setRoute('/caja')}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💳 Caja
            </button>
            
            <button
              onClick={onBack}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '24px'
      }}>
        {/* Panel izquierdo */}
        <div>
          {/* Información del cliente */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiUser size={20} color="#6b7280"/>
              Información del Cliente
            </h2>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56912345678"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Tipo de Entrega
              </label>
              <select
                value={tipoEntrega}
                onChange={(e) => setTipoEntrega(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="retiro">🏪 Retiro en Local</option>
                <option value="domicilio">🚚 Domicilio</option>
              </select>
            </div>
            
            {tipoEntrega === 'domicilio' && (
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Instrucciones especiales..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="efectivo">💵 Efectivo</option>
                <option value="debito">💳 Tarjeta de Débito</option>
                <option value="credito">💳 Tarjeta de Crédito</option>
              </select>
            </div>

            {metodoPago === 'efectivo' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Monto Recibido
                </label>
                <input
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  placeholder="Monto en efectivo"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                {montoRecibido && (
                  <div style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiDollarSign color="#f59e0b"/>
                    <strong>Cambio:</strong> ${calcularCambio().toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {(metodoPago === 'debito' || metodoPago === 'credito') && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}>
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}
          </div>

          {/* Tabs para Productos y Bebidas */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              gap: '2px',
              marginBottom: '24px',
              background: '#f3f4f6',
              borderRadius: '10px',
              padding: '4px'
            }}>
              <button
                onClick={() => setActiveTab('productos')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'productos' ? '#ffffff' : 'transparent',
                  color: activeTab === 'productos' ? '#1f2937' : '#6b7280',
                  fontWeight: activeTab === 'productos' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: activeTab === 'productos' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                🍔 Productos
              </button>
              <button
                onClick={() => setActiveTab('bebidas')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'bebidas' ? '#ffffff' : 'transparent',
                  color: activeTab === 'bebidas' ? '#1f2937' : '#6b7280',
                  fontWeight: activeTab === 'bebidas' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: activeTab === 'bebidas' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                🥤 Bebidas
              </button>
            </div>

            {activeTab === 'productos' && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px'}}>
                {PRODUCTOS.map(producto => (
                  <div key={producto.id} style={{
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onClick={() => agregarAlCarrito(producto)}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div style={{flex: 1}}>
                        <div style={{
                          fontWeight: 700,
                          color: '#1f2937',
                          marginBottom: '6px',
                          fontSize: '1rem'
                        }}>
                          {producto.name}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#6b7280',
                          textTransform: 'capitalize'
                        }}>
                          {producto.category}
                        </div>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#10b981'
                        }}>
                          ${producto.price.toLocaleString()}
                        </span>
                        <button
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#059669'}
                          onMouseLeave={(e) => e.target.style.background = '#10b981'}
                        >
                          <FiPlus size={14}/> Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bebidas' && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                {BEBIDAS.map(bebida => (
                  <div key={bebida.id} style={{
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onClick={() => agregarAlCarrito(bebida)}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <div style={{
                          fontWeight: 700,
                          color: '#1f2937',
                          marginBottom: '4px',
                          fontSize: '1rem'
                        }}>
                          {bebida.name}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#6b7280'
                        }}>
                          Bebida
                        </div>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#3b82f6'
                        }}>
                          ${bebida.price.toLocaleString()}
                        </span>
                        <button
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                        >
                          <FiPlus size={14}/> Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Carrito */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          height: 'fit-content',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: '24px'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FiShoppingCart size={20} color="#6b7280"/>
            Carrito
          </h2>

          {carrito.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '20px',
                opacity: 0.4
              }}>
                🛒
              </div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#374151'
              }}>
                El carrito está vacío
              </h3>
              <p style={{
                fontSize: '0.9rem',
                margin: 0,
                opacity: 0.7
              }}>
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            <>
              <div style={{marginBottom: '20px', maxHeight: '400px', overflowY: 'auto'}}>
                {carrito.map((item, index) => (
                  <div key={index} style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{
                        fontWeight: 600,
                        color: '#1f2937',
                        marginBottom: '4px',
                        fontSize: '1rem'
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280'
                      }}>
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => removerDelCarrito(index)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    >
                      <FiX size={16}/>
                    </button>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '2px solid #e5e7eb',
                paddingTop: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#1f2937'
                }}>
                  <span>Total:</span>
                  <span style={{color: '#10b981'}}>${calcularTotal().toLocaleString()}</span>
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  onClick={limpiarTodo}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '2px solid #ef4444',
                    background: 'transparent',
                    color: '#ef4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fef2f2';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Limpiar
                </button>
                <button
                  onClick={confirmarPedido}
                  disabled={loading || !clienteNombre.trim() || !telefono.trim() || carrito.length === 0 || (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) || ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim())}
                  style={{
                    flex: 2,
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: 'none',
                                      background: loading || !clienteNombre.trim() || !telefono.trim() || carrito.length === 0 || (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) || ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim())
                    ? '#9ca3af' : '#10b981',
                  color: 'white',
                  fontWeight: 600,
                  cursor: loading || !clienteNombre.trim() || !telefono.trim() || carrito.length === 0 || (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) || ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                                      boxShadow: loading || !clienteNombre.trim() || !telefono.trim() || carrito.length === 0 || (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) || ((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim())
                    ? 'none' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading && clienteNombre.trim() && telefono.trim() && carrito.length > 0 && !(metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < calcularTotal())) && !((metodoPago === 'debito' || metodoPago === 'credito') && !numeroTarjeta.trim())) {
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}/>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FiCheck size={16}/> Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && pedidoConfirmado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>✅</div>
            <h3 style={{margin: '0 0 16px 0', color: '#1f2937', fontSize: '1.5rem', fontWeight: 700}}>
              ¡Pedido Confirmado!
            </h3>
            <p style={{margin: '0 0 24px 0', color: '#6b7280', fontSize: '1rem'}}>
              El pedido ha sido creado exitosamente y está en la cola de preparación.
            </p>
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{fontWeight: 700, marginBottom: '12px', color: '#1f2937'}}>Detalles del pedido:</div>
              <div style={{marginBottom: '8px'}}><strong>Cliente:</strong> {pedidoConfirmado.nombre}</div>
              <div style={{marginBottom: '8px'}}><strong>Teléfono:</strong> {pedidoConfirmado.telefono}</div>
              <div style={{marginBottom: '8px'}}><strong>Productos:</strong> {pedidoConfirmado.producto}</div>
              <div style={{marginBottom: '8px'}}><strong>Total:</strong> ${pedidoConfirmado.precio_total?.toLocaleString()}</div>
              <div style={{marginBottom: '8px'}}><strong>Método de Pago:</strong> {
                pedidoConfirmado.metodo_pago === 'efectivo' ? 'Efectivo' :
                pedidoConfirmado.metodo_pago === 'debito' ? 'Tarjeta de Débito' :
                pedidoConfirmado.metodo_pago === 'credito' ? 'Tarjeta de Crédito' : 'Efectivo'
              }</div>
              <div><strong>Estado:</strong> Pendiente</div>
              {pedidoConfirmado.resumen && (
                <div style={{marginTop: '8px'}}><strong>Observaciones:</strong> {pedidoConfirmado.resumen}</div>
              )}
            </div>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setPedidoConfirmado(null);
              }}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajeroPanel; 