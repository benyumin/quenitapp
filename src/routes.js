// Configuración de rutas para la aplicación
export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  LOGIN: '/login',
  CONFIRM_EMAIL: '/confirm-email',
  PROFILE: '/profile',
  ADMIN: '/admin',
  COCINA: '/cocina',
  CAJA: '/caja',
  REPARTIDOR: '/repartidor'
};

// Función para construir URLs de confirmación
export const buildConfirmationUrl = (token, type = 'signup') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}${ROUTES.CONFIRM_EMAIL}?token=${token}&type=${type}`;
};

// Función para verificar si estamos en una ruta de confirmación
export const isConfirmationRoute = () => {
  return window.location.pathname === ROUTES.CONFIRM_EMAIL;
};

// Función para obtener parámetros de confirmación de la URL
export const getConfirmationParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    token: urlParams.get('token'),
    type: urlParams.get('type')
  };
};
