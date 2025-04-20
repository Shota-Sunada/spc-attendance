import { NavigateFunction } from 'react-router-dom';
import { BACKEND_ENDPOINT, NOT_GET_ON_ID } from './const';
import User from './types/User';

export async function apiCharge(user: User, charge: number, showNotify: boolean, stop_id: number | null, navigate: NavigateFunction | null) {
  const payload = {
    name: user.name,
    balance: user.balance + charge,
    last_get_on_id: stop_id ? stop_id : user.last_get_on_id,
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

    const res2 = await fetch(`${BACKEND_ENDPOINT}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload2)
    });

    if (showNotify) {
      if (res2.ok) {
        alert('チャージしました。');
      } else {
        alert('チャージしましたが、購入履歴の登録に失敗しました。管理者にお問い合わせ下さい。');
      }
    }
  } else {
    if (showNotify) {
      alert('チャージに失敗しました。管理者にお問い合わせ下さい。');
    }
  }
  if (navigate) {
    navigate('/');
  }
}

export async function apiAutoCharge(user: User, enabled: boolean, balance: number, charge: number, navigate: NavigateFunction) {
  const payload = {
    name: user.name,
    balance: user.balance,
    last_get_on_id: user.last_get_on_id,
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

export async function apiGetOn(user: User, stop_id: number): Promise<boolean> {
  const payload = {
    name: user.name,
    balance: user.balance,
    last_get_on_id: stop_id,
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
    console.log('乗車しました。');
    return true;
  } else {
    console.log('乗車に失敗しました。');
    return false;
  }
}

export async function apiPay(user: User, balance: number): Promise<boolean> {
  const payload = {
    name: user.name,
    balance: balance,
    last_get_on_id: NOT_GET_ON_ID,
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
    console.log('精算しました。');
    return true;
  } else {
    console.log('精算に失敗しました。');
    return false;
  }
}

export async function apiCreateHistory(user: User, get_off_id: number, fare: number, balance: number, type_id: number, company_id: number) {
  const payload = {
    user_id: user.id,
    get_on_id: user.last_get_on_id,
    get_off_id: get_off_id,
    fair: fare,
    balance: balance,
    type_id: type_id,
    company_id: company_id
  };

  const res = await fetch(`${BACKEND_ENDPOINT}/api/histories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log('履歴を作成しました。');
    return true;
  } else {
    console.log('履歴の作成に失敗しました。');
    return false;
  }
}

export async function apiCreateChargeHistory(user: User, fare: number, balance: number, type_id: number) {
  const payload = {
    user_id: user.id,
    get_on_id: user.last_get_on_id,
    get_off_id: 0,
    fair: fare,
    balance: balance,
    type_id: type_id,
    company_id: 0
  };

  const res = await fetch(`${BACKEND_ENDPOINT}/api/histories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log('履歴を作成しました。');
    return true;
  } else {
    console.log('履歴の作成に失敗しました。');
    return false;
  }
}
