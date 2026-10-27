import React, { useState } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { api, setAuthToken } from '../lib/api';
import { ShieldCheck, Eye, EyeOff, ArrowRight, ShieldAlert, BadgeCheck, Building2 } from 'lucide-react';

interface Props {
  lang: Language;
  onLoginSuccess: (user: any) => void;
  onOpenAnonymousReport: () => void;
  onOpenTracking: () => void;
}

export const LoginPage: React.FC<Props> = ({
  lang,
  onLoginSuccess,
  onOpenAnonymousReport,
  onOpenTracking,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'admin' | 'worker'>('admin');
  
  // Admin form state
  const [adminId, setAdminId] = useState('m.adams@facility.fairshift.org');
  const [siteCode, setSiteCode] = useState('APEX-BLD');
  const [adminPassword, setAdminPassword] = useState('FairShift@2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Worker form state
  const [workerId, setWorkerId] = useState('EMP-88204');
  const [workerPin, setWorkerPin] = useState('FairShift@2026');
  const [showWorkerPin, setShowWorkerPin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login({
        identifier: adminId.trim(),
        password: adminPassword,
        org_code: siteCode.trim(),
      });
      setAuthToken(res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login({
        identifier: workerId.trim(),
        password: workerPin,
      });
      setAuthToken(res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Worker login failed. Please check Badge ID or PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoWorker = (id: string, site: string) => {
    setWorkerId(id);
    setWorkerPin('FairShift@2026');
    setSiteCode(site);
  };

  const setDemoAdmin = (email: string, site: string) => {
    setAdminId(email);
    setAdminPassword('FairShift@2026');
    setSiteCode(site);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-[#ffffff] border border-[#e7e5e0] p-6 rounded shadow-sm">
        {/* Top Action Row */}
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#e7e5e0]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#141515]"></span>
            <span className="text-[11px] font-semibold text-[#5e5e5e] uppercase tracking-wider">
              Integrity Network v2.4
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#2e6930] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Bias Audited</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded bg-[#f0eded] flex items-center justify-center mb-2 border border-[#e7e5e0]">
            <Building2 className="w-5 h-5 text-[#141515]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#141515] tracking-tight">
            {t.loginTitle}
          </h1>
          <p className="text-xs text-[#5e5e5e] mt-1 max-w-xs leading-relaxed">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Role Tabs */}
        <div
          role="tablist"
          aria-label="Sign-in role"
          className="bg-[#f0eded] p-1 rounded flex items-center gap-1 mb-5"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'admin'}
            onClick={() => { setActiveTab('admin'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-3 rounded text-center text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#141515] text-[#ffffff] shadow-sm'
                : 'text-[#5e5e5e] hover:text-[#141515] hover:bg-[#eae7e7]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.adminConsole}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'worker'}
            onClick={() => { setActiveTab('worker'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 px-3 rounded text-center text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'worker'
                ? 'bg-[#141515] text-[#ffffff] shadow-sm'
                : 'text-[#5e5e5e] hover:text-[#141515] hover:bg-[#eae7e7]'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>{t.workerPortal}</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded flex items-start gap-2 mb-4 border border-[#ba1a1a]/20">
            <span className="text-xs font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Admin Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515] flex justify-between">
                <span>{t.workEmailOrId}</span>
                <span className="text-[10px] text-[#5e5e5e] font-normal">Org SSO</span>
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                className="w-full bg-[#f6f3f2] border border-[#e7e5e0] text-[#141515] text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#141515]"
                placeholder="m.adams@facility.fairshift.org"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515] flex justify-between">
                <span>{t.siteCode}</span>
                <span className="text-[10px] text-[#5e5e5e] font-normal">Facility Node</span>
              </label>
              <input
                type="text"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value.toUpperCase())}
                required
                maxLength={10}
                className="w-full uppercase bg-[#f6f3f2] border border-[#e7e5e0] text-[#141515] text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#141515]"
                placeholder="APEX-BLD or METRO-UNI"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515] flex justify-between">
                <span>{t.password}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full bg-[#f6f3f2] border border-[#e7e5e0] text-[#141515] text-xs px-3 py-2 pr-9 rounded focus:outline-none focus:ring-1 focus:ring-[#141515]"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-2.5 text-[#5e5e5e] hover:text-[#141515]"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#141515] hover:bg-[#292929] text-[#ffffff] rounded text-xs font-medium shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : t.signInAdmin}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Preset Selector for Admin Demo */}
            <div className="pt-2 border-t border-[#e7e5e0] flex items-center justify-between text-[11px] text-[#5e5e5e]">
              <span>Demo Roles:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoAdmin('m.adams@facility.fairshift.org', 'APEX-BLD')}
                  className="underline hover:text-[#141515]"
                >
                  Apex Const Admin
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setDemoAdmin('admin@metrouni.edu', 'METRO-UNI')}
                  className="underline hover:text-[#141515]"
                >
                  Metro Univ Admin
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Worker Form */}
        {activeTab === 'worker' && (
          <form onSubmit={handleWorkerSubmit} className="flex flex-col gap-3.5">
            <div className="p-2.5 bg-[#f6f3f2] border border-[#e7e5e0] rounded flex items-center gap-2 text-[11px] text-[#5e5e5e] leading-snug">
              <ShieldCheck className="w-4 h-4 text-[#2e6930] shrink-0" />
              <span>{t.anonymousGuarantee}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515] flex justify-between">
                <span>{t.workEmailOrId}</span>
                <span className="text-[10px] text-[#5e5e5e] font-normal">Badge ID</span>
              </label>
              <input
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                required
                className="w-full bg-[#f6f3f2] border border-[#e7e5e0] text-[#141515] text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#141515]"
                placeholder="EMP-88204"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#141515]">
                <span>{t.pinOrPassword}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showWorkerPin ? 'text' : 'password'}
                  value={workerPin}
                  onChange={(e) => setWorkerPin(e.target.value)}
                  required
                  className="w-full bg-[#f6f3f2] border border-[#e7e5e0] text-[#141515] text-xs px-3 py-2 pr-9 rounded focus:outline-none focus:ring-1 focus:ring-[#141515]"
                  placeholder="FairShift@2026"
                />
                <button
                  type="button"
                  onClick={() => setShowWorkerPin(!showWorkerPin)}
                  className="absolute right-2.5 text-[#5e5e5e] hover:text-[#141515]"
                >
                  {showWorkerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#141515] hover:bg-[#292929] text-[#ffffff] rounded text-xs font-medium shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : t.signInWorker}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Preset Selector for Worker Demo */}
            <div className="pt-2 border-t border-[#e7e5e0] flex items-center justify-between text-[11px] text-[#5e5e5e]">
              <span>Demo Workers:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoWorker('EMP-88204', 'APEX-BLD')}
                  className="underline hover:text-[#141515]"
                >
                  Elena (Construction)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setDemoWorker('EMP-91402', 'METRO-UNI')}
                  className="underline hover:text-[#141515]"
                >
                  Rahul (College)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Public Confidential & Anonymous Reporting Actions */}
        <div className="mt-5 pt-4 border-t border-[#e7e5e0] flex flex-col gap-2">
          <button
            onClick={onOpenAnonymousReport}
            className="w-full py-1.5 px-3 bg-[#ffffff] hover:bg-[#f6f3f2] text-[#141515] border border-[#e7e5e0] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#8c5e14]" />
            <span>Submit Anonymous Safety Report (No Login)</span>
          </button>
          <button
            onClick={onOpenTracking}
            className="w-full py-1.5 px-3 bg-[#ffffff] hover:bg-[#f6f3f2] text-[#5e5e5e] hover:text-[#141515] border border-[#e7e5e0] rounded text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t.trackCase}</span>
          </button>
        </div>
      </main>
    </div>
  );
};
