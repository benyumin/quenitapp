import React from 'react';
import {
  FiHome, FiClipboard, FiUsers, FiBarChart, FiSettings, FiLogOut,
  FiShoppingCart, FiBox, FiTruck, FiDollarSign, FiCalendar, FiBell,
  FiTag, FiPlus, FiFileText, FiCoffee, FiUser, FiMapPin, FiZap,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import './styles/AdminSidebar.css';
import logoQuenitas from '../../assets/logoquenitamejorcalidad.jpeg';

const AdminSidebar = ({
  activeSection,
  onSectionChange,
  onLogout,
  onBack,
  collapsed = false
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FiBarChart />,
      description: 'Vista general',
      color: '#3b82f6'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <FiClipboard />,
      description: 'Gestión de pedidos',
      color: '#10b981'
    },
    {
      id: 'cocina',
      label: 'Cocina',
      icon: <FiCoffee />,
      description: 'Preparación de pedidos',
      color: '#f59e0b'
    },
    {
      id: 'caja',
      label: 'Caja',
      icon: <FiDollarSign />,
      description: 'Pagos y facturación',
      color: '#8b5cf6'
    },
    {
      id: 'cajero',
      label: 'Cajero',
      icon: <FiUser />,
      description: 'Atención al cliente',
      color: '#06b6d4'
    },
    {
      id: 'repartidor',
      label: 'Repartidor',
      icon: <FiTruck />,
      description: 'Gestión de entregas',
      color: '#f97316'
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: <FiCalendar />,
      description: 'Vista de calendario',
      color: '#ec4899'
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <FiFileText />,
      description: 'Entregados y cancelados',
      color: '#6b7280'
    }
  ];

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logoQuenitas} alt="Quenitas Logo" className="logo" />
          {!collapsed && (
            <div className="logo-text">
              <h3>Quenitas</h3>
              <span>Panel Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
                style={{
                  '--item-color': item.color
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="back-btn" onClick={onBack}>
          <FiHome />
          {!collapsed && <span>Volver al Inicio</span>}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 