import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import History from './pages/History';
import { useEffect, useState } from 'react';
import LoginRegister from './pages/LoginRegister';
import User from './types/User';
import ReaderPage from './pages/Reader';
import Page404 from './pages/404';
import { UseMediaQuery } from './hooks/UseMediaQuery';
import UserHeader from './components/UserHeader';
import Menu from './components/Menu';
import Charge from './pages/Charge';
import { BACKEND_ENDPOINT, NO_USER } from './const';
import AutoCharge from './pages/AutoCharge';
import UserPage from './pages/User';
import Purchases from './pages/Purchases';
import PurchaseView from './pages/PurchaseView';
import ReaderAdmin from './pages/ReaderAdmin';
import { mediaQuery } from './hooks/MediaQuery';
import FakePass from './pages/FakePass';
import Credits from './pages/Credits';

export default function App() {
  const isSmartphone = UseMediaQuery(mediaQuery.smartphone);
  const [user, setUser] = useState<User>(NO_USER);
  const [isQROpened, setIsQROpened] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false);

  const getAuthUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const res = await fetch(`${BACKEND_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-ID': String(user.id)
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
  });

  return (
    <>
      <main>
        <div className="h-[100%] bg-[#f7f4e5] overflow-y-auto">
          <BrowserRouter>
            {user.id === -1 ? (
              <></>
            ) : (
              <UserHeader isBanned={isBanned} setUser={setUser} isQROpened={isQROpened} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            )}
            <Routes>
              <Route
                path="/"
                element={
                  user.id != -1 ? (
                    <Main
                      user={user}
                      setUser={setUser}
                      isSmartphone={isSmartphone}
                      isQROpened={isQROpened}
                      setIsQROpened={setIsQROpened}
                      isMenuOpen={isMenuOpen}
                      setIsMenuOpen={setIsMenuOpen}
                      isBanned={isBanned}
                      setIsBanned={setIsBanned}
                    />
                  ) : (
                    <LoginRegister setUser={setUser} />
                  )
                }></Route>
              <Route path="/charge" element={<Charge user={user} setIsBanned={setIsBanned} />}></Route>
              <Route path="/fake-pass" element={<FakePass user={user} />}></Route>
              <Route path="/purchases" element={<Purchases user={user} />}></Route>
              <Route path="/purchase" element={<PurchaseView user={user} />}></Route>
              <Route path="/usage-histories" element={<History user={user} />}></Route>
              <Route path="/auto-charge" element={<AutoCharge user={user} />}></Route>
              <Route path="/reader" element={<ReaderPage />}></Route>
              <Route path="/reader-admin" element={<ReaderAdmin />}></Route>
              <Route path="/user" element={<UserPage user={user} />}></Route>
              <Route path="/credits" element={<Credits />}></Route>
              <Route path="/*" element={<Page404 />}></Route>
            </Routes>
            <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
          </BrowserRouter>
        </div>
      </main>
    </>
  );
}
