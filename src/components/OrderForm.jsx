import React, { useState, useEffect } from 'react';
import completoImg from "../assets/completo-italiano.jpg";
import papasImg from "../assets/papas-fritas.jpg";
import barrosImg from "../assets/barro-luco.jpg";
import fajitaImg from "../assets/fajitasdepollo.png";
import assImg from "../assets/ass.jpg";
import empanadaImg from "../assets/empanada-de-quesoo.png";
import churrascoImg from "../assets/churrasco.png";
import './OrderForm.css';
import { supabase } from '../supabaseClient';

const products = [
  // COMPLETOS NORMAL
  { name: "Completo Especial", price: 900, category: "Completos Normal", image: completoImg },
  { name: "Completo Tomate Mayo", price: 1400, category: "Completos Normal", image: completoImg },
  { name: "Completo Italiano", price: 1900, category: "Completos Normal", image: completoImg },
  { name: "Completo Completo", price: 1900, category: "Completos Normal", image: completoImg },
  { name: "Completo Dinámico", price: 2000, category: "Completos Normal", image: completoImg },
  
  // COMPLETOS XL
  { name: "Completo XL Especial", price: 1400, category: "Completos XL", image: completoImg },
  { name: "Completo XL Tomate Mayo", price: 2200, category: "Completos XL", image: completoImg },
  { name: "Completo XL Italiano", price: 2700, category: "Completos XL", image: completoImg },
  { name: "Completo XL Completo", price: 2700, category: "Completos XL", image: completoImg },
  { name: "Completo XL Dinámico", price: 2900, category: "Completos XL", image: completoImg },
  
  // CHURRASCOS
  { name: "Churrasco Italiano", price: 3700, category: "Churrascos", image: churrascoImg },
  { name: "Churrasco Luco", price: 4200, category: "Churrascos", image: churrascoImg },
  
  // ASS NORMAL
  { name: "ASS Italiano", price: 3700, category: "ASS Normal", image: assImg },
  { name: "ASS Luco", price: 4200, category: "ASS Normal", image: assImg },
  { name: "ASS Dinámico", price: 4200, category: "ASS Normal", image: assImg },
  { name: "ASS Brasil", price: 4700, category: "ASS Normal", image: assImg },
  
  // ASS XL
  { name: "ASS XL Italiano", price: 4700, category: "ASS XL", image: assImg },
  { name: "ASS XL Luco", price: 5000, category: "ASS XL", image: assImg },
  { name: "ASS XL Dinámico", price: 5000, category: "ASS XL", image: assImg },
  { name: "ASS XL Brasil", price: 5500, category: "ASS XL", image: assImg },
  
  // PAPAS FRITAS
  { name: "Papas Fritas Chicas", price: 2000, category: "Papas Fritas", image: papasImg },
  { name: "Papas Fritas Grandes", price: 3000, category: "Papas Fritas", image: papasImg },
  
  // FAJITAS
  { name: "Fajita de Carne", price: 3800, category: "Fajitas", image: fajitaImg },
  { name: "Fajita de Pollo", price: 3800, category: "Fajitas", image: fajitaImg },
  { name: "Fajita de Champiñón", price: 3800, category: "Fajitas", image: fajitaImg },
  
  // EMPANADAS
  { name: "Empanada de Queso", price: 1200, category: "Empanadas", image: empanadaImg },
  { name: "Empanada de Champiñón", price: 1700, category: "Empanadas", image: empanadaImg },
  { name: "Empanada de Pollo Merken", price: 1700, category: "Empanadas", image: empanadaImg },
  
  // PAN
  { name: "Pan Queso Caliente", price: 1700, category: "Pan", image: barrosImg },
  { name: "Pan Ave/Mayo", price: 2000, category: "Pan", image: barrosImg }
];

const beverages = [
  { name: "Bebida", price: 800, types: ["Fanta", "Coca-Cola", "Sprite", "Limon Soda", "Pap"] },
  { name: "Café", price: 400, types: ["Americano", "Cappuccino", "Espresso", "Latte"] },
  { name: "Té", price: 300, types: ["Té Negro", "Té Verde", "Té de Hierbas", "Té de Frutas"] }
];

const productCustomizations = {
  // COMPLETOS NORMAL
  "Completo Especial": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo Tomate Mayo": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo Completo": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo Dinámico": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  
  // COMPLETOS XL
  "Completo XL Especial": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo XL Tomate Mayo": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo XL Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo XL Completo": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Completo XL Dinámico": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  
  // CHURRASCOS
  "Churrasco Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Queso Extra", price: 500, default: false },
    { name: "Papas Fritas", price: 0, default: true },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Churrasco Luco": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Queso Extra", price: 500, default: false },
    { name: "Papas Fritas", price: 0, default: true },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  
  // ASS NORMAL
  "ASS Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS Luco": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS Dinámico": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS Brasil": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  
  // ASS XL
  "ASS XL Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS XL Luco": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS XL Dinámico": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  "ASS XL Brasil": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Salsa Secreta", price: 300, default: true }
  ],
  
  // PAPAS FRITAS
  "Papas Fritas Chicas": [
    { name: "Ketchup", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: false },
    { name: "Mostaza", price: 0, default: false },
    { name: "Salsa Verde", price: 200, default: false },
    { name: "Salsa Picante", price: 200, default: false }
  ],
  "Papas Fritas Grandes": [
    { name: "Ketchup", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: false },
    { name: "Mostaza", price: 0, default: false },
    { name: "Salsa Verde", price: 200, default: false },
    { name: "Salsa Picante", price: 200, default: false }
  ],
  
  // FAJITAS
  "Fajita de Carne": [
    { name: "Salsa Especial", price: 0, default: true },
    { name: "Queso Extra", price: 400, default: false },
    { name: "Guacamole", price: 300, default: false },
    { name: "Salsa Picante", price: 200, default: false },
    { name: "Crema", price: 200, default: false }
  ],
  "Fajita de Pollo": [
    { name: "Salsa Especial", price: 0, default: true },
    { name: "Queso Extra", price: 400, default: false },
    { name: "Guacamole", price: 300, default: false },
    { name: "Salsa Picante", price: 200, default: false },
    { name: "Crema", price: 200, default: false }
  ],
  "Fajita de Champiñón": [
    { name: "Salsa Especial", price: 0, default: true },
    { name: "Queso Extra", price: 400, default: false },
    { name: "Guacamole", price: 300, default: false },
    { name: "Salsa Picante", price: 200, default: false },
    { name: "Crema", price: 200, default: false }
  ],
  
  // EMPANADAS
  "Empanada de Queso": [
    { name: "Queso Extra", price: 300, default: false },
    { name: "Salsa Verde", price: 200, default: false },
    { name: "Pebre", price: 200, default: false }
  ],
  "Empanada de Champiñón": [
    { name: "Queso Extra", price: 300, default: false },
    { name: "Salsa Verde", price: 200, default: false },
    { name: "Pebre", price: 200, default: false }
  ],
  "Empanada de Pollo Merken": [
    { name: "Queso Extra", price: 300, default: false },
    { name: "Salsa Verde", price: 200, default: false },
    { name: "Pebre", price: 200, default: false }
  ],
  
  // PAN
  "Pan Queso Caliente": [
    { name: "Queso Extra", price: 500, default: false },
    { name: "Mayonesa", price: 0, default: false },
    { name: "Mostaza", price: 0, default: false }
  ],
  "Pan Ave/Mayo": [
    { name: "Queso Extra", price: 500, default: false },
    { name: "Mayonesa", price: 0, default: false },
    { name: "Mostaza", price: 0, default: false }
  ]
};

const defaultCustomizations = [
  { name: "Sin personalización", price: 0, default: true }
];

const OrderForm = ({ onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [beverageType, setBeverageType] = useState('');
  const [customizations, setCustomizations] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryType, setDeliveryType] = useState('retiro');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cardHolderRut, setCardHolderRut] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardError, setCardError] = useState('');
  const envio = 900;
  const [showErrors, setShowErrors] = useState(false);

  const getCurrentCustomizations = () => {
    return productCustomizations[selectedProduct.name] || defaultCustomizations;
  };

  useEffect(() => {
    const currentCustomizations = getCurrentCustomizations();
    const newCustomizations = {};
    currentCustomizations.forEach(item => {
      newCustomizations[item.name] = item.default;
    });
    setCustomizations(newCustomizations);
  }, [selectedProduct]);

  const getCustomizationSummary = () => {
    const currentCustomizations = getCurrentCustomizations();
    const selected = Object.entries(customizations)
      .filter(([_, isSelected]) => isSelected)
      .map(([name, _]) => name);
    const notSelected = Object.entries(customizations)
      .filter(([_, isSelected]) => !isSelected)
      .map(([name, _]) => name);
    let summary = '';
    if (selected.length > 0) {
      summary += `con ${selected.join(', ')}`;
    }
    if (notSelected.length > 0) {
      if (summary) summary += ', ';
      summary += `sin ${notSelected.join(', sin ')}`;
    }
    return summary;
  };

  const calculateTotal = () => {
    let total = selectedProduct.price;
    if (selectedBeverage) {
      total += selectedBeverage.price;
    }
    const currentCustomizations = getCurrentCustomizations();
    Object.entries(customizations).forEach(([name, isSelected]) => {
      if (isSelected) {
        const customization = currentCustomizations.find(c => c.name === name);
        if (customization && customization.price > 0) {
          total += customization.price;
        }
      }
    });
    if (deliveryType === 'despacho') {
      total += envio;
    }
    return total;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+569')) {
      value = '+569' + value.replace(/[^0-9]/g, '');
    }
    value = value.slice(0, 12).replace(/(\+569)(\d{0,8}).*/, '$1$2');
    setPhoneNumber(value);
    if (value.length === 12 && !/^\+569\d{8}$/.test(value)) {
      setPhoneError('El teléfono debe tener el formato +569XXXXXXXX');
    } else {
      setPhoneError('');
    }
  };

  const handleBeverageChange = (e) => {
    if (e.target.value === '') {
      setSelectedBeverage(null);
      setBeverageType('');
    } else {
      const beverage = beverages.find(b => b.name === e.target.value);
      setSelectedBeverage(beverage);
      setBeverageType(beverage.types[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert('Por favor completa tu nombre y teléfono');
      return;
    }

    if (!/^\+569\d{8}$/.test(phoneNumber)) {
      alert('El teléfono debe tener el formato +569XXXXXXXX');
      return;
    }

    if (selectedBeverage && !beverageType) {
      alert('Por favor selecciona el tipo de bebida');
      return;
    }

    if (deliveryType === 'despacho' && !address.trim()) {
      alert('Por favor ingresa la dirección para el despacho');
      return;
    }

    if ((paymentMethod === 'debito' || paymentMethod === 'credito')) {
      if (!cardHolderRut.trim() || !cardNumber.match(/^\d{16}$/) || !cardExpiry.match(/^\d{2}\/\d{2}$/) || !cardCVV.match(/^\d{3,4}$/)) {
        setCardError('Completa todos los datos de la tarjeta correctamente.');
        return;
      }
      setCardError('');
    }

    const order = {
      name: selectedProduct.name,
      price: calculateTotal(),
      quantity: 1,
      beverage: selectedBeverage ? selectedBeverage.name : null,
      beverageType: selectedBeverage ? beverageType : null,
      customizations: customizations,
      customerName: customerName,
      phoneNumber: phoneNumber,
      deliveryType: deliveryType,
      address: deliveryType === 'despacho' ? address : null,
      paymentMethod: paymentMethod,
      cardHolderRut: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardHolderRut : null,
      cardNumber: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardNumber : null,
      cardExpiry: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardExpiry : null,
      cardCVV: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardCVV : null,
      image: selectedProduct.image,
      summary: `${selectedProduct.name} ${getCustomizationSummary()}${selectedBeverage ? ` + ${selectedBeverage.name} (${beverageType})` : ''}${deliveryType === 'despacho' ? ` | Despacho a: ${address}` : ' | Retiro en local'} | Pago: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`
    };

    try {
    const { error } = await supabase.from('pedidos').insert([
      {
        nombre: customerName,
        telefono: phoneNumber,
        producto: selectedProduct.name,
        cantidad: 1,
        precio_total: calculateTotal(),
        personalizacion: JSON.stringify(customizations),
        bebida: selectedBeverage ? selectedBeverage.name : null,
        tipo_bebida: selectedBeverage ? beverageType : null,
        tipo_entrega: deliveryType,
        direccion: deliveryType === 'despacho' ? address : null,
        metodo_pago: paymentMethod,
        rut_titular: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardHolderRut : null,
        numero_tarjeta: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardNumber : null,
        fecha_vencimiento: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardExpiry : null,
        cvv: (paymentMethod === 'debito' || paymentMethod === 'credito') ? cardCVV : null,
        resumen: order.summary,
      }
    ]);
    if (error) {
      alert('Error al guardar el pedido en la base de datos');
      return;
    }
    alert('¡Pago simulado exitoso! Pedido guardado.');
    
    onAddToCart(order);
    
    setSelectedBeverage(null);
    setBeverageType('');
    const currentCustomizations = getCurrentCustomizations();
    const resetCustomizations = {};
    currentCustomizations.forEach(item => {
      resetCustomizations[item.name] = item.default;
    });
    setCustomizations(resetCustomizations);
    setCustomerName('');
    setPhoneNumber('');
    setDeliveryType('retiro');
    setAddress('');
    setPaymentMethod('efectivo');
    setCardHolderRut('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardError('');
    } catch (err) {
      alert('Ocurrió un error inesperado: ' + (err.message || err));
    }
  };

  const toggleCustomization = (name) => {
    setCustomizations(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="order-form-container order-form-bg" style={{padding:'2rem 0', minHeight:'100vh'}}>
      <div className="order-form-card" style={{maxWidth:900, margin:'0 auto', gap:'1.5rem', padding:'2.2rem 2.2rem 1.5rem 2.2rem'}}>
        <h2 style={{fontFamily:'Inter,Segoe UI,sans-serif',fontSize:'2rem',fontWeight:800,marginBottom:'1.2rem',marginTop:0,letterSpacing:'-1px',textAlign:'center',color:'#2563eb'}}>¡Haz tu pedido! <span style={{fontSize:'1.2rem'}}>🍽️</span></h2>
        <form onSubmit={handleSubmit} className="order-form" style={{width:'100%',display:'flex',flexDirection:'row',gap:'2rem',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'center'}}>
          <div style={{flex:2,minWidth:320,display:'flex',flexDirection:'column',gap:'1.1rem'}}>
            <div className="product-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11',marginBottom:0}}>
              <div className="product-image" style={{marginBottom:8,display:'flex',justifyContent:'center'}}>
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{width:80,height:80,borderRadius:10,objectFit:'cover',border:'2px solid #4ade80',boxShadow:'0 2px 8px #4ade8033'}} />
              </div>
              <div className="product-selection">
                <div className="form-group" style={{marginBottom:0}}>
                  <label style={{fontWeight:700,fontSize:'1em'}}>Producto</label>
                  <select 
                    value={selectedProduct.name}
                    onChange={(e) => {
                      const product = products.find(p => p.name === e.target.value);
                      setSelectedProduct(product);
                    }}
                    className="form-select"
                    style={{
                      border: '2px solid #38BDF8',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: '1.08em',
                      fontWeight: 700,
                      marginBottom: 8,
                      width: '100%',
                      outline: 'none',
                      boxShadow: '0 1px 4px #0001',
                      appearance: 'none',
                      transition: 'border 0.2s',
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {products.map((product, idx) => (
                      <option key={idx} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <div className="product-price-label" style={{marginTop:6,fontWeight:800,fontSize:'1.1em',borderRadius:6,padding:'4px 0',textAlign:'center'}}>{selectedProduct.price} CLP</div>
                </div>
              </div>
            </div>
            <div className="beverage-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11'}}>
              <label style={{fontWeight:700,fontSize:'1em'}}>Bebida</label>
              <select
                value={selectedBeverage ? selectedBeverage.name : ''}
                onChange={handleBeverageChange}
                className="form-select"
                style={{
                  border: '2px solid #38BDF8',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.08em',
                  fontWeight: 700,
                  marginBottom: 8,
                  width: '100%',
                  outline: 'none',
                  boxShadow: '0 1px 4px #0001',
                  appearance: 'none',
                  transition: 'border 0.2s',
                }}
              >
                <option value="">Sin bebida</option>
                {beverages.map((bev, idx) => (
                  <option key={idx} value={bev.name}>{bev.name}</option>
                ))}
              </select>
            </div>
            {selectedBeverage && selectedBeverage.types && selectedBeverage.types.length > 0 && (
              <select
                value={beverageType}
                onChange={e => setBeverageType(e.target.value)}
                style={{
                  border: '2px solid #38BDF8',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.08em',
                  fontWeight: 700,
                  marginBottom: 8,
                  width: '100%',
                  outline: 'none',
                  boxShadow: '0 1px 4px #0001',
                  appearance: 'none',
                  transition: 'border 0.2s',
                }}
                required
              >
                <option value="">Selecciona tipo de {selectedBeverage.name.toLowerCase()}</option>
                {selectedBeverage.types.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            )}
            <div className="customization-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11'}}>
              <label style={{fontWeight:700,fontSize:'1em'}}>Personaliza tu pedido</label>
              <div className="customization-grid" style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:6}}>
                {getCurrentCustomizations().map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`customization-btn ${customizations[option.name] ? 'selected' : ''}`}
                    onClick={() => toggleCustomization(option.name)}
                    style={{padding:'7px 14px',borderRadius:8,border:customizations[option.name]?'2px solid #4ade80':'2px solid #b2bec3',fontWeight:700,fontSize:'0.98em',transition:'all 0.15s'}}
                  >
                    {customizations[option.name] ? '✓' : '□'} {option.name}
                    {option.price > 0 && ` +$${option.price}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="contact-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11'}}>
              <div style={{display:'flex',gap:'1rem',flexDirection:window.innerWidth>700?'row':'column'}}>
                <div className="form-group" style={{flex:1}}>
                  <label style={{fontWeight:700,fontSize:'1em'}}>Tu nombre</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre"
                    className="form-input"
                    style={{
                      border: showErrors && customerName.trim() === '' ? '2px solid #f87171' : '2px solid #38BDF8',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: '1.08em',
                      fontWeight: 700,
                      marginBottom: 8,
                      width: '100%',
                      outline: 'none',
                      boxShadow: '0 1px 4px #0001',
                      transition: 'border 0.2s',
                    }}
                    required
                  />
                  {showErrors && customerName.trim() === '' && (
                    <div className="input-error-message" style={{color:'#f87171',fontSize:'0.97em',marginTop:2}}>Por favor ingresa tu nombre.</div>
                  )}
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label style={{fontWeight:700,fontSize:'1em'}}>Teléfono</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+56912345678"
                    className="form-input phone-input"
                    style={{
                      border: showErrors && (phoneNumber.trim() === '' || phoneError) ? '2px solid #f87171' : '2px solid #38BDF8',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: '1.08em',
                      fontWeight: 700,
                      marginBottom: 8,
                      width: '100%',
                      outline: 'none',
                      boxShadow: '0 1px 4px #0001',
                      transition: 'border 0.2s',
                    }}
                    required
                  />
                  {showErrors && phoneError && (
                    <div className="input-error-message" style={{color:'#f87171',fontSize:'0.97em',marginTop:2}}>{phoneError}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="delivery-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11'}}>
              <div className="form-group">
                <label style={{fontWeight:700,fontSize:'1em'}}>¿Cómo quieres tu pedido?</label>
                <select 
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="form-select"
                  style={{
                    border: '2px solid #38BDF8',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontSize: '1.08em',
                    fontWeight: 700,
                    marginBottom: 8,
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 4px #0001',
                    appearance: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="retiro">Retiro en el local</option>
                  <option value="despacho">Despacho a domicilio (+{envio} CLP)</option>
                </select>
                {deliveryType === 'despacho' && (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dirección de entrega"
                    className="form-input"
                    style={{marginTop: '0.7rem',border: '1.5px solid #4ade80',fontSize:'1em'}}
                    required
                  />
                )}
              </div>
            </div>
            <div className="payment-section" style={{borderRadius:14,padding:'1.1rem',boxShadow:'0 1px 4px #2563eb11'}}>
              <div className="form-group">
                <label style={{fontWeight:700,fontSize:'1em'}}>¿Cómo vas a pagar?</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="form-select"
                  style={{
                    border: '2px solid #38BDF8',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontSize: '1.08em',
                    fontWeight: 700,
                    marginBottom: 8,
                    width: '100%',
                    outline: 'none',
                    boxShadow: '0 1px 4px #0001',
                    appearance: 'none',
                    transition: 'border 0.2s',
                  }}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              {(paymentMethod === 'debito' || paymentMethod === 'credito') && (
                <div className="card-fields" style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginTop:'0.7rem'}}>
                  <div className="form-group" style={{flex:'1 1 180px'}}>
                    <label style={{fontWeight:700,fontSize:'1em'}}>RUT titular</label>
                    <input
                      type="text"
                      value={cardHolderRut || ''}
                      onChange={e => setCardHolderRut(e.target.value)}
                      placeholder="12.345.678-9"
                      className="form-input"
                      style={{
                        border: showErrors && !cardHolderRut.trim() ? '2px solid #f87171' : '2px solid #38BDF8',
                        borderRadius: 8,
                        padding: '12px 16px',
                        fontSize: '1.08em',
                        fontWeight: 700,
                        marginBottom: 8,
                        width: '100%',
                        outline: 'none',
                        boxShadow: '0 1px 4px #0001',
                        transition: 'border 0.2s',
                      }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{flex:'1 1 180px'}}>
                    <label style={{fontWeight:700,fontSize:'1em'}}>Número de tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber || ''}
                      onChange={e => setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0,16))}
                      placeholder="4242 4242 4242 4242"
                      className="form-input"
                      style={{
                        border: showErrors && !cardNumber.match(/^\d{16}$/) ? '2px solid #f87171' : '2px solid #38BDF8',
                        borderRadius: 8,
                        padding: '12px 16px',
                        fontSize: '1.08em',
                        fontWeight: 700,
                        marginBottom: 8,
                        width: '100%',
                        outline: 'none',
                        boxShadow: '0 1px 4px #0001',
                        transition: 'border 0.2s',
                      }}
                      maxLength={16}
                      required
                    />
                  </div>
                  <div className="form-group" style={{flex:'1 1 120px'}}>
                    <label style={{fontWeight:700,fontSize:'1em'}}>Fecha de vencimiento (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry || ''}
                      onChange={e => setCardExpiry(e.target.value.replace(/[^0-9/]/g, '').slice(0,5))}
                      placeholder="12/29"
                      className="form-input"
                      style={{
                        border: showErrors && !cardExpiry.match(/^\d{2}\/\d{2}$/) ? '2px solid #f87171' : '2px solid #38BDF8',
                        borderRadius: 8,
                        padding: '12px 16px',
                        fontSize: '1.08em',
                        fontWeight: 700,
                        marginBottom: 8,
                        width: '100%',
                        outline: 'none',
                        boxShadow: '0 1px 4px #0001',
                        transition: 'border 0.2s',
                      }}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group" style={{flex:'1 1 80px'}}>
                    <label style={{fontWeight:700,fontSize:'1em'}}>CVV</label>
                    <input
                      type="text"
                      value={cardCVV || ''}
                      onChange={e => setCardCVV(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                      placeholder="123"
                      className="form-input"
                      style={{
                        border: showErrors && !cardCVV.match(/^\d{3,4}$/) ? '2px solid #f87171' : '2px solid #38BDF8',
                        borderRadius: 8,
                        padding: '12px 16px',
                        fontSize: '1.08em',
                        fontWeight: 700,
                        marginBottom: 8,
                        width: '100%',
                        outline: 'none',
                        boxShadow: '0 1px 4px #0001',
                        transition: 'border 0.2s',
                      }}
                      maxLength={4}
                      required
                    />
                  </div>
                  {showErrors && cardError && <div className="input-error-message" style={{color:'#f87171',fontSize:'0.97em',marginTop:2,width:'100%'}}>{cardError}</div>}
                </div>
              )}
            </div>
          </div>
          <div style={{flex:1,minWidth:260,display:'flex',flexDirection:'column',gap:'1.1rem',alignItems:'center'}}>
            <div className="order-summary" style={{background:'#181c20',border:'2px solid #4ade80',borderRadius:10,padding:'1.1rem 1.2rem',marginBottom:0,boxShadow:'0 1px 4px #0002',width:'100%',maxWidth:320}}>
              <h3 style={{fontWeight:800,fontSize:'1.1em',color:'#4ade80',margin:'0 0 0.7em 0'}}>Resumen:</h3>
              <p className="summary-text" style={{fontSize:'0.98em',color:'#fff',marginBottom:10}}>
                {selectedProduct.name} {getCustomizationSummary()}
                {selectedBeverage ? ` + ${selectedBeverage.name} (${beverageType})` : ''}
                {deliveryType === 'despacho' ? ` | Despacho a: ${address}` : ' | Retiro en local'}
                {` | Pago: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`}
              </p>
              <div className="total-price" style={{fontWeight:900,fontSize:'1.3em',color:'#4ade80',textAlign:'right'}}>{calculateTotal().toLocaleString()} CLP</div>
            </div>
            <button type="submit" className="submit-btn" style={{marginTop:'1.2rem',background:'linear-gradient(90deg,#4ade80 60%,#0097a7 100%)',color:'#23272b',border:'none',borderRadius:8,padding:'12px 0',fontWeight:800,cursor:'pointer',fontSize:'1.08em',boxShadow:'0 2px 8px #4ade8033',width:'100%',maxWidth:320,letterSpacing:'0.5px',transition:'all 0.2s'}}>¡Hacer pedido!</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm; 