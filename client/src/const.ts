import User from './types/User';

export const BACKEND_ENDPOINT = 'https://api.butsury-days.shudo-physics.com';

export const QR_VERSION = 1;

export const NO_USER: User = {
  id: -1,
  name: '',
  password: '',
  is_admin: false,
  balance: 0,
  last_get_on_id: -1,
  created_at: '',
  enable_auto_charge: false,
  auto_charge_balance: 0,
  auto_charge_charge: 0
};

export const FARE_ADULT = 220;
export const FARE_CHILDREN = 110;

export const NOT_GET_ON_ID = -1;
