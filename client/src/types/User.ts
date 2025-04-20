export default interface User {
  id: number;
  name: string;
  password: string;
  is_admin: boolean;
  balance: number;
  is_getting_on: boolean;
  created_at: string;
  enable_auto_charge: boolean
  auto_charge_balance: number
  auto_charge_charge: number
}
