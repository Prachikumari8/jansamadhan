
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { MapExplorer } from './pages/MapExplorer.tsx';
import { Login } from './pages/Login.tsx';
import { Signup } from './pages/Signup.tsx';
import { ForgotPassword } from './pages/ForgotPassword.tsx';
import { ReportPage } from './pages/ReportPage.tsx';
import { Profile } from './pages/Profile.tsx';

// Lazy load heavy or high-dependency pages
const Dashboard = lazy(() => import('./pages/Dashboard.tsx').then(m => ({ default: m.Dashboard })));
const AdminPortal = lazy(() => import('./pages/AdminPortal.tsx').then(m => ({ default: m.AdminPortal })));

const LoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Loading Component...</p>
  </div>
);

/**
 * Component to force navigation to home page on initial application load (refresh)
 */
const ResetToHome: React.FC = () => {
  const navigate = useNavigate();
  const hasReset = useRef(false);

  useEffect(() => {
    // Only perform the reset once per session load (on refresh)
    if (!hasReset.current) {
      navigate('/', { replace: true });
      hasReset.current = true;
    }
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ResetToHome />
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;
