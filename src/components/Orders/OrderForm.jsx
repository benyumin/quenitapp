import React, { useState, useEffect } from 'react';
import completoImg from "../../assets/completo-italiano.jpg";
import papasImg from "../../assets/papas-fritas.jpg";
import barrosImg from "../../assets/barro-luco.jpg";
import fajitaImg from "../../assets/fajitasdepollo.png";
import assImg from "../../assets/ass.jpg";
import empanadaImg from "../../assets/empanada-de-quesoo.png";
import churrascoImg from "../../assets/churrasco.png";
// Importar imágenes de bebidas (puedes agregar tus propias imágenes aquí)
import cocaColaImg from "../../assets/coca-cola.png";
import fantaImg from "../../assets/fanta.jpg";
import cafeImg from "../../assets/cafe.jpg";
import teImg from "../../assets/te.jpg";
import spriteImg from "../../assets/sprite.png";
import limonSodaImg from "../../assets/limon-soda.png";
import papImg from "../../assets/pap.png";
import monsterImg from "../../assets/monster.png";
import scoreImg from "../../assets/score.png";
import './OrderForm.css';
import { supabase } from '../../lib/supabaseClient';

const products = [
  { name: "Completo Especial", price: 900, image: completoImg, popular: true },
  { name: "Completo Italiano", price: 1900, image: completoImg, popular: true },
  { name: "Completo XL Italiano", price: 2700, image: completoImg, popular: true },
  { name: "Churrasco Italiano", price: 3700, image: churrascoImg, popular: true },
  { name: "ASS Italiano", price: 3700, image: assImg },
  { name: "Papas Fritas Chicas", price: 2000, image: papasImg },
  { name: "Fajita de Pollo", price: 3800, image: fajitaImg },
  { name: "Empanada de Queso", price: 1200, image: empanadaImg },
  { name: "Pan Queso Caliente", price: 1700, image: barrosImg }
];

const beverages = [
  { name: "Coca-Cola", price: 800, image: cocaColaImg },
  { name: "Fanta", price: 800, image: fantaImg },
  { name: "Sprite", price: 800, image: spriteImg },
  { name: "Limon Soda", price: 700, image: limonSodaImg },
  { name: "Pap", price: 600, image: papImg },
  { name: "Monster Energy", price: 1200, image: monsterImg },
  { name: "Score Energy", price: 1200, image: scoreImg },
  { name: "Café Americano", price: 400, image: cafeImg },
  { name: "Té Negro", price: 300, image: teImg },
  { name: "Sin bebida", price: 0, image: null }
];

const productCustomizations = {
  "Completo Especial": [
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
  "Completo XL Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Churrasco Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "ASS Italiano": [
    { name: "Palta", price: 0, default: true },
    { name: "Tomate", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Chucrut", price: 200, default: false },
    { name: "Mayo de Ajo", price: 300, default: false }
  ],
  "Papas Fritas Chicas": [
    { name: "Sal", price: 0, default: true },
    { name: "Ketchup", price: 0, default: true },
    { name: "Mayonesa", price: 0, default: true },
    { name: "Mostaza", price: 0, default: false },
    { name: "Salsa de Ajo", price: 200, default: false }
  ],
  "Fajita de Pollo": [
    { name: "Salsa de Tomate", price: 0, default: true },
    { name: "Queso", price: 300, default: false },
    { name: "Crema", price: 200, default: false },
    { name: "Guacamole", price: 400, default: false },
    { name: "Salsa Picante", price: 100, default: false }
  ],
  "Empanada de Queso": [
    { name: "Salsa de Tomate", price: 0, default: true },
    { name: "Mostaza", price: 0, default: false },
    { name: "Mayonesa", price: 0, default: false },
    { name: "Salsa de Ajo", price: 200, default: false }
  ],
  "Pan Queso Caliente": [
    { name: "Mantequilla", price: 0, default: true },
    { name: "Mermelada", price: 200, default: false },
    { name: "Miel", price: 200, default: false },
    { name: "Queso Extra", price: 300, default: false }
  ]
};

const OrderForm = ({ onAddToCart }) => {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Retiro en local');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  // Credit card fields
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardRut, setCardRut] = useState('');
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState(null);

  // Limpiar el carrito cuando el componente se monta
  useEffect(() => {
    setCart([]);
    setStep(1);
    setSelectedProduct(null);
    setSelectedBeverage(null);
    setCustomizations({});
  }, []);

  const getCurrentCustomizations = () => {
    if (!selectedProduct || !productCustomizations[selectedProduct.name]) return [];
    return productCustomizations[selectedProduct.name].filter(custom => customizations[custom.name]);
  };

  const calculateTotal = () => {
    const productPrice = selectedProduct ? selectedProduct.price : 0;
    const beveragePrice = selectedBeverage ? selectedBeverage.price : 0;
    const customizationPrice = getCurrentCustomizations().reduce((total, custom) => total + (custom.price || 0), 0);
    
    const total = productPrice + beveragePrice + customizationPrice;
    return isNaN(total) ? 0 : total;
  };

  const calculateCartTotal = () => {
    const total = cart.reduce((total, item) => {
      // Calcular el precio total del item: precio base + bebida + personalizaciones
      const basePrice = item.price || 0;
      const beveragePrice = item.beveragePrice || 0;
      const customizationPrice = item.customizationPrice || 0;
      const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
      
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    return isNaN(total) ? 0 : total;
  };

  const confirmOrder = () => {
    if (!selectedProduct) {
      return;
    }

    const total = calculateTotal();
    console.log('🔍 Customizations antes de guardar:', customizations);
    console.log('🔍 Producto seleccionado:', selectedProduct.name);
    console.log('🔍 ProductCustomizations disponibles:', productCustomizations[selectedProduct.name]);
    
    const order = {
      name: selectedProduct.name,
      price: selectedProduct.price || 0,
      image: selectedProduct.image,
      beverage: selectedBeverage ? selectedBeverage.name : 'Sin bebida',
      beveragePrice: selectedBeverage ? selectedBeverage.price : 0,
      customizations: customizations, // Guardar el objeto customizations directamente
      customizationPrice: getCurrentCustomizations().reduce((total, custom) => total + (custom.price || 0), 0),
      total: isNaN(total) ? 0 : total,
      quantity: 1
    };
    
    console.log('🔍 Order creado:', order);

    // Agregar al carrito y continuar al siguiente paso
    setCart([order]);
    
    // Ir al paso 5 (información del cliente)
    setStep(5);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const increaseQuantity = (index) => {
    setCart(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    ));
  };

  const decreaseQuantity = (index) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = (item.quantity || 1) - 1;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const showSuccessNotification = (product) => {
    setNotificationProduct(product);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotificationProduct(null);
    }, 3000);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Si el usuario está borrando, permitir borrar completamente
    if (value === '') {
      setPhone('');
      return;
    }
    
    // Remover todos los caracteres que no sean números
    let numbersOnly = value.replace(/[^\d]/g, '');
    
    // Si empieza con +569, removerlo para procesar solo los números
    if (numbersOnly.startsWith('569')) {
      numbersOnly = numbersOnly.substring(3);
    }
    
    // Limitar a 8 dígitos (formato chileno sin el +569)
    if (numbersOnly.length > 8) {
      numbersOnly = numbersOnly.substring(0, 8);
    }
    
    // Formatear como +569XXXXXXXX
    if (numbersOnly.length > 0) {
      value = '+569' + numbersOnly;
    } else {
      value = '';
    }
    
    setPhone(value);
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Limitar a 16 dígitos
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    setCardNumber(value);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Formatear como MM/YY
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    setCardExpiry(value);
  };

  const handleCardCVVChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    // Limitar a 3-4 dígitos
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    setCardCVV(value);
  };

  const handleCardRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK-]/g, '');
    // Formatear como XX.XXX.XXX-X
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    setCardRut(value);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre');
      return false;
    }
    
    if (!phone.trim() || !phone.match(/^\+569\d{8}$/)) {
      alert('Por favor ingresa un teléfono válido (+569XXXXXXXX)');
      return false;
    }

    if (deliveryMethod === 'Domicilio' && !address.trim()) {
      alert('Por favor ingresa la dirección de entrega');
      return false;
    }

    if (paymentMethod === 'Tarjeta') {
      if (!cardHolderName.trim()) {
        alert('Por favor ingresa el nombre del titular de la tarjeta');
        return false;
      }
      if (!cardNumber.trim() || cardNumber.length < 16) {
        alert('Por favor ingresa un número de tarjeta válido');
        return false;
      }
      if (!cardExpiry.trim() || cardExpiry.length < 5) {
        alert('Por favor ingresa la fecha de vencimiento (MM/YY)');
        return false;
      }
      if (!cardCVV.trim() || cardCVV.length < 3) {
        alert('Por favor ingresa el CVV de la tarjeta');
        return false;
      }
      if (!cardRut.trim()) {
        alert('Por favor ingresa el RUT del titular de la tarjeta');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (cart.length === 0) {
      alert('Por favor agrega al menos un producto al carrito');
      return;
    }
    
    setIsSubmitting(true);

    const total = cart.reduce((sum, item) => {
      const basePrice = item.price || 0;
      const beveragePrice = item.beveragePrice || 0;
      const customizationPrice = item.customizationPrice || 0;
      const itemTotal = (basePrice + beveragePrice + customizationPrice) * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);

    console.log('🔍 handleSubmit - total calculado:', total);

    const order = {
      name: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      products: cart.map(item => ({
        name: item.name,
        price: item.price,
        image: item.image,
        beverage: item.beverage,
        beveragePrice: item.beveragePrice,
        customizations: item.customizations,
        customizationPrice: item.customizationPrice,
        quantity: item.quantity || 1
      })),
      total, // total calculado correctamente
      deliveryMethod,
      paymentMethod,
      cardHolderName: paymentMethod === 'Tarjeta' ? cardHolderName.trim() : '',
      cardNumber: paymentMethod === 'Tarjeta' ? cardNumber.trim() : '',
      cardExpiry: paymentMethod === 'Tarjeta' ? cardExpiry.trim() : '',
      cardCVV: paymentMethod === 'Tarjeta' ? cardCVV.trim() : '',
      cardRut: paymentMethod === 'Tarjeta' ? cardRut.trim() : ''
    };

    console.log('🔍 handleSubmit - order.total:', order.total);

    try {
      // Enviar toda la orden al carrito principal
      onAddToCart(order);
      // Reset form y carrito
      setStep(1);
      setCart([]);
      setSelectedProduct(null);
      setSelectedBeverage(null);
      setCustomizations({});
      setCustomerName('');
      setPhone('');
      setAddress('');
      setDeliveryMethod('Retiro en local');
      setPaymentMethod('Efectivo');
      setCardHolderName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setCardRut('');
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomization = (name) => {
    setCustomizations(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Auto-select default customizations when product changes
  useEffect(() => {
    if (selectedProduct && productCustomizations[selectedProduct.name]) {
      const allCustomizations = {};
      productCustomizations[selectedProduct.name].forEach(custom => {
        allCustomizations[custom.name] = custom.default || false;
      });
      setCustomizations(allCustomizations);
    }
  }, [selectedProduct]);

  const nextStep = () => {
    if (step === 1 && !selectedProduct) {
      alert('Por favor selecciona un producto');
      return;
    }
    if (step === 2 && !selectedBeverage) {
      alert('Por favor selecciona una bebida');
      return;
    }
    if (step === 3 && !selectedProduct) {
      alert('Por favor selecciona un producto');
      return;
    }
    if (step === 5 && (!customerName || !phone)) {
      alert('Por favor completa tu nombre y teléfono');
      return;
    }
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="step-container">
            <h3>🍽️ ¿Qué te gustaría comer?</h3>
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--muted-text, #6b7280)', 
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              Haz clic en un producto para seleccionarlo
            </p>
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product.name}
                  onClick={() => setSelectedProduct(product)}
                  className={`product-card ${selectedProduct?.name === product.name ? 'selected' : ''}`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: selectedProduct?.name === product.name ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: selectedProduct?.name === product.name ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <h4 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>{product.name}</h4>
                    <p className="product-price">${product.price.toLocaleString()}</p>
                    {product.popular && <span className="popular-badge">🔥</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={nextStep} className="next-btn" disabled={!selectedProduct}>
              {selectedProduct ? `Continuar con ${selectedProduct.name} →` : 'Selecciona un producto'}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <h3>🥤 ¿Qué bebida prefieres?</h3>
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-color, inherit)', 
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Selecciona una bebida para tu {selectedProduct?.name}
            </p>
            <div className="beverages-grid">
              {beverages.map(beverage => (
                <div
                  key={beverage.name}
                  onClick={() => setSelectedBeverage(beverage)}
                  className={`beverage-card ${selectedBeverage?.name === beverage.name ? 'selected' : ''}`}
                >
                  {beverage.image ? (
                    <img src={beverage.image} alt={beverage.name} className="beverage-image" />
                  ) : (
                    <div className="beverage-no-image">❌</div>
                  )}
                  <div className="beverage-info">
                    <h4 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>{beverage.name}</h4>
                    <p className="beverage-price">
                      {beverage.price > 0 ? `$${beverage.price.toLocaleString()}` : 'Gratis'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="step-buttons">
              <button onClick={prevStep} className="prev-btn">← Volver</button>
              <button onClick={nextStep} className="next-btn" disabled={!selectedBeverage}>
                Continuar →
              </button>
            </div>
          </div>
        );

             case 3:
         return (
           <div className="step-container">
             <h3>⚙️ Personaliza tu pedido</h3>
             <p style={{ 
               textAlign: 'center', 
               color: 'var(--text-color, inherit)', 
               marginBottom: '20px',
               fontSize: '0.9rem',
               fontWeight: '500'
             }}>
               Personaliza tu {selectedProduct?.name} con los ingredientes que prefieras
             </p>
             {selectedProduct && productCustomizations[selectedProduct.name] ? (
               <>
                 <div className="customizations-grid">
                   {productCustomizations[selectedProduct.name].map(custom => (
                     <div
                       key={custom.name}
                       onClick={() => toggleCustomization(custom.name)}
                       className={`customization-card ${customizations[custom.name] ? 'selected' : ''}`}
                     >
                       <div className="customization-info">
                         <h4 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>{custom.name}</h4>
                         {custom.price > 0 && <p className="customization-price">+${custom.price}</p>}
                         {custom.default && <span className="default-badge">Por defecto</span>}
                       </div>
                       <div className="customization-checkbox">
                         {customizations[custom.name] ? '✓' : ''}
                       </div>
                     </div>
                   ))}
                                  </div>
                </>
             ) : (
               <div style={{ 
                 textAlign: 'center', 
                 padding: '40px 20px',
                 background: 'var(--card-bg, #f8fafc)',
                 borderRadius: '12px',
                 border: '2px dashed var(--border-color, #d1d5db)'
               }}>
                 <p style={{ color: 'var(--muted-text, #6b7280)', margin: '0', fontSize: '1rem' }}>
                   🎯 Este producto no requiere personalización adicional.
                 </p>
                 <p style={{ color: 'var(--muted-text, #9ca3af)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                   Tu {selectedProduct?.name} viene listo para disfrutar.
                 </p>
               </div>
             )}
             <div className="step-buttons">
               <button onClick={prevStep} className="prev-btn">← Volver</button>
               <button onClick={nextStep} className="next-btn" disabled={!selectedProduct}>
                 Continuar →
               </button>
             </div>
           </div>
         );

             case 4:
         return (
           <div className="step-container">
             <h3>✅ Revisa tu pedido</h3>
             <p style={{ 
               textAlign: 'center', 
               color: 'var(--muted-text, #6b7280)', 
               marginBottom: '20px',
               fontSize: '0.9rem'
             }}>
               Confirma que todo esté correcto antes de continuar
             </p>
             
             <div style={{
               background: 'white',
               padding: '24px', 
               borderRadius: '16px', 
               marginBottom: '20px',
               border: '2px solid #e5e7eb',
               boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
               position: 'relative',
               overflow: 'hidden'
             }}>
               {/* Header con ícono */}
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
                 marginBottom: '20px',
                 paddingBottom: '16px',
                 borderBottom: '2px solid #f3f4f6'
               }}>
                 <div style={{
                   background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                   width: '40px',
                   height: '40px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'white',
                   fontSize: '18px'
                 }}>
                   📋
                 </div>
                 <div>
                   <h4 style={{ margin: 0, color: '#1f2937', fontSize: '1.2rem', fontWeight: '700' }}>
                     Resumen del Pedido
                   </h4>
                   <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                     Revisa que todo esté correcto
                   </p>
                 </div>
               </div>
               
               {/* Contenido del resumen */}
               <div style={{ marginBottom: '20px' }}>
                 {/* Producto */}
                 <div style={{
                   background: '#f8fafc',
                   padding: '16px',
                   borderRadius: '12px',
                   marginBottom: '12px',
                   border: '1px solid #e5e7eb'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                     <span style={{ color: '#10b981', fontSize: '16px' }}>🍔</span>
                     <strong style={{ color: '#374151', fontSize: '1rem' }}>Producto:</strong>
                   </div>
                   <p style={{ color: '#1f2937', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                     {selectedProduct?.name}
                   </p>
                 </div>

                 {/* Bebida */}
                 <div style={{
                   background: '#f8fafc',
                   padding: '16px',
                   borderRadius: '12px',
                   marginBottom: '12px',
                   border: '1px solid #e5e7eb'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                     <span style={{ color: '#10b981', fontSize: '16px' }}>🥤</span>
                     <strong style={{ color: '#374151', fontSize: '1rem' }}>Bebida:</strong>
                   </div>
                   <p style={{ color: '#1f2937', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                     {selectedBeverage?.name || 'Sin bebida'}
                   </p>
                 </div>

                 {/* Ingredientes */}
                 {getCurrentCustomizations().length > 0 && (
                   <div style={{
                     background: '#f8fafc',
                     padding: '16px',
                     borderRadius: '12px',
                     marginBottom: '12px',
                     border: '1px solid #e5e7eb'
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                       <span style={{ color: '#10b981', fontSize: '16px' }}>🧀</span>
                       <strong style={{ color: '#374151', fontSize: '1rem' }}>Ingredientes:</strong>
                     </div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                       {getCurrentCustomizations().map(c => (
                         <span key={c.name} style={{
                           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                           color: 'white',
                           padding: '6px 12px',
                           borderRadius: '20px',
                           fontSize: '0.85rem',
                           fontWeight: '600',
                           boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                         }}>
                           {c.name}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Total */}
                 <div style={{
                   background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                   padding: '20px',
                   borderRadius: '12px',
                   marginTop: '16px'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: '700' }}>Total:</span>
                     <span style={{ color: 'white', fontSize: '1.4rem', fontWeight: '800' }}>
                       ${(calculateTotal() || 0).toLocaleString()}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="step-buttons">
               <button onClick={prevStep} className="prev-btn">← Volver</button>
               <button onClick={confirmOrder} className="submit-btn" disabled={!selectedProduct}>
                 ✅ Confirmar pedido
               </button>
             </div>
           </div>
         );

       case 5:
         return (
           <div className="step-container">
             <h3>👤 Tu información</h3>
            <div className="customer-inputs">
              <input
                type="text"
                id="customer-name"
                name="customer-name"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="tel"
                id="customer-phone"
                name="customer-phone"
                placeholder="+56912345678"
                value={phone}
                onChange={handlePhoneChange}
                className="form-input"
                maxLength={12}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
            
            {/* Carrito */}
            {cart.length > 0 && (
              <div className="cart-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>🛒 Tu carrito ({cart.length} productos)</h3>
                  <button
                    onClick={clearCart}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🗑️ Limpiar
                  </button>
                </div>
                <div className="cart-items">
                  {cart.map((item, index) => (
                                         <div key={index} className="cart-item" style={{
                       background: 'var(--card-item-bg, white)',
                       border: '1px solid var(--border-color, #e5e7eb)',
                       borderRadius: '8px',
                       padding: '12px',
                       marginBottom: '8px',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center'
                     }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                            {item.name} x{item.quantity || 1}
                          </h4>
                          <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--muted-text, #6b7280)' }}>
                            {item.beverage} - ${((item.total || 0) * (item.quantity || 1)).toLocaleString()}
                          </p>
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div style={{ marginTop: '4px' }}>
                              <p style={{ margin: '0', fontSize: '0.75rem', color: '#2563eb', fontWeight: '600' }}>
                                🧀 Ingredientes: {Object.entries(item.customizations)
                                  .filter(([, selected]) => selected)
                                  .map(([name]) => name)
                                  .join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => decreaseQuantity(index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => increaseQuantity(index)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            marginLeft: '8px'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ 
                  background: 'var(--total-bg, #f3f4f6)', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  textAlign: 'right'
                }}>
                  <h4 style={{ margin: '0', color: 'var(--accent-color, #10b981)' }}>
                    Total: ${(calculateCartTotal() || 0).toLocaleString()}
                  </h4>
                </div>
              </div>
            )}
            
            <h3 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>🚚 ¿Cómo quieres tu pedido?</h3>
            <div className="options-grid">
              <button
                type="button"
                onClick={() => setDeliveryMethod('Retiro en local')}
                className={`option-btn ${deliveryMethod === 'Retiro en local' ? 'selected' : ''}`}
              >
                🏪 Retiro en local
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('Domicilio')}
                className={`option-btn ${deliveryMethod === 'Domicilio' ? 'selected' : ''}`}
              >
                🚚 Domicilio
              </button>
            </div>

            {deliveryMethod === 'Domicilio' && (
              <div className="address-input">
                <input
                  type="text"
                  id="delivery-address"
                  name="delivery-address"
                  placeholder="Dirección de entrega"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}

            <h3 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>💳 ¿Cómo vas a pagar?</h3>
            <div className="options-grid">
              <button
                type="button"
                onClick={() => setPaymentMethod('Efectivo')}
                className={`option-btn ${paymentMethod === 'Efectivo' ? 'selected' : ''}`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Tarjeta')}
                className={`option-btn ${paymentMethod === 'Tarjeta' ? 'selected' : ''}`}
              >
                💳 Tarjeta
              </button>
            </div>

            {paymentMethod === 'Tarjeta' && (
              <div className="card-fields">
                <div className="card-inputs">
                  <input
                    type="text"
                    id="card-holder-name"
                    name="card-holder-name"
                    placeholder="Nombre del titular"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
                    id="card-rut"
                    name="card-rut"
                    placeholder="RUT del titular (XX.XXX.XXX-X)"
                    value={cardRut}
                    onChange={handleCardRutChange}
                    className="form-input"
                    maxLength={12}
                    required
                  />
                </div>
                <div className="card-inputs">
                  <input
                    type="text"
                    id="card-number"
                    name="card-number"
                    placeholder="Número de tarjeta"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="form-input"
                    maxLength={16}
                    required
                  />
                  <input
                    type="text"
                    id="card-expiry"
                    name="card-expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    className="form-input"
                    maxLength={5}
                    required
                  />
                  <input
                    type="text"
                    id="card-cvv"
                    name="card-cvv"
                    placeholder="CVV"
                    value={cardCVV}
                    onChange={handleCardCVVChange}
                    className="form-input"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            )}

            <div className="step-buttons">
              <button onClick={prevStep} className="prev-btn">← Volver</button>
              <button onClick={nextStep} className="next-btn" disabled={!customerName || !phone}>
                Continuar →
              </button>
            </div>
          </div>
        );

             case 6:
         return (
           <div className="step-container">
             <h3 style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>✅ Confirmar tu pedido</h3>
            
            <div style={{ 
              background: 'var(--card-bg, #f8fafc)', 
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              border: '1px solid var(--border-color, #e5e7eb)',
              color: 'var(--text-color, inherit)'
            }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-color, inherit)' }}>📋 Resumen del pedido:</h4>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-color, inherit)' }}><strong>Cliente:</strong> {customerName}</p>
                <p style={{ color: 'var(--text-color, inherit)' }}><strong>Teléfono:</strong> {phone}</p>
                <p style={{ color: 'var(--text-color, inherit)' }}><strong>Entrega:</strong> {deliveryMethod}</p>
                {deliveryMethod === 'Domicilio' && address && (
                  <p style={{ color: 'var(--text-color, inherit)' }}><strong>Dirección:</strong> {address}</p>
                )}
                <p style={{ color: 'var(--text-color, inherit)' }}><strong>Pago:</strong> {paymentMethod}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color, #e5e7eb)', paddingTop: '16px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: 'var(--text-color, inherit)' }}>Productos:</h5>
                {cart.length > 0 ? (
                  cart.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '8px',
                      background: 'var(--card-item-bg, white)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color, #e5e7eb)',
                      color: 'var(--text-color, inherit)'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-color, inherit)' }}>{item.name}</span>
                        {item.beverage && item.beverage !== 'Sin bebida' && (
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted-text, #6b7280)' }}>
                            + {item.beverage}
                          </div>
                        )}
                        {item.customizations && item.customizations.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted-text, #6b7280)' }}>
                            {item.customizations.map(c => c.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-color, inherit)' }}>
                          x{item.quantity || 1}
                        </div>
                        <div style={{ color: 'var(--accent-color, #10b981)', fontWeight: 'bold' }}>
                          ${((item.total || 0) * (item.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    color: 'var(--muted-text, #6b7280)',
                    fontStyle: 'italic'
                  }}>
                    No hay productos en el carrito
                  </div>
                )}
                <div style={{ 
                  borderTop: '1px solid var(--border-color, #e5e7eb)', 
                  paddingTop: '12px', 
                  marginTop: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  background: 'var(--total-bg, #f3f4f6)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: 'var(--text-color, inherit)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--accent-color, #10b981)' }}>${(calculateCartTotal() || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-buttons">
              <button onClick={prevStep} className="prev-btn">← Volver</button>
              <button onClick={handleSubmit} className="submit-btn">
                🛒 ¡REALIZAR PEDIDO!
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="order-form-container">
      <div className="order-form-content">
        <div className="order-form-left" style={{ 
          marginBottom: (step >= 5 && (selectedProduct || cart.length > 0)) ? '80px' : '0' 
        }}>
          <h2 className="order-form-title" style={{ color: 'var(--text-color, inherit)', fontWeight: '600' }}>¡Haz tu pedido!</h2>
          
          {!selectedProduct && cart.length === 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍽️</div>
              <p style={{ 
                margin: '0', 
                color: '#0c4a6e', 
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                Selecciona un producto para comenzar tu pedido
              </p>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: '#0369a1', 
                fontSize: '0.9rem',
                opacity: 0.8
              }}>
                El resumen aparecerá cuando confirmes tu pedido
              </p>
            </div>
          )}
          
                     {/* Progress Bar */}
           <div className="progress-bar">
             <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
             <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
             <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
             <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
             <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>5</div>
             <div className={`progress-step ${step >= 6 ? 'active' : ''}`}>6</div>
           </div>

          {renderStep()}
        </div>

                 {/* Resumen del Pedido - Mostrar desde el paso 5 */}
         {(step >= 5 && (selectedProduct || cart.length > 0)) && (
           <div className="order-summary">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
               <h3 style={{ margin: 0 }}>📋 Resumen:</h3>
               <button 
                 onClick={() => {
                   setSelectedProduct(null);
                   setCart([]);
                   setSelectedBeverage(null);
                   setCustomizations({});
                                       if (step > 5) {
                      setStep(5);
                    }
                 }}
                 style={{
                   background: 'rgba(255, 255, 255, 0.2)',
                   border: 'none',
                   borderRadius: '50%',
                   width: '24px',
                   height: '24px',
                   color: 'white',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '12px'
                 }}
                 aria-label="Cerrar resumen"
               >
                 ✕
               </button>
             </div>
             <div className="summary-content">
                               {cart.length > 0 && step >= 5 ? (
                 <>
                   <p><strong>Productos en carrito:</strong></p>
                   {cart.map((item, index) => (
                     <p key={index} style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                       • {item.name} x{item.quantity || 1} - ${((item.total || 0) * (item.quantity || 1)).toLocaleString()}
                     </p>
                   ))}
                   {step >= 5 && (
                     <>
                       <p><strong>Entrega:</strong> {deliveryMethod}</p>
                       {deliveryMethod === 'Domicilio' && address && (
                         <p><strong>Dirección:</strong> {address}</p>
                       )}
                       <p><strong>Pago:</strong> {paymentMethod}</p>
                     </>
                   )}
                   <div className="total-price">
                     <strong>Total: ${(calculateCartTotal() || 0).toLocaleString()}</strong>
                   </div>
                 </>
               ) : (
                 <>
                   {selectedProduct ? (
                     <>
                       <p><strong>Producto:</strong> {selectedProduct.name}</p>
                       {selectedBeverage && (
                         <p><strong>Bebida:</strong> {selectedBeverage.name}</p>
                       )}
                       {getCurrentCustomizations().length > 0 && (
                         <p><strong>Con:</strong> {getCurrentCustomizations().map(c => c.name).join(', ')}</p>
                       )}
                       <div className="total-price">
                         <strong>Total: ${(calculateTotal() || 0).toLocaleString()}</strong>
                       </div>
                     </>
                   ) : null}
                 </>
               )}
             </div>
           </div>
         )}
      </div>
      
      {/* Notificación elegante */}
      {showNotification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            animation: 'slideInRight 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '300px'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              ¡Producto agregado!
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {notificationProduct?.name} agregado al carrito
            </div>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              marginLeft: 'auto'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderForm; 