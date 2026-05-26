export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const ROLE_HIERARCHY = {
  superadmin: ['supadmin', 'admin', 'supervisor', 'user'],
  supadmin: ['admin', 'supervisor', 'user'],
  admin: ['supervisor', 'user'],
  supervisor: ['user'],
};

export const ROLE_ORDER = ['supadmin', 'admin', 'supervisor', 'user'];
