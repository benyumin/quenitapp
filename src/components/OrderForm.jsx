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
  { name: "Coca-Cola", price: 800, icon: "🥤" },
  { name: "Fanta", price: 800, icon: "🥤" },
  { name: "Café Americano", price: 400, icon: "☕" },
  { name: "Té Negro", price: 300, icon: "🫖" },
  { name: "Sin bebida", price: 0, icon: "❌" }
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

  const getCurrentCustomizations = () => {
    if (!selectedProduct || !productCustomizations[selectedProduct.name]) return [];
    return productCustomizations[selectedProduct.name].filter(custom => customizations[custom.name]);
  };

  const calculateTotal = () => {
    const productPrice = selectedProduct ? selectedProduct.price : 0;
    const beveragePrice = selectedBeverage ? selectedBeverage.price : 0;
    const customizationPrice = getCurrentCustomizations().reduce((total, custom) => total + custom.price, 0);
    
    return productPrice + beveragePrice + customizationPrice;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limitar a 9 dígitos (formato chileno)
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    // Formatear como +569XXXXXXXX
    if (value.length > 0) {
      value = '+569' + value;
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
    
    if (!phone.trim() || phone.length < 12) {
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

    if (!selectedProduct) {
      alert('Por favor selecciona un producto');
      return;
    }

    const order = {
      name: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      product: selectedProduct.name,
      price: selectedProduct.price,
      beverage: selectedBeverage ? selectedBeverage.name : 'Sin bebida',
      beveragePrice: selectedBeverage ? selectedBeverage.price : 0,
      customizations: getCurrentCustomizations(),
      customizationPrice: getCurrentCustomizations().reduce((total, custom) => total + custom.price, 0),
      total: calculateTotal(),
      deliveryMethod,
      paymentMethod,
      cardHolderName: paymentMethod === 'Tarjeta' ? cardHolderName.trim() : '',
      cardNumber: paymentMethod === 'Tarjeta' ? cardNumber.trim() : '',
      cardExpiry: paymentMethod === 'Tarjeta' ? cardExpiry.trim() : '',
      cardCVV: paymentMethod === 'Tarjeta' ? cardCVV.trim() : '',
      cardRut: paymentMethod === 'Tarjeta' ? cardRut.trim() : ''
    };

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          nombre: order.name,
          telefono: order.phone,
          direccion: order.address || 'Retiro en local',
          producto: order.product,
          precio_total: order.total,
          estado: 'PENDIENTE',
          tipo_entrega: deliveryMethod === 'Retiro en local' ? 'Retiro en local' : 'Domicilio',
          bebida: order.beverage,
          personalizacion: JSON.stringify(order.customizations),
          resumen: `${order.product}${order.customizations.length > 0 ? ` con ${order.customizations.map(c => c.name).join(', ')}` : ''}`,
          cantidad: 1,
          metodo_pago: order.paymentMethod.toLowerCase(),
          rut_titular: order.cardRut,
          numero_tarjeta: order.cardNumber,
          fecha_vencimiento: order.cardExpiry,
          cvv: order.cardCVV
        }]);

      if (error) throw error;

      onAddToCart(order);
      
      // Reset form
      setStep(1);
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
      console.error('Error creating pedido:', error);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    }
  };

  const toggleCustomization = (name) => {
    setCustomizations(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const nextStep = () => {
    if (step === 1 && !selectedProduct) {
      alert('Por favor selecciona un producto');
      return;
    }
    if (step === 2 && !selectedBeverage) {
      alert('Por favor selecciona una bebida');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="step-container">
            <h3>🍽️ ¿Qué te gustaría comer?</h3>
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product.name}
                  onClick={() => setSelectedProduct(product)}
                  className={`product-card ${selectedProduct?.name === product.name ? 'selected' : ''}`}
                >
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">${product.price.toLocaleString()}</p>
                    {product.popular && <span className="popular-badge">🔥</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={nextStep} className="next-btn" disabled={!selectedProduct}>
              Continuar →
            </button>
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <h3>🥤 ¿Qué bebida prefieres?</h3>
            <div className="beverages-grid">
              {beverages.map(beverage => (
                <div
                  key={beverage.name}
                  onClick={() => setSelectedBeverage(beverage)}
                  className={`beverage-card ${selectedBeverage?.name === beverage.name ? 'selected' : ''}`}
                >
                  <span className="beverage-icon">{beverage.icon}</span>
                  <div className="beverage-info">
                    <h4>{beverage.name}</h4>
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
            {selectedProduct && productCustomizations[selectedProduct.name] ? (
              <div className="customizations-grid">
                {productCustomizations[selectedProduct.name].map(custom => (
                  <div
                    key={custom.name}
                    onClick={() => toggleCustomization(custom.name)}
                    className={`customization-card ${customizations[custom.name] ? 'selected' : ''}`}
                  >
                    <div className="customization-info">
                      <h4>{custom.name}</h4>
                      {custom.price > 0 && <p className="customization-price">+${custom.price}</p>}
                    </div>
                    <div className="customization-checkbox">
                      {customizations[custom.name] ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-customizations">No hay personalizaciones disponibles para este producto.</p>
            )}
            <div className="step-buttons">
              <button onClick={prevStep} className="prev-btn">← Volver</button>
              <button onClick={nextStep} className="next-btn">
                Continuar →
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-container">
            <h3>👤 Tu información</h3>
            <div className="customer-inputs">
              <input
                type="text"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="tel"
                placeholder="+56912345678"
                value={phone}
                onChange={handlePhoneChange}
                className="form-input"
                maxLength={12}
                required
              />
            </div>
            
            <h3>🚚 ¿Cómo quieres tu pedido?</h3>
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
                  placeholder="Dirección de entrega"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            )}

            <h3>💳 ¿Cómo vas a pagar?</h3>
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
                    placeholder="Nombre del titular"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="form-input"
                    required
                  />
                  <input
                    type="text"
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
                    placeholder="Número de tarjeta"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="form-input"
                    maxLength={16}
                    required
                  />
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    className="form-input"
                    maxLength={5}
                    required
                  />
                  <input
                    type="text"
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
              <button onClick={handleSubmit} className="submit-btn">
                🛒 ¡HACER PEDIDO!
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
        <div className="order-form-left">
          <h2 className="order-form-title">¡Haz tu pedido!</h2>
          
          {/* Progress Bar */}
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
          </div>

          {renderStep()}
        </div>

        {/* Resumen del Pedido */}
        <div className="order-summary">
          <h3>📋 Resumen:</h3>
          <div className="summary-content">
            {selectedProduct && (
              <p><strong>Producto:</strong> {selectedProduct.name}</p>
            )}
            {selectedBeverage && (
              <p><strong>Bebida:</strong> {selectedBeverage.name}</p>
            )}
            {getCurrentCustomizations().length > 0 && (
              <p><strong>Con:</strong> {getCurrentCustomizations().map(c => c.name).join(', ')}</p>
            )}
            {step >= 4 && (
              <>
                <p><strong>Entrega:</strong> {deliveryMethod}</p>
                {deliveryMethod === 'Domicilio' && address && (
                  <p><strong>Dirección:</strong> {address}</p>
                )}
                <p><strong>Pago:</strong> {paymentMethod}</p>
              </>
            )}
            <div className="total-price">
              <strong>Total: ${calculateTotal().toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm; 