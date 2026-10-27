import React, { useState, useEffect } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { api } from '../lib/api';
import {
  Clock, DollarSign, Award, AlertTriangle, MessageSquare,
  LogOut, Mic, MicOff, Check, Download, RefreshCw, Send, CheckCircle2
} from 'lucide-react';

interface Props {
  user: any;
  lang: Language;
  onLogout: () => void;
}

export const WorkerPortal: React.FC<Props> = ({ user, lang, onLogout }) => {
  const t = translations[lang];

  // Navigation tabs
  const [navTab, setNavTab] = useState<'home' | 'earnings' | 'report' | 'skills' | 'feedback'>('home');

  // Live clock
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance state
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isClocking, setIsClocking] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Payslip state
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  // Grievance / Report state
  const [reportCategory, setReportCategory] = useState('Workplace Safety Hazard');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSeverity, setReportSeverity] = useState('High');
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reportReceipt, setReportReceipt] = useState<any | null>(null);

  // Skill passport state
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillIssuer, setNewSkillIssuer] = useState('');

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Workplace Safety');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Load telemetry data on mount
  const loadData = async () => {
    try {
      const summary = await api.getAttendanceSummary();
      setAttendanceSummary(summary);
      const records = await api.getAttendance();
      setAttendanceRecords(records);
      const p = await api.getMyPayslips();
      if (p.length > 0) setSelectedPayslip(p[0]);
      const s = await api.getMySkills();
      setSkills(s);
    } catch (err: any) {
      console.error('Error fetching worker data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Clock In handler
  const handleClockIn = async () => {
    setIsClocking(true);
    setActionMessage(null);
    try {
      await api.checkIn({ qr_token: 'FS-STATION-VERIFIED-QR' });
      setActionMessage('Successfully clocked in. Shift telemetry verified.');
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message);
    } finally {
      setIsClocking(false);
    }
  };

  // Clock Out handler
  const handleClockOut = async () => {
    setIsClocking(true);
    setActionMessage(null);
    try {
      await api.checkOut({ notes: 'Shift concluded. Regular break logged.' });
      setActionMessage('Successfully clocked out. Hours and overtime recalculated.');
      await loadData();
    } catch (err: any) {
      setActionMessage(err.message);
    } finally {
      setIsClocking(false);
    }
  };

  // Web Speech API Voice Recognition
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setReportDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Submit Grievance / Safety Case
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    try {
      let receipt;
      if (isAnonymousMode) {
        receipt = await api.submitAnonymousGrievance({
          org_code: user.employee_code.startsWith('EMP-91') ? 'METRO-UNI' : 'APEX-BLD',
          category: reportCategory,
          description: reportDescription,
          severity: reportSeverity,
        });
      } else {
        receipt = await api.submitConfidentialGrievance({
          category: reportCategory,
          description: reportDescription,
          severity: reportSeverity,
        });
      }
      setReportReceipt(receipt);
      setReportDescription('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitFeedback({
        org_code: user.employee_code.startsWith('EMP-91') ? 'METRO-UNI' : 'APEX-BLD',
        category: feedbackCategory,
        rating: feedbackRating,
        feedback_text: feedbackText,
      });
      setFeedbackSuccess(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName || !newSkillIssuer) return;
    try {
      await api.addSkill({
        skill_name: newSkillName,
        issuing_org: newSkillIssuer,
        issue_date: new Date().toISOString().split('T')[0],
      });
      setNewSkillName('');
      setNewSkillIssuer('');
      const updated = await api.getMySkills();
      setSkills(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export Skill Passport JSON
  const handleExportPassport = async () => {
    try {
      const data = await api.exportSkillPassport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FairShift-Skill-Passport-${user.employee_code}.json`;
      a.click();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isActiveShift = attendanceSummary?.active_shift != null;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row">
      {/* Mobile-First Navigation Rail / Sidebar */}
      <aside className="w-full md:w-64 bg-[#ffffff] border-r border-[#e7e5e0] flex flex-col justify-between select-none shrink-0">
        <div className="flex flex-col">
          <div className="h-14 px-4 border-b border-[#e7e5e0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#141515] rounded flex items-center justify-center text-white text-xs font-bold">
                FS
              </div>
              <span className="font-semibold text-sm text-[#141515] tracking-tight">{t.appName}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#2e6930] px-1.5 py-0.5 rounded bg-[#f2f0eb]">
              Worker
            </span>
          </div>

          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
              {t.workerPortal}
            </span>
          </div>

          <nav className="flex flex-row md:flex-col p-1.5 gap-1 overflow-x-auto">
            <button
              onClick={() => setNavTab('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                navTab === 'home'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t.home}</span>
            </button>

            <button
              onClick={() => setNavTab('earnings')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                navTab === 'earnings'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t.earnings}</span>
            </button>

            <button
              onClick={() => setNavTab('report')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                navTab === 'report'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t.reportIssue}</span>
            </button>

            <button
              onClick={() => setNavTab('skills')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                navTab === 'skills'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t.mySkills}</span>
            </button>

            <button
              onClick={() => setNavTab('feedback')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                navTab === 'feedback'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.feedback}</span>
            </button>
          </nav>
        </div>

        {/* Worker Badge Summary & Logout */}
        <div className="p-3 border-t border-[#e7e5e0] bg-[#faf9f6]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#141515] leading-tight">{user.full_name}</span>
              <span className="text-[10px] text-[#5e5e5e] leading-tight">{user.employee_code}</span>
            </div>
            <button
              onClick={onLogout}
              title={t.logout}
              className="p-1.5 text-[#5e5e5e] hover:text-[#a82a2a] hover:bg-[#f0eded] rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Top Header Card */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-[#e7e5e0] gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded bg-[#292929] text-white flex items-center justify-center font-bold text-sm border border-[#e7e5e0]">
                {user.full_name.charAt(0)}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isActiveShift ? 'bg-[#2e6930] animate-pulse' : 'bg-[#747878]'
                }`}
                title={isActiveShift ? 'Active on shift' : 'Off-duty'}
              ></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[11px] text-[#5e5e5e]">
                <span className="uppercase font-semibold tracking-wider">{user.employee_code}</span>
                <span>•</span>
                <span>{user.tier || 'Charter Verified Tier 1'}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-[#141515] tracking-tight">
                {user.full_name}
              </h1>
              <p className="text-xs text-[#5e5e5e] flex items-center gap-1 mt-0.5">
                <span>{user.station_code || 'Station 4B'}</span>
                <span>•</span>
                <span>{user.org_name || 'Apex Infrastructure'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#e7e5e0] bg-[#ffffff] text-xs font-semibold font-tabular">
              <Clock className="w-3.5 h-3.5 text-[#5e5e5e]" />
              <span>{currentTime}</span>
            </div>
            <button
              onClick={loadData}
              title="Refresh Telemetry"
              className="p-1.5 border border-[#e7e5e0] rounded bg-[#ffffff] hover:bg-[#f0eded]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#5e5e5e]" />
            </button>
          </div>
        </section>

        {/* Action / Error Banner */}
        {actionMessage && (
          <div className="mb-4 p-3 bg-[#f2f0eb] border border-[#e7e5e0] rounded text-xs font-medium text-[#141515] flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-[#5e5e5e] hover:text-[#141515]">
              ×
            </button>
          </div>
        )}

        {/* 1. HOME TAB — ATTENDANCE TELEMETRY & CLOCK-IN/OUT */}
        {navTab === 'home' && (
          <div className="flex flex-col gap-6">
            {/* Active Shift Card */}
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5e5e5e] tracking-wider">
                    {t.activeTelemetry}
                  </span>
                  <h2 className="text-base font-semibold text-[#141515]">
                    {t.shiftStatus}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f6f3f2] border border-[#e7e5e0] text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActiveShift ? 'bg-[#2e6930]' : 'bg-[#747878]'
                    }`}
                  ></span>
                  <span>{isActiveShift ? t.activeAndInStation : t.clockedOut}</span>
                </div>
              </div>

              {/* 3 Telemetry Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#f6f3f2] rounded border border-[#e7e5e0]">
                  <span className="text-[10px] uppercase font-semibold text-[#5e5e5e]">
                    {t.shiftStatus}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#141515]">
                      {isActiveShift ? 'Active In-Station' : 'Resting / Scheduled'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5e5e5e] mt-1 block">
                    {isActiveShift
                      ? `Clock-in: ${new Date(attendanceSummary?.active_shift?.clock_in).toLocaleTimeString()}`
                      : 'Next window: 08:00 AM'}
                  </span>
                </div>

                <div className="p-3 bg-[#f6f3f2] rounded border border-[#e7e5e0]">
                  <span className="text-[10px] uppercase font-semibold text-[#5e5e5e]">
                    {t.elapsedTime}
                  </span>
                  <div className="mt-1 text-2xl font-bold font-tabular text-[#141515]">
                    {attendanceSummary?.active_shift
                      ? `${Math.floor(attendanceSummary.active_shift.duration_minutes / 60)}h ${
                          attendanceSummary.active_shift.duration_minutes % 60
                        }m`
                      : '0h 00m'}
                  </div>
                  <span className="text-[11px] text-[#5e5e5e]">Standard shift: 8h 00m</span>
                </div>

                <div className="p-3 bg-[#f6f3f2] rounded border border-[#e7e5e0]">
                  <span className="text-[10px] uppercase font-semibold text-[#5e5e5e]">
                    {t.mandatoryBreak}
                  </span>
                  <div className="mt-1 text-sm font-semibold text-[#141515]">
                    12:00 – 12:45
                  </div>
                  <span className="text-[11px] text-[#2e6930] flex items-center gap-1 mt-1 font-medium">
                    <Check className="w-3 h-3" /> Eligible (Meal Break 1)
                  </span>
                </div>
              </div>

              {/* Clock In / Clock Out Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e7e5e0]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isActiveShift ? (
                    <button
                      onClick={handleClockOut}
                      disabled={isClocking}
                      className="px-4 py-2 bg-[#141515] hover:bg-[#292929] text-white text-xs font-semibold rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isClocking ? 'Processing...' : t.clockOut}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleClockIn}
                      disabled={isClocking}
                      className="px-4 py-2 bg-[#2e6930] hover:bg-[#255427] text-white text-xs font-semibold rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isClocking ? 'Processing...' : t.clockIn}</span>
                    </button>
                  )}

                  <button
                    onClick={() => alert('Shift swap request logged for supervisor review.')}
                    className="px-3 py-2 border border-[#e7e5e0] bg-[#ffffff] hover:bg-[#f6f3f2] text-xs font-medium rounded text-[#141515]"
                  >
                    {t.swapShift}
                  </button>
                </div>

                <span className="text-[11px] text-[#5e5e5e]">
                  QR Node Verified: Hub Station 4B • Biometric Parity Enforced
                </span>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#141515]">Recent Verified Shifts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#e7e5e0] bg-[#f6f3f2] text-[#5e5e5e]">
                      <th className="py-2 px-3 font-semibold">Date & Clock In</th>
                      <th className="py-2 px-3 font-semibold">Clock Out</th>
                      <th className="py-2 px-3 font-semibold">Duration</th>
                      <th className="py-2 px-3 font-semibold">Regular</th>
                      <th className="py-2 px-3 font-semibold">Overtime</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e5e0]">
                    {attendanceRecords.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-[#faf9f6]">
                        <td className="py-2 px-3 font-tabular font-medium">
                          {new Date(r.clock_in).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2 px-3 font-tabular text-[#5e5e5e]">
                          {r.clock_out ? new Date(r.clock_out).toLocaleTimeString([], { timeStyle: 'short' }) : 'In progress'}
                        </td>
                        <td className="py-2 px-3 font-tabular">{Math.round(r.duration_minutes / 60 * 10) / 10} hrs</td>
                        <td className="py-2 px-3 font-tabular">{Math.round(r.regular_minutes / 60 * 10) / 10} hrs</td>
                        <td className="py-2 px-3 font-tabular text-[#8c5e14] font-medium">
                          {r.overtime_minutes > 0 ? `+${Math.round(r.overtime_minutes / 60 * 10) / 10} hrs` : '0 hrs'}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              r.status === 'completed'
                                ? 'bg-[#f0eded] text-[#2e6930]'
                                : 'bg-[#f0eded] text-[#141515]'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. EARNINGS TAB — TRANSPARENT PAYSLIP WITH LINE ITEMS */}
        {navTab === 'earnings' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5e5e5e] tracking-wider">
                    {t.transparentLedger}
                  </span>
                  <h2 className="text-lg font-semibold text-[#141515]">
                    {t.grossEarnings} & Pay Period Summary
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded border border-[#e7e5e0] bg-[#f6f3f2] text-xs font-medium">
                  {selectedPayslip?.period_label || 'Current Cycle'}
                </span>
              </div>

              {selectedPayslip ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Summary Bento Block */}
                  <div className="md:col-span-5 p-4 rounded bg-[#f6f3f2] border border-[#e7e5e0] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#5e5e5e]">
                        {t.grossEarnings}
                      </span>
                      <div className="text-3xl font-bold font-tabular text-[#141515] mt-1">
                        ${selectedPayslip.gross_pay?.toFixed(2)}
                      </div>
                      <p className="text-xs text-[#5e5e5e] mt-1">
                        {selectedPayslip.calculation_notes ||
                          'Accumulated across completed shift cycles + verified overtime.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e7e5e0] mt-3 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#5e5e5e]">{t.netPayable}:</span>
                        <span className="font-bold text-[#2e6930] font-tabular">
                          ${selectedPayslip.net_pay?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5e5e5e]">{t.nextPayout}:</span>
                        <span className="font-medium text-[#141515]">Friday, Direct Deposit</span>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Line Items Breakdown */}
                  <div className="md:col-span-7 flex flex-col gap-2">
                    <div className="border border-[#e7e5e0] rounded overflow-hidden">
                      <div className="bg-[#eae7e7] px-3 py-2 border-b border-[#e7e5e0] flex justify-between text-[11px] font-semibold text-[#5e5e5e] uppercase">
                        <span>{t.rateClassification}</span>
                        <span>{t.hours}</span>
                        <span>{t.calculated}</span>
                      </div>
                      <div className="divide-y divide-[#e7e5e0] text-xs font-tabular">
                        <div className="px-3 py-2.5 flex justify-between items-center bg-[#ffffff]">
                          <div>
                            <span className="font-medium text-[#141515]">{t.baseHourly}</span>
                            <span className="block text-[11px] text-[#5e5e5e]">
                              ${selectedPayslip.base_rate?.toFixed(2)}/hr standard tier
                            </span>
                          </div>
                          <span>{selectedPayslip.base_hours} hrs</span>
                          <span className="font-semibold text-[#141515]">
                            ${selectedPayslip.base_pay?.toFixed(2)}
                          </span>
                        </div>

                        <div className="px-3 py-2.5 flex justify-between items-center bg-[#ffffff]">
                          <div>
                            <span className="font-medium text-[#141515]">{t.overtime15x}</span>
                            <span className="block text-[11px] text-[#5e5e5e]">
                              ${selectedPayslip.overtime_rate?.toFixed(2)}/hr rate parity
                            </span>
                          </div>
                          <span>{selectedPayslip.overtime_hours} hrs</span>
                          <span className="font-semibold text-[#141515]">
                            ${selectedPayslip.overtime_earnings?.toFixed(2)}
                          </span>
                        </div>

                        <div className="px-3 py-2.5 flex justify-between items-center bg-[#ffffff]">
                          <div>
                            <span className="font-medium text-[#141515]">Allowances & Stipends</span>
                            <span className="block text-[11px] text-[#5e5e5e]">Meal & transit support</span>
                          </div>
                          <span>Flat</span>
                          <span className="font-semibold text-[#2e6930]">
                            +${selectedPayslip.allowances?.toFixed(2)}
                          </span>
                        </div>

                        <div className="px-3 py-2.5 flex justify-between items-center bg-[#ffffff]">
                          <div>
                            <span className="font-medium text-[#141515]">Statutory Deductions</span>
                            <span className="block text-[11px] text-[#5e5e5e]">Safety & labor insurance</span>
                          </div>
                          <span>Govt</span>
                          <span className="font-semibold text-[#a82a2a]">
                            -${selectedPayslip.deductions?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="self-end px-3 py-1.5 border border-[#e7e5e0] rounded text-xs font-medium text-[#141515] hover:bg-[#f6f3f2] flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Payslip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#5e5e5e]">No payslips currently available for this cycle.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. REPORT AN ISSUE TAB — CONFIDENTIAL & ANONYMOUS WITH VOICE INPUT */}
        {navTab === 'report' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-5 flex flex-col gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8c5e14] tracking-wider">
                  Zero-Retaliation Reporting Node
                </span>
                <h2 className="text-base font-semibold text-[#141515]">
                  {t.reportIssue}
                </h2>
                <p className="text-xs text-[#5e5e5e] mt-0.5">
                  Your safety and dignity are protected. Reports are routed directly to authorized safety case handlers.
                </p>
              </div>

              {reportReceipt && (
                <div className="p-4 bg-[#f2f0eb] border border-[#2e6930] rounded flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#2e6930] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{reportReceipt.message}</span>
                  </div>
                  <div className="bg-[#ffffff] p-3 rounded border border-[#e7e5e0] text-xs font-mono">
                    <div><strong>{t.trackingNumber}:</strong> {reportReceipt.tracking_number}</div>
                    <div><strong>{t.trackingSecret}:</strong> {reportReceipt.tracking_secret}</div>
                  </div>
                  <p className="text-[11px] text-[#5e5e5e]">{reportReceipt.instructions}</p>
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                {/* Privacy Mode Selector */}
                <div className="flex items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy_mode"
                      checked={!isAnonymousMode}
                      onChange={() => setIsAnonymousMode(false)}
                      className="accent-[#141515]"
                    />
                    <span>Confidential (Known only to Case Officer)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy_mode"
                      checked={isAnonymousMode}
                      onChange={() => setIsAnonymousMode(true)}
                      className="accent-[#141515]"
                    />
                    <span>Anonymous (Zero identity attached)</span>
                  </label>
                </div>

                {/* Category & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#141515]">{t.reportCategory}</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="border border-[#e7e5e0] bg-[#f6f3f2] p-2 rounded text-xs text-[#141515]"
                    >
                      <option value="Workplace Safety Hazard">Workplace Safety Hazard</option>
                      <option value="Missing Protective Equipment">Missing Protective Equipment</option>
                      <option value="Unsafe Machinery / Scaffolding">Unsafe Machinery / Scaffolding</option>
                      <option value="Excessive Shifts / Fatigue">Excessive Shifts / Fatigue</option>
                      <option value="Harassment or Unfair Treatment">Harassment or Unfair Treatment</option>
                      <option value="Wage or Overtime Discrepancy">Wage or Overtime Discrepancy</option>
                      <option value="Sanitation & Facility Issue">Sanitation & Facility Issue</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#141515]">Severity Level</label>
                    <select
                      value={reportSeverity}
                      onChange={(e) => setReportSeverity(e.target.value)}
                      className="border border-[#e7e5e0] bg-[#f6f3f2] p-2 rounded text-xs text-[#141515]"
                    >
                      <option value="Standard">Standard Priority</option>
                      <option value="High">High Priority (Immediate Hazard)</option>
                      <option value="Critical">Critical (Immediate Evacuate / Stop)</option>
                    </select>
                  </div>
                </div>

                {/* Description with Voice Input */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#141515]">Description</label>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                        isListening
                          ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] animate-pulse'
                          : 'bg-[#f6f3f2] text-[#141515] border-[#e7e5e0] hover:bg-[#eae7e7]'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isListening ? t.listening : t.voiceInput}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    required
                    placeholder={t.describeIssue}
                    className="w-full border border-[#e7e5e0] bg-[#f6f3f2] p-3 rounded text-xs text-[#141515] focus:outline-none focus:ring-1 focus:ring-[#141515]"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-[#141515] hover:bg-[#292929] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAnonymousMode ? t.submitAnonymous : t.submitConfidential}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. SKILLS TAB — PORTABLE SKILL PASSPORT */}
        {navTab === 'skills' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5e5e5e] tracking-wider">
                    Worker-Owned Portable Credential
                  </span>
                  <h2 className="text-base font-semibold text-[#141515]">
                    {t.skillPassport}
                  </h2>
                </div>
                <button
                  onClick={handleExportPassport}
                  className="px-3 py-1.5 bg-[#141515] hover:bg-[#292929] text-white rounded text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportPassport}</span>
                </button>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((s) => (
                  <div key={s.id} className="p-3 bg-[#f6f3f2] border border-[#e7e5e0] rounded flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#141515]">{s.skill_name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            s.verification_status === 'Verified'
                              ? 'bg-[#2e6930] text-white'
                              : 'bg-[#8c5e14] text-white'
                          }`}
                        >
                          {s.verification_status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5e5e5e] mt-1 block">
                        Issuer: {s.issuing_org}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#e7e5e0] mt-2 flex justify-between text-[10px] text-[#5e5e5e]">
                      <span>Issued: {s.issue_date}</span>
                      <span>Cert: {s.certificate_number || 'REG-FS'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Skill Form */}
              <form onSubmit={handleAddSkill} className="pt-3 border-t border-[#e7e5e0] flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#141515]">Add Training or Skill Record</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Scaffolding Level 2)"
                    className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs text-[#141515]"
                    required
                  />
                  <input
                    type="text"
                    value={newSkillIssuer}
                    onChange={(e) => setNewSkillIssuer(e.target.value)}
                    placeholder="Issuing Organisation (e.g. OSHA / Guild)"
                    className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs text-[#141515]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="self-start px-3 py-1.5 bg-[#141515] text-white rounded text-xs font-medium hover:bg-[#292929]"
                >
                  Submit for Verification
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 5. FEEDBACK TAB — ANONYMOUS WORKPLACE PULSE */}
        {navTab === 'feedback' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#ffffff] border border-[#e7e5e0] rounded p-5 flex flex-col gap-4 max-w-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5e5e5e] tracking-wider">
                  Anonymous Workplace Feedback
                </span>
                <h2 className="text-base font-semibold text-[#141515]">
                  Voice Your Suggestions & Working Conditions
                </h2>
                <p className="text-xs text-[#5e5e5e] mt-0.5">
                  Zero identity is linked. Aggregate themes help management optimize shift workloads and equipment.
                </p>
              </div>

              {feedbackSuccess && (
                <div className="p-3 bg-[#f2f0eb] border border-[#2e6930] rounded text-xs font-semibold text-[#2e6930] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback recorded anonymously. Thank you for contributing to fair work standards.</span>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#141515]">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs text-[#141515]"
                  >
                    <option value="Workplace Safety">Workplace Safety</option>
                    <option value="Salary Transparency">Salary Transparency</option>
                    <option value="Shift Scheduling">Shift Scheduling</option>
                    <option value="Facilities & Rest Areas">Facilities & Rest Areas</option>
                    <option value="Management & Supervision">Management & Supervision</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#141515]">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`w-8 h-8 rounded border text-xs font-bold transition-colors ${
                          feedbackRating >= star
                            ? 'bg-[#141515] text-white border-[#141515]'
                            : 'bg-[#f6f3f2] text-[#5e5e5e] border-[#e7e5e0]'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#141515]">Your Anonymous Suggestions</label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                    placeholder="Share improvements on shifts, facilities, rest breaks..."
                    className="p-2 border border-[#e7e5e0] bg-[#f6f3f2] rounded text-xs text-[#141515] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 bg-[#141515] hover:bg-[#292929] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 self-start"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Anonymous Feedback</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
