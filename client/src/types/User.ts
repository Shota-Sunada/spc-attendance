export default interface User {
  id: number;
  name: string;
  password: string;
  isAdmin: boolean;
  balance: number;
  is_getting_on: boolean;
  createdAt: string;
}
