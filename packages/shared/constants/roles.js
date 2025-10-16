export const USER_ROLES = {
  GUEST: 'guest',
  HOST: 'host',
  ADMIN: 'admin',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.GUEST]: ['view_properties', 'create_booking', 'write_review'],
  [USER_ROLES.HOST]: ['view_properties', 'create_booking', 'write_review', 'create_property', 'manage_own_properties'],
  [USER_ROLES.ADMIN]: ['*'],
};
