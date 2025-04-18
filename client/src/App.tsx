import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserPage from './pages/User';
import History from './pages/History';
import { useEffect, useState } from 'react';
import { BACKEND_ENDPOINT } from './const';
import LoginRegister from './pages/LoginRegister';
import User from './types/User';
import ReaderPage from './pages/Reader';
import Page404 from './pages/404';
import ky from 'ky';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const getAuthUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const res = await ky.post(`${BACKEND_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json<User>();
      setUser(data);
    } else {
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    getAuthUser();
  }, []);

  return (
    <>
      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <UserPage user={user} /> : <LoginRegister setUser={setUser} />}></Route>
            <Route path="/history" element={<History />}></Route>
            <Route path="/reader" element={<ReaderPage />}></Route>
            <Route path="/*" element={<Page404 />}></Route>
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
}
