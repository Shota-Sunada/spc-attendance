import { NavigateFunction } from 'react-router-dom';
import { BACKEND_ENDPOINT } from './const';
import User from './types/User';

export async function apiCharge(user: User, charge: number, navigate: NavigateFunction) {
  const payload = {
    name: user.name,
    balance: user.balance + charge,
    is_getting_on: user.is_getting_on,
    enable_auto_charge: user.enable_auto_charge,
    auto_charge_balance: user.auto_charge_balance,
    auto_charge_charge: user.auto_charge_charge
  };

  const res = await fetch(`${BACKEND_ENDPOINT}/api/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const payload2 = {
      user_id: user.id,
      type_id: 1,
      class_id: 1,
      place_id: 1,
      product_id: 0,
      teiki_start_date: null,
      teiki_end_date: null,
      teiki_start_id: 0,
      teiki_end_id: 0,
      teiki_id: 0,
      teiki_company_id: 0,
      price: charge,
      purchase_price: charge
    };

    const token = localStorage.getItem('token');
    const res2 = await fetch(`${BACKEND_ENDPOINT}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload2)
    });

    if (res2.ok) {
      alert('チャージしました。');
    } else {
      alert('チャージしましたが、購入履歴の登録に失敗しました。管理者にお問い合わせ下さい。');
    }
  } else {
    alert('チャージに失敗しました。管理者にお問い合わせ下さい。');
  }
  navigate('/');
}

export async function apiAutoCharge(user: User, enabled: boolean, balance: number, charge: number, navigate: NavigateFunction) {
  const payload = {
    name: user.name,
    balance: user.balance,
    is_getting_on: user.is_getting_on,
    enable_auto_charge: enabled,
    auto_charge_balance: balance,
    auto_charge_charge: charge
  };

  const res = await fetch(`${BACKEND_ENDPOINT}/api/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('設定を更新しました。');
  } else {
    alert('設定の更新に失敗しました。管理者にお問い合わせ下さい。');
  }
  navigate('/');
}
