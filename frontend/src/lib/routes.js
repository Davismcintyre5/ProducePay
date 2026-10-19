export const ROUTES = {
  LOGIN: '/login',

  DASHBOARD: '/dashboard',
  FARMERS: '/farmers',
  FARMER_DETAIL: (id) => `/farmers/${id}`,
  DELIVERIES: '/deliveries',
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: (id) => `/payments/${id}`,
  RECEIPT: (id) => `/receipts/${id}`,
  REPORTS: '/reports',
  USERS: '/users',
  SETTINGS: '/settings',

  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404'
};

export default ROUTES;