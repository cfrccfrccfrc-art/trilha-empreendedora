import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BackArrow } from './Sketches';
import BottomNav, { shouldShowBottomNav } from './BottomNav';

// Rotas que aproveitam largura desktop (bibliotecas, consultor B2B). O fluxo
// principal (diagnóstico, resultado, trilha, tarefa) continua mobile-style
// mesmo em desktop porque é foco de leitura curta e atenção alta.
const WIDE_PREFIXES = [
  '/conteudos',
  '/casos',
  '/oportunidades',
  '/preciso-de-ajuda',
  '/posso-ajudar',
  '/biblioteca',
];

function isWideRoute(pathname) {
  return WIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function TopNav({ wide }) {
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

      {wide && (
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <WideNavLink to="/conteudos" label="Conteúdos" />
          <WideNavLink to="/casos" label="Casos" />
          <WideNavLink to="/oportunidades" label="Oportunidades" />
          <WideNavLink to="/biblioteca/tarefas" label="Tarefas" />
        </nav>
      )}
    </div>
  );
}

function WideNavLink({ to, label }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active =
    location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
        active
          ? 'text-primary bg-primaryLight/40'
          : 'text-secondary hover:text-ink hover:bg-line/40'
      }`}
    >
      {label}
    </button>
  );
}

export default function Layout() {
  const location = useLocation();
  const showBottomNav = shouldShowBottomNav(location.pathname);
  const wide = isWideRoute(location.pathname);

  return (
    <div className="min-h-full">
      <main
        className={`mx-auto w-full px-5 py-6 min-h-screen ${
          wide ? 'max-w-md md:max-w-5xl md:px-8' : 'max-w-md'
        } ${showBottomNav ? 'pb-24 md:pb-6' : ''}`}
      >
        <TopNav wide={wide} />
        <Outlet />
      </main>
      <BottomNav wide={wide} />
    </div>
  );
}
