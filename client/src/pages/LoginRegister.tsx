import { useState } from 'react';
import { BACKEND_ENDPOINT } from '../const';
import User from '../types/User';
import '../styles/login-register.css';

export interface SetUserProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// interface UserResponed {
//   token: string;
//   user: User;
// }

const LoginRegister = ({ setUser }: SetUserProps) => {
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
    <div className="h-[100%] flex flex-col justify-center items-center bg-[#f7f4e5]">
      <h2 className="text-[200%] pointer-default">{'BUTSURY DAYS'}</h2>
      <h2 className="text-[150%] pointer-default">{isRegister ? '新規登録' : 'ログイン'}</h2>
      <form className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="ユーザー名" required />
        <input name="password" type="password" placeholder="パスワード" required />
        <button className="m-[10px] text-[15px] w-[80%] py-[5%] rounded-[20vh] text-white bg-[#219bce] cursor-pointer" type="submit">
          {isRegister ? '登録' : 'ログイン'}
        </button>
        <button className="m-[20px] text-[15px] w-[100%] py-[5%] rounded-[20vh] text-white bg-[#3e195b] cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'ログインの方はこちらから' : '新規登録の方はこちらから'}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginRegister;
