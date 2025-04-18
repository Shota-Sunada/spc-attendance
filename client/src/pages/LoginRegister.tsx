import { useState } from 'react';
import { BACKEND_ENDPOINT } from '../const';
import User from '../types/User';
import '../styles/login-register.css';
import ky from 'ky';

export interface SetUserProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface UserResponed {
  token: string;
  user: User;
}

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

    const data = await ky.post(`${BACKEND_ENDPOINT}/register`, { json: { payload } }).json<UserResponed>();
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const login = async (name: string, password: string) => {
    const payload = {
      name: name,
      password: password
    };

    const data = await ky.post(`${BACKEND_ENDPOINT}/login`, { json: { payload } }).json<UserResponed>();
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  return (
    <div className="m-[20vh] flex flex-col justify-center items-center">
      <h2 className="text-[200%]">{isRegister ? '新規登録' : 'ログイン'}</h2>
      <button className="m-[10px] text-[2vh] px-[3vh] py-[1vh] border-[1px] rounded-[10px]" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'ログイン' : '新規登録'}
      </button>
      <form className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="ユーザー名" required />
        <input name="password" type="password" placeholder="パスワード" required />
        <button className="m-[10px] text-[2vh] px-[20%] py-[10%] border-[1px] rounded-[10px]" type="submit">
          {isRegister ? '登録' : 'ログイン'}
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginRegister;
