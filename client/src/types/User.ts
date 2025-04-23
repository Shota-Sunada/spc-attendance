export default interface User {
  id: number;
  name: string;
  password: string;
  is_admin: boolean;
  balance: number;
  last_get_on_id: number;
  created_at: string;
  enable_auto_charge: boolean;
  auto_charge_balance: number;
  auto_charge_charge: number;
  is_banned: boolean;
  pass_is_student: boolean;
  pass_company_name: string;
  pass_start_id: string;
  pass_end_id: string;
}
