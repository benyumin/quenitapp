import React from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';

const Notifications = ({ notifications, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="notification-icon success" />;
      case 'error':
        return <FiXCircle className="notification-icon error" />;
      case 'warning':
        return <FiAlertCircle className="notification-icon warning" />;
      case 'info':
        return <FiInfo className="notification-icon info" />;
      default:
        return <FiInfo className="notification-icon info" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
        return 'notification-info';
      default:
        return 'notification-info';
    }
  };

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id || index}
          className={`notification ${getTypeStyles(notification.type)}`}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="notification-content">
            {getIcon(notification.type)}
            <div className="notification-text">
              <p className="notification-message">{notification.message}</p>
              <span className="notification-time">
                {notification.timestamp && new Date(notification.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button
            className="notification-close"
            onClick={() => onClose && onClose(notification.id)}
            aria-label="Cerrar notificación"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 