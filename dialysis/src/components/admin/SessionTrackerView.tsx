import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Search, Calendar, Landmark, AlertTriangle, CheckCircle, Clock, X, HelpCircle } from 'lucide-react';
import type { DialysisSession, PDDRegistration, Nephrologist, DialysisSessionClaimStatus } from '../../types';

interface SessionTrackerViewProps {
  sessions: DialysisSession[];
  registrations: PDDRegistration[];
  doctors: Nephrologist[];
  onLogSession: (session: DialysisSession) => void;
  onUpdateSessionStatus: (id: string, status: DialysisSessionClaimStatus, rthReason?: string) => void;
}

export default function SessionTrackerView({
  sessions,
  registrations,
  doctors,
  onLogSession,
  onUpdateSessionStatus,
}: SessionTrackerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    registrationId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    attendingNephrologistId: '',
    machineNo: '',
  });

  const activeRegistrations = registrations.filter(r => r.recordStatus === 'Active');
  const activeDoctors = doctors.filter(d => d.isActive);

  // Compute session usage counts per patient
  const getSessionCounts = (regId: string) => {
    const total = sessions.filter((s) => s.registrationId === regId).length;
    const approved = sessions.filter((s) => s.registrationId === regId && s.claimStatus === 'approved').length;
    const pending = sessions.filter((s) => s.registrationId === regId && ['submitted', 'rth'].includes(s.claimStatus)).length;
    return { total, approved, pending, remaining: Math.max(0, 156 - total) };
  };

  const getStatusColor = (status: DialysisSessionClaimStatus) => {
    const colors = {
      unsubmitted: 'bg-slate-100 text-slate-600 border-slate-200',
      submitted: 'bg-blue-50 text-blue-700 border-blue-100',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      denied: 'bg-red-50 text-red-700 border-red-100',
      rth: 'bg-yellow-50 text-emerald-950 border-yellow-200 animate-pulse',
    };
    return colors[status];
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.registrationId || !newSession.attendingNephrologistId || !newSession.machineNo) {
      alert('Please fill out all fields.');
      return;
    }

    const sessionObj: DialysisSession = {
      id: `session_${Date.now()}`,
      registrationId: newSession.registrationId,
      sessionDate: newSession.sessionDate,
      attendingNephrologistId: newSession.attendingNephrologistId,
      machineNo: newSession.machineNo,
      claimStatus: 'unsubmitted',
      amountClaimed: 6350, // PH Dialysis flat package reimbursement rate
      createdAt: new Date().toISOString(),
    };

    onLogSession(sessionObj);
    setNewSession({
      registrationId: '',
      sessionDate: new Date().toISOString().split('T')[0],
      attendingNephrologistId: '',
      machineNo: '',
    });
    setIsLogDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">156 Session Tracker & Ledger</h3>
          <p className="text-slate-500 text-sm mt-1">
            Log dialysis treatments, verify annual 156 session balances, and manage PhilHealth ₱6,350 claim statuses.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeRegistrations.length === 0) {
              alert('Enroll at least one active patient in the database first.');
              return;
            }
            if (activeDoctors.length === 0) {
              alert('Enroll at least one accredited nephrologist first.');
              return;
            }
            setIsLogDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-center"
        >
          <PlusCircle size={18} />
          Log Dialysis Treatment
        </button>
      </div>

      {/* SESSION CRITICAL COUNTERS FOR PATIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeRegistrations.slice(0, 3).map((reg) => {
          const stats = getSessionCounts(reg.id);
          const percent = Math.min(100, (stats.total / 156) * 100);

          let barColor = 'bg-emerald-500';
          let ringColor = 'border-emerald-500/20 text-emerald-700';
          if (stats.total >= 140) {
            barColor = 'bg-red-500';
            ringColor = 'border-red-500/20 text-red-600 bg-red-50/50';
          } else if (stats.total >= 120) {
            barColor = 'bg-yellow-500';
            ringColor = 'border-yellow-500/20 text-yellow-700 bg-yellow-50/50';
          }

          return (
            <div key={reg.id} className="bg-white rounded-3xl p-5 border border-slate-200/50 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Annual Allocation</p>
                <h4 className="font-extrabold text-slate-800 text-sm truncate">
                  {reg.patientName.first} {reg.patientName.last}
                </h4>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>PIN: {reg.pin}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>{stats.total} Logged</span>
                    <span>156 Max</span>
                  </div>
                </div>
              </div>

              <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${ringColor}`}>
                <span className="font-black text-base leading-none">{stats.remaining}</span>
                <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Left</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND CLAIMS JOURNAL */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Landmark size={20} className="text-emerald-700 shrink-0" />
            <h4 className="font-black text-slate-800 text-base">Reimbursement Claims Ledger</h4>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 max-w-md w-full">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter claims by Patient or Doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none text-xs placeholder-slate-400 font-medium text-slate-700 bg-transparent"
            />
          </div>
        </div>

        {/* CLAIMS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Patient Name & PIN</th>
                <th className="p-4">Session Date</th>
                <th className="p-4">Machine & Attending Physician</th>
                <th className="p-4">Claim Rate</th>
                <th className="p-4 text-center">Reimbursement Status</th>
                <th className="p-4 pr-6 text-right">Claims Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sessions.filter(s => {
                const patient = registrations.find(r => r.id === s.registrationId);
                const doctor = doctors.find(d => d.id === s.attendingNephrologistId);
                const pName = patient ? `${patient.patientName.first} ${patient.patientName.last}` : '';
                const dName = doctor ? `${doctor.first} ${doctor.last}` : '';
                return `${pName} ${dName} ${s.machineNo}`.toLowerCase().includes(searchTerm.toLowerCase());
              }).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Calendar className="mx-auto text-slate-300 mb-3" size={28} />
                    <p className="font-bold text-sm">No Dialysis Treatments Recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Log Dialysis Treatment" to file your clinic's first session.</p>
                  </td>
                </tr>
              ) : (
                sessions.filter(s => {
                  const patient = registrations.find(r => r.id === s.registrationId);
                  const doctor = doctors.find(d => d.id === s.attendingNephrologistId);
                  const pName = patient ? `${patient.patientName.first} ${patient.patientName.last}` : '';
                  const dName = doctor ? `${doctor.first} ${doctor.last}` : '';
                  return `${pName} ${dName} ${s.machineNo}`.toLowerCase().includes(searchTerm.toLowerCase());
                }).map((session) => {
                  const patient = registrations.find(r => r.id === session.registrationId);
                  const doctor = doctors.find(d => d.id === session.attendingNephrologistId);

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-slate-800">
                          {patient ? `${patient.patientName.first} ${patient.patientName.last}` : 'Unknown Patient'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          PIN: {patient ? patient.pin : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/50 text-[10px] font-bold text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(session.sessionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-800">
                          Dr. {doctor ? `${doctor.first} ${doctor.last}` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Station Machine: #{session.machineNo}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-emerald-700">
                        ₱{session.amountClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(session.claimStatus)}`}>
                          {session.claimStatus === 'approved' && <CheckCircle size={10} />}
                          {session.claimStatus === 'submitted' && <Clock size={10} />}
                          {session.claimStatus === 'rth' && <AlertTriangle size={10} />}
                          {session.claimStatus}
                        </span>
                        {session.claimStatus === 'rth' && session.rthReason && (
                          <p className="text-[9px] text-yellow-700 mt-1 font-bold italic max-w-[150px] mx-auto truncate" title={session.rthReason}>
                            "{session.rthReason}"
                          </p>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        {session.claimStatus === 'unsubmitted' && (
                          <button
                            onClick={() => onUpdateSessionStatus(session.id, 'submitted')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-3 py-1.5 rounded-xl hover:shadow active:scale-95 transition-all text-[10px]"
                          >
                            Transmit Claim
                          </button>
                        )}

                        {session.claimStatus === 'submitted' && (
                          <>
                            <button
                              onClick={() => onUpdateSessionStatus(session.id, 'approved')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black px-2 py-1 rounded-lg text-[9px] active:scale-95 transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter Return-To-Hospital (RTH) Error Reason:');
                                if (reason) onUpdateSessionStatus(session.id, 'rth', reason);
                              }}
                              className="bg-yellow-50 hover:bg-yellow-100 text-emerald-950 border border-yellow-200 font-black px-2 py-1 rounded-lg text-[9px] active:scale-95 transition-all"
                            >
                              RTH Alert
                            </button>
                          </>
                        )}

                        {session.claimStatus === 'rth' && (
                          <button
                            onClick={() => {
                              alert(`Mend/Resolve Process:\nEncoder correcting ZIP/PIN details for PhilHealth matching.\nRe-transmitting claim...`);
                              onUpdateSessionStatus(session.id, 'submitted');
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all text-[10px]"
                          >
                            Mend & Re-transmit
                          </button>
                        )}

                        {['approved', 'denied'].includes(session.claimStatus) && (
                          <span className="text-[10px] text-slate-400 font-bold italic">Claim Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG DIALYSIS SESSION DRAWER */}
      <AnimatePresence>
        {isLogDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200/50 w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Log Dialysis Session</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">PhilHealth Claims Department</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogDrawerOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleLogSubmit} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Select Active Patient *
                  </label>
                  <select
                    required
                    value={newSession.registrationId}
                    onChange={(e) => setNewSession({ ...newSession, registrationId: e.target.value })}
                    className="mt-2 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                  >
                    <option value="">-- Choose Patient --</option>
                    {activeRegistrations.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.patientName.last}, {reg.patientName.first} ({reg.pin})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Treatment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSession.sessionDate}
                      onChange={(e) => setNewSession({ ...newSession, sessionDate: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Dialysis Machine ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08"
                      value={newSession.machineNo}
                      onChange={(e) => setNewSession({ ...newSession, machineNo: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Attending Physician *
                  </label>
                  <select
                    required
                    value={newSession.attendingNephrologistId}
                    onChange={(e) => setNewSession({ ...newSession, attendingNephrologistId: e.target.value })}
                    className="mt-2 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {activeDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.first} {doc.last} (PAN: {doc.panNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-emerald-50 border border-emerald-200/50 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-900">PhilHealth Reimbursement Claim Rate</span>
                      <p className="text-[10px] text-emerald-600 font-medium">Standardized dialysis benefit package coverage</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-800 text-sm">₱6,350.00</span>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogDrawerOpen(false)}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-95"
                  >
                    Save & Record Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
