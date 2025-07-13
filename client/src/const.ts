import User from './types/User';

// https://api.butsury-days.shudo-physics.com/
export const BACKEND_ENDPOINT = 'http://localhost:8080';

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
  auto_charge_charge: 0,
  is_banned: false,
  pass_is_student: false,
  pass_company_name: '',
  pass_start_id: '',
  pass_end_id: ''
};

export const FARE_ADULT = 220;
export const FARE_CHILDREN = 110;

export const NOT_GET_ON_ID = 0;

export const STATIONS = ['　', '歩・物化第二', '歩・物理', '歩・鉄道研究', '歩・ｼﾞｬｸﾞﾘﾝｸﾞ'];
export const TYPE = ['　', '乗降', 'オートチャージ', 'チャージ'];
export const COMPANY = ['　', '修道物理班'];

export const PASS_STATIONS = (key: string) => {
  switch (key) {
    case 'bk2':
      return '物化第二';
    case 'physics':
      return '物理';
    case 'train':
      return '鉄道研究';
    case 'jug':
      return 'ｼﾞｬｸﾞ同';
    case 'all':
      return '全線';
    default:
      return '不明';
  }
};
