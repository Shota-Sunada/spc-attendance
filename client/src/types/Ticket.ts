export default interface Ticket {
  id: number;
  user_id: number;
  uuid: string;
  disabled: boolean;
  date_limit: string;
}
