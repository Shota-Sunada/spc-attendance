import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserPage from './pages/User';
import History from './pages/History';
import { useEffect, useState } from 'react';
import { BACKEND_ENDPOINT } from './const';
import LoginRegister from './pages/LoginRegister';
import User from './types/User';
import ReaderPage from './pages/Reader';
import Page404 from './pages/404';
import { mediaQuery, UseMediaQuery } from './hooks/UseMediaQuery';

export default function App() {
  const isSmartphone = UseMediaQuery(mediaQuery.smartphone);
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const getAuthUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const res = await fetch(`${BACKEND_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
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
            <Route
              path="/"
              element={user ? <UserPage user={user} setUser={setUser} isSmartphone={isSmartphone} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} /> : <LoginRegister setUser={setUser} />}></Route>
            <Route path="/history" element={<History />}></Route>
            <Route path="/reader" element={<ReaderPage />}></Route>
            <Route path="/*" element={<Page404 />}></Route>
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
}
