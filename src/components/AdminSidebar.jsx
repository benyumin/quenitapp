import React, { useState } from 'react';
import { FaHome, FaClipboardList, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaShoppingCart, FaBox, FaTruck, FaMoneyBillWave, FaCalendarAlt, FaBell } from 'react-icons/fa';
import './AdminSidebar.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';

const AdminSidebar = ({ 
  activeSection, 
  onSectionChange, 
  onLogout, 
  menuItems = [], 
  userInfo = { name: 'Admin', role: 'Administrador' } 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const defaultMenuItems = [
    {
      id: 'orders',
      name: 'Pedidos',
      icon: <FaClipboardList />,
      description: 'Gestionar pedidos'
    },
    {
      id: 'cocina',
      name: 'Panel de Cocina',
      icon: <FaBox />,
      description: 'Gestionar preparación'
    },
    {
      id: 'caja',
      name: 'Panel de Caja',
      icon: <FaMoneyBillWave />,
      description: 'Gestión de pagos'
    },
    {
      id: 'cajero',
      name: 'Panel de Cajero',
      icon: <FaUsers />,
      description: 'Tomar pedidos'
    },
    {
      id: 'repartidor',
      name: 'Panel de Repartidor',
      icon: <FaTruck />,
      description: 'Gestión de entregas'
    },
    {
      id: 'calendario',
      name: 'Calendario',
      icon: <FaCalendarAlt />,
      description: 'Vista de calendario'
    }
  ];

  const itemsToShow = menuItems.length > 0 ? menuItems : defaultMenuItems;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">
            <FaShoppingCart />
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <h3>Quenitas</h3>
              <span>Admin Panel</span>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menú principal */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {itemsToShow.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
                title={isCollapsed ? item.description : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="nav-text">{item.label || item.name}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title={isCollapsed ? 'Cerrar sesión' : ''}
        >
          <span className="nav-icon">
            <FaSignOutAlt />
          </span>
          {!isCollapsed && <span className="nav-text">Cerrar Sesión</span>}
        </button>
      </div>

      {/* Información del usuario */}
      {!isCollapsed && (
        <div className="user-info">
          <div className="user-avatar">
            <img 
              src={userInfo.avatar || logoQuenitas} 
              alt={userInfo.name || "Admin"}
            />
          </div>
          <div className="user-details">
            <span className="user-name">{userInfo.name || "Administrador"}</span>
            <span className="user-role">{userInfo.role || "Admin"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar; 