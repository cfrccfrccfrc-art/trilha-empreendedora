import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BackArrow } from './Sketches';
import BottomNav, { shouldShowBottomNav } from './BottomNav';

function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  if (isHome) return null;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="flex items-center gap-3 mb-5 -mt-1">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Voltar"
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-secondary hover:bg-line/40 active:bg-line/60 transition-colors"
      >
        <BackArrow />
      </button>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="font-hand text-secondary text-base flex-1 text-left hover:text-ink transition-colors"
      >
        Trilha Empreendedora
      </button>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const showBottomNav = shouldShowBottomNav(location.pathname);
  return (
    <div className="min-h-full">
      <main
        className={`mx-auto w-full max-w-md min-h-screen px-5 py-6 ${
          showBottomNav ? 'pb-24' : ''
        }`}
      >
        <TopNav />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
