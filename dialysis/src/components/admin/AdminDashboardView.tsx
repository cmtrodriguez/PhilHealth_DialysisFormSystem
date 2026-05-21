import { Users, FileClock, Landmark, AlertTriangle, TrendingUp, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import type { PDDRegistration, DialysisSession, Nephrologist } from '../../types';

interface AdminDashboardViewProps {
  registrations: PDDRegistration[];
  sessions: DialysisSession[];
  doctors: Nephrologist[];
  onNavigateToView: (view: string) => void;
  onUpdateSessionStatus: (id: string, status: 'unsubmitted' | 'submitted' | 'approved' | 'denied' | 'rth', rthReason?: string) => void;
}

export default function AdminDashboardView({
  registrations,
  sessions,
  doctors,
  onNavigateToView,
  onUpdateSessionStatus,
}: AdminDashboardViewProps) {
  const activePatientsCount = registrations.filter((r) => r.recordStatus === 'Active').length;
  const pendingApprovalsCount = registrations.filter((r) => r.recordStatus === 'Pending').length;
  
  // Financial computations (₱6,350 per session)
  const totalClaimsCount = sessions.length;
  const totalClaimsAmount = totalClaimsCount * 6350;
  
  const reimbursedClaimsCount = sessions.filter((s) => s.claimStatus === 'approved').length;
  const reimbursedAmount = reimbursedClaimsCount * 6350;

  const pendingClaimsCount = sessions.filter((s) => s.claimStatus === 'submitted').length;
  const pendingAmount = pendingClaimsCount * 6350;

  const rthClaims = sessions.filter((s) => s.claimStatus === 'rth');
  const rthAmount = rthClaims.length * 6350;

  const getPatientName = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    return reg ? `${reg.patientName.first} ${reg.patientName.last}` : 'Unknown Patient';
  };

  const getDoctorName = (docId: string) => {
    const doc = doctors.find((d) => d.id === docId);
    return doc ? `Dr. ${doc.first} ${doc.last}` : 'Unknown Nephrologist';
  };

  return (
    <div className="space-y-6">
      {/* HEADER WIDGET */}
      <div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clinical & Financial Overview</h3>
        <p className="text-slate-500 text-sm mt-1">
          HCI Portal Dashboard for accrediting dialysis patient registries, monitoring sessions, and tracking claims.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Patients */}
        <div 
          onClick={() => onNavigateToView('registry')}
          className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Patients</span>
            <h4 className="text-3xl font-black text-slate-800">{activePatientsCount}</h4>
            <p className="text-xs text-slate-400 font-semibold">Total registered in clinic</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => onNavigateToView('pdd-queue')}
          className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-black">Pending Registry</span>
            <h4 className="text-3xl font-black text-slate-800">{pendingApprovalsCount}</h4>
            <p className={`text-xs font-semibold ${pendingApprovalsCount > 0 ? 'text-yellow-600 font-extrabold animate-pulse' : 'text-slate-400'}`}>
              {pendingApprovalsCount > 0 ? 'Action required' : 'Queue is clear'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
            pendingApprovalsCount > 0 
              ? 'bg-yellow-50 border-yellow-100 text-yellow-600 animate-pulse' 
              : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <FileClock size={22} />
          </div>
        </div>

        {/* Transmitted Claims */}
        <div 
          onClick={() => onNavigateToView('session-tracker')}
          className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reimbursed Claims</span>
            <h4 className="text-xl font-black text-emerald-700">
              ₱{reimbursedAmount.toLocaleString('en-US')}
            </h4>
            <p className="text-xs text-slate-400 font-semibold">{reimbursedClaimsCount} sessions settled</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
            <Landmark size={22} />
          </div>
        </div>

        {/* RTH Claims */}
        <div 
          onClick={() => onNavigateToView('session-tracker')}
          className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">RTH Claims (Errors)</span>
            <h4 className={`text-xl font-black ${rthClaims.length > 0 ? 'text-yellow-600 animate-pulse' : 'text-slate-800'}`}>
              ₱{rthAmount.toLocaleString('en-US')}
            </h4>
            <p className="text-xs text-slate-400 font-semibold">{rthClaims.length} sessions rejected</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
            rthClaims.length > 0 
              ? 'bg-yellow-50 border-yellow-100 text-yellow-600 animate-pulse' 
              : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FINANCIAL REIMBURSEMENT ANALYTICS */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col justify-between space-y-6 lg:col-span-1">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base leading-tight">Claims Allocation Breakdown</h4>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Distribution of ₱6,350 PhilHealth session package reimbursements</p>
          </div>

          <div className="space-y-4">
            {/* Approved Claims */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-500" /> Settled Rebursements</span>
                <span className="font-black text-slate-800">₱{reimbursedAmount.toLocaleString()} ({reimbursedClaimsCount})</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${totalClaimsAmount > 0 ? (reimbursedAmount / totalClaimsAmount) * 100 : 0}%` }} 
                />
              </div>
            </div>

            {/* Pending Claims */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><RefreshCw size={12} className="text-blue-500" /> In-Process / Submitted</span>
                <span className="font-black text-slate-800">₱{pendingAmount.toLocaleString()} ({pendingClaimsCount})</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all" 
                  style={{ width: `${totalClaimsAmount > 0 ? (pendingAmount / totalClaimsAmount) * 100 : 0}%` }} 
                />
              </div>
            </div>

            {/* RTH Claims */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><AlertTriangle size={12} className="text-yellow-500" /> Return-To-Hospital</span>
                <span className="font-black text-slate-800">₱{rthAmount.toLocaleString()} ({rthClaims.length})</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all" 
                  style={{ width: `${totalClaimsAmount > 0 ? (rthAmount / totalClaimsAmount) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-center justify-between text-xs font-extrabold text-emerald-950">
            <span className="inline-flex items-center gap-1"><TrendingUp size={16} className="text-emerald-700" /> Total Active Ledger:</span>
            <span className="font-black text-emerald-800 text-sm">₱{totalClaimsAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* RETURN-TO-HOSPITAL (RTH) CLAIM MENDING BOARD */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base leading-tight">Return-To-Hospital Claims Board</h4>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Immediate attention required: mend error details and re-transmit claims within 60 days.</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
            {rthClaims.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <CheckCircle size={32} className="text-emerald-600 mb-2" />
                <p className="font-extrabold text-slate-700 text-xs">No Outstanding Rejected Claims</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Claims database complies with PhilHealth rules.</p>
              </div>
            ) : (
              rthClaims.map((session) => (
                <div 
                  key={session.id} 
                  className="p-4 bg-yellow-50/30 border border-yellow-200/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 truncate">
                        {getPatientName(session.registrationId)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-yellow-50 text-emerald-950 border border-yellow-200 shrink-0">
                        RTH Claim
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      Session: {new Date(session.sessionDate).toLocaleDateString()} | Attending: {getDoctorName(session.attendingNephrologistId)}
                    </div>
                    <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-xl text-[10px] font-bold text-yellow-700 flex items-start gap-1">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                      <span>RTH Reason: "{session.rthReason || 'Claims details mismatch'}"</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Resolving Claim details for ${getPatientName(session.registrationId)}:\n- Verifying Member ZIP matching\n- Mending mismatch\n- Re-transmitting ₱6,350 claim to regional LHIO...`);
                      onUpdateSessionStatus(session.id, 'submitted');
                    }}
                    className="self-end sm:self-center bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black px-3.5 py-2.5 rounded-xl text-[10px] active:scale-95 transition-all shadow shrink-0"
                  >
                    Mend & Re-transmit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
