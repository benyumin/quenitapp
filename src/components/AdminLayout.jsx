import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';
import logoQuenitas from '../assets/logoquenitamejorcalidad.jpeg';
import { FiMenu, FiX } from 'react-icons/fi';

const AdminLayout = ({ 
  children, 
  onLogout, 
  activeSection, 
  onSectionChange, 
  sidebar, 
  headerActions 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {sidebar || (
          <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={(section) => {
              onSectionChange(section);
              closeMobileMenu();
            }}
            onLogout={handleLogout}
          />
        )}
      </div>
      
      {/* Contenido principal */}
      <div className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header del contenido */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              {/* Mobile menu button */}
              <button 
                className="mobile-menu-btn"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
              
              <div className="header-text">
                <h1 className="page-title">
                  {getPageTitle(activeSection)}
                </h1>
                <p className="page-description">
                  {getPageDescription(activeSection)}
                </p>
              </div>
            </div>
            
            <div className="header-right">
              <div className="header-actions">
                {headerActions}
                
                <div className="user-menu">
                  <div className="user-avatar">
                    <img 
                      src={logoQuenitas} 
                      alt="Admin"
                    />
                  </div>
                  <span className="user-name">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="admin-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Funciones helper para títulos y descripciones
const getPageTitle = (section) => {
  const titles = {
    orders: 'Gestión de Pedidos',
    cocina: 'Panel de Cocina',
    caja: 'Panel de Caja',
    cajero: 'Panel de Cajero',
    repartidor: 'Panel de Repartidor',
    calendario: 'Calendario de Pedidos'
  };
  return titles[section] || 'Gestión de Pedidos';
};

const getPageDescription = (section) => {
  const descriptions = {
    orders: 'Gestiona y monitorea todos los pedidos del sistema',
    cocina: 'Acceso directo al panel de cocina para gestionar pedidos',
    caja: 'Gestión de pagos y pedidos listos para entrega',
    cajero: 'Interfaz completa para tomar pedidos de clientes',
    repartidor: 'Gestión de entregas a domicilio y seguimiento de rutas',
    calendario: 'Vista de calendario para planificación y seguimiento'
  };
  return descriptions[section] || 'Panel de control principal';
};

export default AdminLayout; 