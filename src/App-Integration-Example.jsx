
import React, { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import SimpleAuth from './components/Auth/SimpleAuth';
import OrderManager from './components/Orders/OrderManager';
import Menu from './components/Home/Menu';
import Navbar from './components/Common/Navbar'; 

const AppIntegrationExample = () => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const handleShowOrderModal = useCallback((show) => {
    setShowOrderModal(show);
  }, []);

  const handleShowLoginSection = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCartClick = useCallback(() => {
  }, []);

  const handleLogoClick = useCallback(() => {
  }, []);

  const handleUserClick = useCallback(() => {
    if (isAuthenticated) {
      // Show user profile or account modal
      console.log('User profile:', profile);
    } else {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, profile]);

  const toggleTheme = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await signOut();
      setCart([]);
      setShowOrderModal(false);
      // Show success notification
    } catch (error) {
      console.error('Error during logout:', error);
      // Show error notification
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Navbar with authentication */}
      <Navbar
        cart={cart}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onCartClick={handleCartClick}
        onLogoClick={handleLogoClick}
        onUserClick={handleUserClick}
        isLoggedIn={isAuthenticated}
        userInfo={profile}
      />

      {/* Main content */}
      <main>
        {/* Your existing sections */}
        {/* ... other components ... */}

        {/* Menu with authentication */}
        <Menu
          cart={cart}
          setCart={setCart}
          isLoggedIn={isAuthenticated}
          onShowLoginSection={handleShowLoginSection}
          onShowOrderModal={handleShowOrderModal}
          showOrderModal={showOrderModal}
        />

        {/* Order Manager for authenticated users */}
        {isAuthenticated && (
          <section className="py-12 bg-gray-50">
            <OrderManager />
          </section>
        )}
      </main>

      {/* Authentication Modal */}
      {showAuthModal && (
        <SimpleAuth
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            // Additional success logic
          }}
        />
      )}

      {/* Your existing modals */}
      {/* ... other modals ... */}
    </div>
  );
};

export default AppIntegrationExample;
