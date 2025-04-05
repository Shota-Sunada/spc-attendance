import { useState } from 'react';
import { BACKEND_ENDPOINT } from '../const';
import User from '../types/User';

interface Props {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const LoginRegister = ({ setUser }: Props) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    if (isRegister) {
      register(name, password);
    } else {
      login(name, password);
    }

    e.currentTarget.reset();
  };

  const register = async (name: string, password: string) => {
    const payload = {
      name: name,
      password: password,
      is_admin: false
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } else {
      setError(data.message);
    }
  };

  const login = async (name: string, password: string) => {
    const payload = {
      name: name,
      password: password
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } else {
      setError(data.error);
    }
  };

  return (
    <>
      <h2>{isRegister ? '新規登録' : 'ログイン'}</h2>
      <button onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'ログイン' : '新規登録'}</button>
      <form onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="ユーザー名" />
        <input name="password" type="password" placeholder="パスワード" />
        <button type="submit">{isRegister ? '登録' : 'ログイン'}</button>
      </form>
      {error && <p>{error}</p>}
    </>
  );
};

export default LoginRegister;
