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
    alert('チャージしました。');
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
