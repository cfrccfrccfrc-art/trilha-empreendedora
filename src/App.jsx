import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Diagnostic from './pages/Diagnostic';
import Results from './pages/Results';
import SavePlan from './pages/SavePlan';
import MyPlan from './pages/MyPlan';
import TaskDetail from './pages/TaskDetail';
import LearningResponse from './pages/LearningResponse';
import TaskCompanion from './pages/TaskCompanion';

// Secondary entrepreneur pages (lazy)
const Formalization     = lazy(() => import('./pages/Formalization'));
const MiniTrilhaPage    = lazy(() => import('./pages/MiniTrilhaPage'));
const Resources         = lazy(() => import('./pages/Resources'));
const ResourceDetail    = lazy(() => import('./pages/ResourceDetail'));
const CaseLibrary       = lazy(() => import('./pages/CaseLibrary'));
const CaseDetailPage    = lazy(() => import('./pages/CaseDetailPage'));
const Opportunities     = lazy(() => import('./pages/Opportunities'));
const HelpRequest       = lazy(() => import('./pages/HelpRequest'));
const OfferHelp         = lazy(() => import('./pages/OfferHelp'));
const BadgeCard         = lazy(() => import('./pages/BadgeCard'));

// Supervisor / admin (lazy — only fetched when these users hit those routes)
const SupervisorLogin     = lazy(() => import('./pages/SupervisorLogin'));
const SupervisorDashboard = lazy(() => import('./pages/SupervisorDashboard'));
const SupervisorReview    = lazy(() => import('./pages/SupervisorReview'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const AdminPreview        = lazy(() => import('./pages/AdminPreview'));
const AdminDonations      = lazy(() => import('./pages/AdminDonations'));
const SourceRefresh       = lazy(() => import('./pages/SourceRefresh'));

function PageFallback() {
  return (
    <div className="py-10 text-center text-secondary text-sm">Carregando…</div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Core entrepreneur path — eager */}
          <Route path="/" element={<Home />} />
          <Route path="/diagnostico" element={<Diagnostic />} />
          <Route path="/resultado" element={<Results />} />
          <Route path="/salvar" element={<SavePlan />} />
          <Route path="/minha-trilha" element={<MyPlan />} />
          <Route path="/tarefa/:id" element={<TaskDetail />} />
          <Route path="/tarefa/:id/aprendizado" element={<LearningResponse />} />
          <Route path="/companheiros/:templateId" element={<TaskCompanion />} />

          {/* Secondary — lazy */}
          <Route path="/formalizacao" element={<Formalization />} />
          <Route path="/mini/:slug" element={<MiniTrilhaPage />} />
          <Route path="/conteudos" element={<Resources />} />
          <Route path="/conteudos/:id" element={<ResourceDetail />} />
          <Route path="/casos" element={<CaseLibrary />} />
          <Route path="/casos/:id" element={<CaseDetailPage />} />
          <Route path="/oportunidades" element={<Opportunities />} />
          <Route path="/preciso-de-ajuda" element={<HelpRequest />} />
          <Route path="/posso-ajudar" element={<OfferHelp />} />
          <Route path="/cartao" element={<BadgeCard />} />

          {/* Supervisor + admin — lazy */}
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/login" element={<SupervisorLogin />} />
          <Route path="/supervisor/revisar/:submissionId" element={<SupervisorReview />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/preview" element={<AdminPreview />} />
          <Route path="/admin/doacoes" element={<AdminDonations />} />
          <Route path="/admin/fontes" element={<SourceRefresh />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
