import React, { useState, useEffect } from 'react';
import type { Language } from './i18n/translations';
import { api, setAuthToken } from './lib/api';
import { AdaptiveViewportBar } from './components/AdaptiveViewportBar';
import { LoginPage } from './pages/LoginPage';
import { WorkerPortal } from './pages/WorkerPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnonymousReportModal } from './components/AnonymousReportModal';
import { CaseTrackingModal } from './components/CaseTrackingModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [lang, setLang] = useState<Language>('en');

  // Modals
  const [isAnonModalOpen, setIsAnonModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Check if session token exists
  useEffect(() => {
    api.getMe()
      .then((me) => setUser(me))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    api.logout().then(() => setUser(null));
  };

  const handleSwitchOrg = async (orgCode: string) => {
    if (orgCode === 'APEX-BLD') {
      try {
        const res = await api.login({
          identifier: 'm.adams@facility.fairshift.org',
          password: 'FairShift@2026',
          org_code: 'APEX-BLD'
        });
        setAuthToken(res.access_token);
        setUser(res.user);
      } catch (e) {
        console.error(e);
      }
    } else if (orgCode === 'METRO-UNI') {
      try {
        const res = await api.login({
          identifier: 'admin@metrouni.edu',
          password: 'FairShift@2026',
          org_code: 'METRO-UNI'
        });
        setAuthToken(res.access_token);
        setUser(res.user);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      {/* Persistent Adaptive Viewport & Governance Header (80% - 150%) */}
      <AdaptiveViewportBar
        zoom={zoom}
        setZoom={setZoom}
        lang={lang}
        setLang={setLang}
        currentOrg={user?.org_name}
        onSwitchOrg={user?.role === 'admin' ? handleSwitchOrg : undefined}
      />

      {/* Adaptive Container scaling with transform [0.8x - 1.5x] */}
      <div
        id="adaptive-root"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: `${100 / zoom}%`,
          margin: '0 auto',
        }}
        className="flex-1 flex flex-col"
      >
        {!user ? (
          <LoginPage
            lang={lang}
            onLoginSuccess={(u) => setUser(u)}
            onOpenAnonymousReport={() => setIsAnonModalOpen(true)}
            onOpenTracking={() => setIsTrackingModalOpen(true)}
          />
        ) : user.role === 'worker' ? (
          <WorkerPortal
            user={user}
            lang={lang}
            onLogout={handleLogout}
          />
        ) : (
          <AdminDashboard
            user={user}
            lang={lang}
            onLogout={handleLogout}
            onSwitchOrg={handleSwitchOrg}
          />
        )}
      </div>

      {/* Global Anonymous Case Submission Modal */}
      <AnonymousReportModal
        isOpen={isAnonModalOpen}
        onClose={() => setIsAnonModalOpen(false)}
      />

      {/* Global Anonymous Case Tracking Modal */}
      <CaseTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
    </div>
  );
};

export default App;
