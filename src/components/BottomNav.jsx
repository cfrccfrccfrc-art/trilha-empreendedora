import { useLocation, useNavigate } from 'react-router-dom';
import {
  HouseIcon,
  TrailIcon,
  BookIcon,
  StoryIcon,
  HelpIcon,
} from './Sketches';

const TABS = [
  { to: '/',                 label: 'Início',    icon: HouseIcon, match: (p) => p === '/' },
  { to: '/minha-trilha',     label: 'Trilha',    icon: TrailIcon, match: (p) => p.startsWith('/minha-trilha') || p.startsWith('/tarefa') || p.startsWith('/companheiros') || p.startsWith('/cartao') },
  { to: '/conteudos',        label: 'Conteúdos', icon: BookIcon,  match: (p) => p.startsWith('/conteudos') },
  { to: '/casos',            label: 'Casos',     icon: StoryIcon, match: (p) => p.startsWith('/casos') },
  { to: '/preciso-de-ajuda', label: 'Ajuda',     icon: HelpIcon,  match: (p) => p.startsWith('/preciso-de-ajuda') || p.startsWith('/posso-ajudar') },
];

const HIDDEN_PREFIXES = ['/diagnostico', '/resultado', '/salvar', '/supervisor', '/admin'];

export function shouldShowBottomNav(pathname) {
  return !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  if (!shouldShowBottomNav(location.pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur border-t border-line"
      aria-label="Atalhos"
    >
      <div className="mx-auto w-full max-w-md grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(location.pathname);
          const Icon = tab.icon;
          return (
            <button
              key={tab.to}
              type="button"
              onClick={() => navigate(tab.to)}
              className={`flex flex-col items-center gap-0.5 py-2 min-h-14 transition-colors ${
                active ? 'text-primary' : 'text-secondary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
