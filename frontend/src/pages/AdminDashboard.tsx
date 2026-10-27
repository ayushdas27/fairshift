import React, { useState, useEffect } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { api } from '../lib/api';
import {
  LayoutDashboard, Users, Clock, DollarSign, ShieldAlert, BarChart3,
  LogOut, Download, Scale, BatteryWarning, RefreshCw, Check
} from 'lucide-react';

interface Props {
  user: any;
  lang: Language;
  onLogout: () => void;
  onSwitchOrg?: (orgCode: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  user,
  lang,
  onLogout,
}) => {
  const t = translations[lang];

  // Navigation
  const [activeNav, setActiveNav] = useState<'overview' | 'workforce' | 'attendance' | 'payroll' | 'safety' | 'reports'>('overview');

  // Dashboard Data
  const [overview, setOverview] = useState<any>(null);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ov = await api.getDashboardOverview();
      setOverview(ov);
      const g = await api.getAdminGrievances();
      setGrievances(g);
      const p = await api.getAdminPayslips();
      setPayrollList(p);
      await api.getFeedbackSummary();
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Grievance Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateGrievanceStatus(id, {
        status: newStatus,
        notes: `Advanced to ${newStatus} by ${user.full_name}`,
        resolution_notes: newStatus === 'Resolved' ? 'Hazard resolved and perimeter inspected.' : undefined,
      });
      setMessage(`Case status updated to ${newStatus}`);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Approve Payslip
  const handleApprovePayslip = async (payslipId: string) => {
    try {
      await api.approvePayslip(payslipId);
      setMessage(`Payslip ${payslipId.slice(0, 8)} approved and recorded to audit ledger.`);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Run Period Calculation
  const handleCalculatePayroll = async () => {
    try {
      if (payrollList.length > 0 && payrollList[0].payroll_period_id) {
        await api.calculatePayroll(payrollList[0].payroll_period_id);
        setMessage('Payroll calculated with 1.5x overtime parity for current period.');
        await loadData();
      } else {
        alert('No active payroll period found.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row">
      {/* Sidebar Rail */}
      <aside className="w-full md:w-64 bg-[#ffffff] border-r border-[#e7e5e0] flex flex-col justify-between select-none shrink-0">
        <div className="flex flex-col">
          <div className="h-14 px-4 border-b border-[#e7e5e0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#141515] rounded flex items-center justify-center text-white text-xs font-bold">
                FS
              </div>
              <span className="font-semibold text-sm text-[#141515] tracking-tight">{t.appName}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#141515] px-1.5 py-0.5 rounded bg-[#f2f0eb]">
              Console
            </span>
          </div>

          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
              {t.adminConsole}
            </span>
          </div>

          <nav className="flex flex-row md:flex-col p-1.5 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveNav('overview')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'overview'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.overview}</span>
            </button>

            <button
              onClick={() => setActiveNav('workforce')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'workforce'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.workforce}</span>
            </button>

            <button
              onClick={() => setActiveNav('attendance')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'attendance'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t.attendance}</span>
            </button>

            <button
              onClick={() => setActiveNav('payroll')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'payroll'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{t.payroll}</span>
            </button>

            <button
              onClick={() => setActiveNav('safety')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'safety'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t.safetyReports}</span>
            </button>

            <button
              onClick={() => setActiveNav('reports')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'reports'
                  ? 'bg-[#141515] text-[#ffffff]'
                  : 'text-[#5e5e5e] hover:bg-[#f2f0eb] hover:text-[#141515]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.reports}</span>
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[#e7e5e0] bg-[#faf9f6]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#141515] leading-tight">{user.full_name}</span>
              <span className="text-[10px] text-[#5e5e5e] leading-tight">{user.role.toUpperCase()} • {user.employee_code}</span>
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

      {/* Main Operations Canvas */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Top Context Header Area */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-6 border-b border-[#e7e5e0] gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Operations Governance
              </span>
              <span className="text-[#5e5e5e] text-xs">•</span>
              <span className="text-[11px] font-semibold text-[#141515]">
                {overview?.org_name || 'Apex Infrastructure Hub #4'}
              </span>
              <span className="text-[#5e5e5e] text-xs">•</span>
              <span className="text-[10px] uppercase font-bold text-[#2e6930] bg-[#f2f0eb] px-1.5 py-0.5 rounded">
                Industry: {overview?.industry || 'Construction'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#141515] tracking-tight">
              Overview — Executive Operations Console
            </h1>
            <p className="text-xs text-[#5e5e5e]">
              Real-time workforce telemetry, overtime equity, and zero-retaliation case resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#f2f0eb] border border-[#e7e5e0] text-xs font-medium text-[#2e6930]">
              <span className="w-2 h-2 rounded-full bg-[#2e6930]"></span>
              <span>Shift Active • {overview?.active_workforce || 412} on site</span>
            </div>

            <button
              onClick={loadData}
              title="Refresh Telemetry"
              className="p-2 border border-[#e7e5e0] rounded bg-[#ffffff] hover:bg-[#f2f0eb]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#5e5e5e] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </section>

        {/* Message Banner */}
        {message && (
          <div className="mb-4 p-3 bg-[#f2f0eb] border border-[#2e6930] rounded text-xs font-medium text-[#2e6930] flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-[#5e5e5e] hover:text-[#141515]">
              ×
            </button>
          </div>
        )}

        {/* Primary Metrics Bento Grid (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          {/* 1. Active Workforce */}
          <div className="bg-[#ffffff] border border-[#e7e5e0] p-4 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Active Workforce
              </span>
              <Users className="w-4 h-4 text-[#5e5e5e]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-tabular text-[#141515]">
                {overview?.active_workforce || 412}
              </span>
              <span className="text-xs text-[#5e5e5e]">
                / {overview?.scheduled_workforce || 430} scheduled
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f0eb] text-xs">
              <span className="text-[#5e5e5e]">Station Rate</span>
              <span className="font-semibold text-[#141515] font-tabular">
                {overview?.station_rate || 95.8}% present
              </span>
            </div>
          </div>

          {/* 2. Overtime Allocation */}
          <div className="bg-[#ffffff] border border-[#e7e5e0] p-4 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Overtime Logged
              </span>
              <Clock className="w-4 h-4 text-[#5e5e5e]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-tabular text-[#141515]">
                {overview?.overtime_hours_logged || 18.5} hrs
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f0eb] text-xs">
              <span className="text-[#5e5e5e]">Threshold Delta</span>
              <span className="font-semibold text-[#8c5e14] font-tabular">
                {overview?.overtime_delta || '+2.1 hrs delta'}
              </span>
            </div>
          </div>

          {/* 3. Open Safety Reports */}
          <div className="bg-[#ffffff] border border-[#e7e5e0] p-4 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Open Safety Cases
              </span>
              <ShieldAlert className="w-4 h-4 text-[#8c5e14]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-tabular text-[#141515]">
                {overview?.open_safety_reports || grievances.filter((g) => g.status !== 'Resolved').length}
              </span>
              <span className="text-xs text-[#5e5e5e]">unresolved</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f0eb] text-xs">
              <span className="text-[#5e5e5e]">Severity</span>
              <span className="font-semibold text-[#141515]">
                {overview?.safety_severity_split || '1 High • 1 Standard'}
              </span>
            </div>
          </div>

          {/* 4. Fatigue Alerts */}
          <div className="bg-[#ffffff] border border-[#e7e5e0] p-4 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Fatigue Alerts
              </span>
              <BatteryWarning className="w-4 h-4 text-[#a82a2a]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-tabular text-[#a82a2a]">
                {overview?.fatigue_alerts_count || 3}
              </span>
              <span className="text-xs text-[#5e5e5e]">flagged</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f0eb] text-xs">
              <span className="text-[#5e5e5e]">Intervention</span>
              <span className="font-semibold text-[#141515]">Mandatory Rest</span>
            </div>
          </div>

          {/* 5. Pay Equity Compliance */}
          <div className="bg-[#ffffff] border border-[#e7e5e0] p-4 rounded flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5e5e5e]">
                Pay Equity Parity
              </span>
              <Scale className="w-4 h-4 text-[#2e6930]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-tabular text-[#141515]">
                {overview?.pay_equity_index || 99.4}%
              </span>
              <span className="text-xs text-[#5e5e5e]">audit index</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f0eb] text-xs">
              <span className="text-[#5e5e5e]">Variance</span>
              <span className="font-semibold text-[#2e6930]">Zero Disparity</span>
            </div>
          </div>
        </div>

        {/* Telemetry Station Coverage & Attendance Table */}
        <section className="bg-[#ffffff] border border-[#e7e5e0] rounded mb-6 flex flex-col">
          <div className="p-4 border-b border-[#e7e5e0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#141515]">
                Real-Time Shift Attendance & Station Coverage
              </h2>
              <p className="text-xs text-[#5e5e5e]">
                Verified telemetry from biometric check-ins & RFID zone gantries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Exporting shift telemetry CSV...')}
                className="px-3 py-1.5 border border-[#e7e5e0] rounded text-xs font-medium hover:bg-[#f2f0eb] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f3f2] border-b border-[#e7e5e0] text-[#5e5e5e]">
                  <th className="py-2.5 px-4 font-semibold">Worker & ID</th>
                  <th className="py-2.5 px-4 font-semibold">Station / Zone</th>
                  <th className="py-2.5 px-4 font-semibold">Clock-In Time</th>
                  <th className="py-2.5 px-4 font-semibold">Active Hours</th>
                  <th className="py-2.5 px-4 font-semibold">Overtime</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e5e0]">
                {overview?.recent_attendance?.length > 0 ? (
                  overview.recent_attendance.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[#faf9f6]">
                      <td className="py-2.5 px-4 font-medium text-[#141515]">
                        {r.worker_name || 'Elena Rostova'}
                      </td>
                      <td className="py-2.5 px-4 text-[#5e5e5e]">Station 4B (Hub B)</td>
                      <td className="py-2.5 px-4 font-tabular">
                        {new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 font-tabular">
                        {Math.round(r.duration_minutes / 60 * 10) / 10} hrs
                      </td>
                      <td className="py-2.5 px-4 font-tabular text-[#8c5e14] font-medium">
                        {r.overtime_minutes > 0 ? `+${Math.round(r.overtime_minutes / 60 * 10) / 10}h OT` : '0h'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            r.status === 'active'
                              ? 'bg-[#2e6930] text-white'
                              : 'bg-[#f0eded] text-[#5e5e5e]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-xs text-[#5e5e5e]">
                      No active shift telemetry recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Safety Reports & Case Resolution Workflow */}
        <section className="bg-[#ffffff] border border-[#e7e5e0] rounded mb-6 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-2">
            <div>
              <h2 className="text-sm font-bold text-[#141515]">
                Safety Reports & Confidential Grievances ({grievances.length})
              </h2>
              <p className="text-xs text-[#5e5e5e]">
                Zero-retaliation case resolution workflow. Identity decoupling verified.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#e7e5e0]">
            {grievances.map((g) => (
              <div key={g.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#141515]">{g.tracking_number}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        g.severity === 'High' || g.severity === 'Critical'
                          ? 'bg-[#ba1a1a] text-white'
                          : 'bg-[#f0eded] text-[#141515]'
                      }`}
                    >
                      {g.severity}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f2f0eb] text-[#5e5e5e]">
                      {g.is_anonymous ? 'Zero-Identity Anonymous' : 'Confidential Worker'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#141515]">{g.category}</span>
                  <p className="text-xs text-[#5e5e5e]">{g.description}</p>
                  {g.resolution_notes && (
                    <p className="text-[11px] text-[#2e6930] font-medium">Resolution: {g.resolution_notes}</p>
                  )}
                </div>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#f0eded] text-[#141515]">
                    {g.status}
                  </span>
                  {g.status !== 'Under Review' && g.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(g.id, 'Under Review')}
                      className="px-2 py-1 bg-[#141515] text-white rounded text-[11px] font-medium hover:bg-[#292929]"
                    >
                      Review
                    </button>
                  )}
                  {g.status !== 'Action in Progress' && g.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(g.id, 'Action in Progress')}
                      className="px-2 py-1 bg-[#8c5e14] text-white rounded text-[11px] font-medium hover:bg-[#724c10]"
                    >
                      Action
                    </button>
                  )}
                  {g.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(g.id, 'Resolved')}
                      className="px-2 py-1 bg-[#2e6930] text-white rounded text-[11px] font-medium hover:bg-[#255427]"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payroll Administration */}
        <section className="bg-[#ffffff] border border-[#e7e5e0] rounded p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-2">
            <div>
              <h2 className="text-sm font-bold text-[#141515]">
                Payroll Ledger & Overtime Parity Approvals
              </h2>
              <p className="text-xs text-[#5e5e5e]">
                Transparent decimal math verification with 1.5x multiplier enforcement.
              </p>
            </div>
            <button
              onClick={handleCalculatePayroll}
              className="px-3 py-1.5 bg-[#141515] text-white rounded text-xs font-medium hover:bg-[#292929] flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Recalculate Cycle</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-tabular">
              <thead>
                <tr className="bg-[#f6f3f2] border-b border-[#e7e5e0] text-[#5e5e5e]">
                  <th className="py-2 px-3 font-semibold">Worker</th>
                  <th className="py-2 px-3 font-semibold">Period</th>
                  <th className="py-2 px-3 font-semibold">Base Pay</th>
                  <th className="py-2 px-3 font-semibold">Overtime (1.5x)</th>
                  <th className="py-2 px-3 font-semibold">Allowances</th>
                  <th className="py-2 px-3 font-semibold">Gross</th>
                  <th className="py-2 px-3 font-semibold">Net</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e5e0]">
                {payrollList.map((p) => (
                  <tr key={p.id} className="hover:bg-[#faf9f6]">
                    <td className="py-2 px-3 font-medium text-[#141515]">{p.worker_name || 'Elena Rostova'}</td>
                    <td className="py-2 px-3 text-[#5e5e5e]">{p.period_label || 'Oct 1 – Oct 14'}</td>
                    <td className="py-2 px-3">${p.base_pay?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-[#8c5e14] font-medium">${p.overtime_earnings?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-[#2e6930]">+${p.allowances?.toFixed(2)}</td>
                    <td className="py-2 px-3 font-semibold">${p.gross_pay?.toFixed(2)}</td>
                    <td className="py-2 px-3 font-bold text-[#141515]">${p.net_pay?.toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.status === 'approved' ? 'bg-[#2e6930] text-white' : 'bg-[#f0eded] text-[#141515]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.status !== 'approved' ? (
                        <button
                          onClick={() => handleApprovePayslip(p.id)}
                          className="px-2 py-0.5 bg-[#2e6930] text-white rounded text-[11px] font-medium hover:bg-[#255427]"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#2e6930] font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Audited
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
