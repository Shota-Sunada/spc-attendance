export interface Purchase {
  id: number;
  user_id: number;
  date: string;
  type_id: number; // 種別
  class_id: number; // 区分
  place_id: number;
  product_id: number;
  teiki_start_date: string;
  teiki_end_date: string;
  teiki_start_id: number;
  teiki_end_id: number;
  teiki_id: number;
  teiki_company_id: number;
  price: number;
  purchase_price: number;
}

export const PurchaseTypes = ['エラー', 'チャージ', '定期券'];

export const PurchaseClasses = ['エラー', '購入', '購入 (オートチャージ)'];

export const PurchasePlaces = ['エラー', 'アプリ・Web', '物理班', 'ジャグリング同好会', '鉄道研究班'];

export const PurchaseProducts = ['エラー', '通学定期券', '通勤定期券'];

export const NO_PURCHASE_DATA: Purchase = {
  id: -1,
  user_id: -1,
  date: '',
  type_id: 0,
  class_id: 0,
  place_id: 0,
  product_id: 0,
  teiki_start_date: '',
  teiki_end_date: '',
  teiki_start_id: 0,
  teiki_end_id: 0,
  teiki_id: 0,
  teiki_company_id: 0,
  price: 0,
  purchase_price: 0
};
