import { useEffect, useState } from 'react';
import { BACKEND_ENDPOINT } from '../const';
import User from '../types/User';
import '../styles/login-register.css';
import MobiryButton from '../components/MobiryButton';
import { useSearchParams } from 'react-router-dom';

export interface SetUserProps {
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const regex = /^[a-zA-Z0-9^$*.[\]{}()?"!@#%&/\\,<>':;|_~`=+-]{8,32}$/;

const LoginRegister = ({ setUser }: SetUserProps) => {
  const [isNameInvalid, setIsNameInvalid] = useState<boolean>(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState<boolean>(false);

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [params] = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    setError(null);
    setIsNameInvalid(false);
    setIsPasswordInvalid(false);

    let invalid = false;

    if (!regex.test(name)) {
      setIsNameInvalid(true);
      invalid = true;
    }

    if (!regex.test(password)) {
      setIsPasswordInvalid(true);
      invalid = true;
    }

    if (invalid) return;

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
      setError(data.message);
    }
  };

  useEffect(() => {
    if (params.get('is_register') === 'true') {
      setIsRegister(true);
    }
  }, [params]);

  return (
    <>
      <title>{'物理班出席システム'}</title>
      <div className="h-[100%] flex flex-col justify-center items-center bg-[#f7f4e5]">
        {/* <h2 className="text-[200%] pointer-default">{'BUTSURY DAYS'}</h2> */}
        <img className="w-[300px]" src="/logo.png" alt="LOGO" />
        <h2 className="text-[150%] pointer-default font-bold p-[3px]">{isRegister ? '新規登録画面' : 'ログイン画面'}</h2>
        <form className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
          <input className={isNameInvalid ? 'bg-red-400' : 'bg-white'} name="name" type="text" placeholder="ユーザー名" required />
          <input className={isPasswordInvalid ? 'bg-red-400' : 'bg-white'} name="password" type="password" placeholder="パスワード" required />
          <p>{'ユーザー名およびパスワードは、'}</p>
          <p>{'文字数が8文字以上32文字以下、'}</p>
          <p>{'半角英数字と記号文字を組み合わせてください。'}</p>
          <p>{'一部記号とスペースは使えません。'}</p>
          <p>{'ひらがな、カタカナ、漢字も使えません。'}</p>
          <button className="" type="submit">
            <MobiryButton text={isRegister ? 'ユーザー登録' : 'ログイン'} onClick={() => {}} />
          </button>
          <div className="flex flex-col border-[#ebebde] rounded-[12px] max-w-[328px] w-fill bg-white p-[24px] mt-[10px]">
            <p className="font-medium min-w-[250px] w-[100%] flex items-center justify-center">
              {isRegister ? 'アカウントをお持ちですか？' : 'アカウントをお持ちでない方'}
            </p>
            <button
              className="m-auto mt-[10px] text-[15px] w-[100%] py-[5%] rounded-[20px] text-white bg-[#462066] hover:bg-[#3e195b] cursor-pointer anim"
              type="button"
              onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'ログインの方はこちらから' : '新規登録の方はこちらから'}
            </button>
          </div>
        </form>
        <div className="m-[2vh] text-white">
          {isNameInvalid ? (
            <p className="m-[3px] p-[3px] rounded-[5px] bg-red-400">
              {'ユーザー名に使用できない文字が含まれているか、'}
              {'文字数が8文字以上32文字以下ではありません。'}
            </p>
          ) : (
            <></>
          )}
          {isPasswordInvalid ? (
            <p className="m-[3px] p-[3px] rounded-[5px] bg-red-400">
              {'パスワードに使用できない文字が含まれているか、'}
              {'文字数が8文字以上32文字以下ではありません。'}
            </p>
          ) : (
            <></>
          )}
          {error && <p className="m-[3px] p-[3px] rounded-[5px] bg-red-400">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default LoginRegister;
