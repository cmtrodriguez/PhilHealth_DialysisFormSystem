import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FileHeart,
  CalendarRange,
  Award,
  LogOut,
  Hospital,
  Database,
  RefreshCw,
  Stethoscope,
  Activity,
  PenTool,
  CheckCircle2,
  ShieldCheck,
  Download,
  Eye,
  Heart,
  Save
} from 'lucide-react';

import AdminDashboardView from './admin/AdminDashboardView';
import PatientRegistryView from './admin/PatientRegistryView';
import PddValidationQueueView from './admin/PddValidationQueueView';
import SessionTrackerView from './admin/SessionTrackerView';
import DoctorsDirectoryView from './admin/DoctorsDirectoryView';

import type { PDDRegistration, DialysisSession, Nephrologist, DialysisSessionClaimStatus } from '../types';

interface AdminPortalProps {
  role: 'admin_encoder' | 'doctor';
  registrations: PDDRegistration[];
  sessions: DialysisSession[];
  doctors: Nephrologist[];
  onAddDoctor: (doc: Nephrologist) => void;
  onUpdateDoctor: (doc: Nephrologist) => void;
  onDeleteDoctor: (id: string) => void;
  onLogSession: (session: DialysisSession) => void;
  onUpdateSessionStatus: (id: string, status: DialysisSessionClaimStatus, rthReason?: string) => void;
  onDeletePatient: (id: string) => void;
  onAddPatient: (reg: PDDRegistration) => void;
  onApproveRegistration: (id: string, updatedReg: PDDRegistration) => void;
  onRejectRegistration: (id: string) => void;
  onResetDemoData: () => void;
  onSeedDemoData: () => void;
  isSupabaseConnected: boolean;
  onLogout: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
  tourActive?: boolean;
}

export default function AdminPortal({
  role,
  registrations,
  sessions,
  doctors,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onLogSession,
  onUpdateSessionStatus,
  onDeletePatient,
  onAddPatient,
  onApproveRegistration,
  onRejectRegistration,
  onResetDemoData,
  onSeedDemoData,
  isSupabaseConnected,
  onLogout,
  activeView: propsActiveView,
  onViewChange: propsOnViewChange,
  tourActive,
}: AdminPortalProps) {
  // Dr. Perez is seeded as doc_1
  const activeDoctorId = 'doc_1';
  const activeDoctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0] || {
    id: activeDoctorId,
    first: 'Edgardo',
    last: 'Perez',
    prcLicenseNo: '0098765',
    panNo: '99-012345678-0',
    email: 'edgardo.perez@hospital.gov.ph',
    isActive: true,
    signatureUrl: 'https://raw.githubusercontent.com/user-attachments/assets/5e0034a7-8025-4cde-a178-65363e77f000'
  };

  const [localActiveView, setLocalActiveView] = useState(() => role === 'doctor' ? 'doctor-patients' : 'dashboard');
  const activeView = propsActiveView !== undefined ? propsActiveView : localActiveView;
  const setActiveView = propsOnViewChange !== undefined ? propsOnViewChange : setLocalActiveView;
  
  // Custom states for Doctor clinical sheets
  const [selectedRosterPatient, setSelectedRosterPatient] = useState<PDDRegistration | null>(null);
  const [prescriptions, setPrescriptions] = useState<Record<string, { dryWeight: number; targetUF: number; accessSite: string; freq: string }>>({
    reg_1: { dryWeight: 68, targetUF: 2.5, accessSite: 'AV Fistula', freq: '3x / week' },
    reg_3: { dryWeight: 54, targetUF: 1.8, accessSite: 'AV Fistula', freq: '2x / week' }
  });

  const [docPrc, setDocPrc] = useState(activeDoctor.prcLicenseNo);
  const [docPan, setDocPan] = useState(activeDoctor.panNo);
  const [docEmail, setDocEmail] = useState(activeDoctor.email);
  const [signatureStamp, setSignatureStamp] = useState(activeDoctor.signatureUrl);

  const handleSaveDocProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDoctor({
      ...activeDoctor,
      prcLicenseNo: docPrc,
      panNo: docPan,
      email: docEmail,
      signatureUrl: signatureStamp
    });
    alert('PRC Clinical Stamp and Accreditation profile updated successfully in the facility registry.');
  };

  const handleUpdateClinicalPrescription = (patientId: string, dryWeight: number, targetUF: number, accessSite: string, freq: string) => {
    setPrescriptions((prev) => ({
      ...prev,
      [patientId]: { dryWeight, targetUF, accessSite, freq }
    }));
    alert('Dialysis Prescription specs updated successfully.');
  };

  // Define two sets of navigation links based on Role
  const encoderMenuItems = [
    { id: 'dashboard', name: 'Clinical & Financial Dashboard', icon: LayoutDashboard },
    { id: 'registry', name: 'Patient Registry Directory', icon: Users },
    { id: 'pdd-queue', name: 'PDD Validation Queue', icon: FileHeart, badge: registrations.filter(r => r.recordStatus === 'Pending').length },
    { id: 'session-tracker', name: '156 Session Tracker', icon: CalendarRange },
    { id: 'doctors', name: 'Accredited Doctors Directory', icon: Award },
  ];

  const doctorMenuItems = [
    { id: 'doctor-patients', name: 'My Patient Roster', icon: Users },
    { id: 'doctor-sessions', name: 'Prescriptions & treatment log', icon: CalendarRange },
    { id: 'doctor-profile', name: 'PRC Stamp & signature', icon: Award },
  ];

  const menuItems = role === 'doctor' ? doctorMenuItems : encoderMenuItems;

  const renderActiveView = () => {
    switch (activeView) {
      // ENCODER VIEWS
      case 'dashboard':
        return (
          <AdminDashboardView
            registrations={registrations}
            sessions={sessions}
            doctors={doctors}
            onNavigateToView={(view) => setActiveView(view)}
            onUpdateSessionStatus={onUpdateSessionStatus}
          />
        );
      case 'registry':
        return (
          <PatientRegistryView
            registrations={registrations}
            sessions={sessions}
            doctors={doctors}
            onDeletePatient={onDeletePatient}
            onAddPatient={onAddPatient}
          />
        );
      case 'pdd-queue':
        return (
          <PddValidationQueueView
            registrations={registrations}
            doctors={doctors}
            onApproveRegistration={onApproveRegistration}
            onRejectRegistration={onRejectRegistration}
          />
        );
      case 'session-tracker':
        return (
          <SessionTrackerView
            sessions={sessions}
            registrations={registrations}
            doctors={doctors}
            onLogSession={onLogSession}
            onUpdateSessionStatus={onUpdateSessionStatus}
          />
        );
      case 'doctors':
        return (
          <DoctorsDirectoryView
            doctors={doctors}
            onAddDoctor={onAddDoctor}
            onUpdateDoctor={onUpdateDoctor}
            onDeleteDoctor={onDeleteDoctor}
          />
        );

      // CLINICAL ATTENDING DOCTOR VIEWS
      case 'doctor-patients': {
        const activeRegs = registrations.filter((r) => r.recordStatus === 'Active');
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Assigned Dialysis Patients</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Clinical chart summaries, Z-Benefits registry tracks, and Attending Physician Hemodialysis prescriptions.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 shrink-0">
                <Stethoscope className="text-emerald-700" size={24} />
                <div className="text-xs">
                  <p className="font-extrabold text-emerald-950">Attending Nephrologist</p>
                  <p className="font-bold text-emerald-700">Dr. {activeDoctor.first} {activeDoctor.last}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="p-4 pl-6">Patient Name</th>
                      <th className="p-4">PhilHealth PIN</th>
                      <th className="p-4">HD Flux / PD System</th>
                      <th className="p-4">Remaining Sessions</th>
                      <th className="p-4">Clinical Specs</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {activeRegs.map((reg) => {
                      const spec = prescriptions[reg.id] || { dryWeight: 65, targetUF: 2.0, accessSite: 'AV Fistula', freq: '3x / week' };
                      const count = sessions.filter(s => s.registrationId === reg.id).length;
                      const remaining = Math.max(0, 156 - count);

                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-extrabold text-slate-800">{reg.patientName.last}, {reg.patientName.first}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{reg.dob} | {reg.sex}</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-600">{reg.pin}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-800">{reg.hdDetails?.type ? `HD (${reg.hdDetails.type})` : 'PD'}</span>
                          </td>
                          <td className="p-4">
                            <span className={`font-black ${remaining < 15 ? 'text-red-600' : 'text-emerald-700'}`}>{remaining} / 156 left</span>
                          </td>
                          <td className="p-4">
                            <div className="text-[10px] text-slate-500 font-semibold">
                              Prescription: {spec.freq} | Site: {spec.accessSite}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              Dry Wt: {spec.dryWeight}kg | Target UF: {spec.targetUF}L
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => setSelectedRosterPatient(reg)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-xl text-[10px] border border-emerald-100 transition-all active:scale-95"
                            >
                              Edit Clinical Specs
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLINICAL PRESCRIPTION MODAL */}
            <AnimatePresence>
              {selectedRosterPatient && (() => {
                const spec = prescriptions[selectedRosterPatient.id] || { dryWeight: 65, targetUF: 2.0, accessSite: 'AV Fistula', freq: '3x / week' };
                return (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-[2rem] border border-slate-200/50 w-full max-w-md overflow-hidden shadow-2xl"
                    >
                      <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={18} className="text-yellow-400 animate-pulse" />
                          <h3 className="font-extrabold text-sm uppercase tracking-wider">Dialysis Clinical Prescription</h3>
                        </div>
                        <button
                          onClick={() => setSelectedRosterPatient(null)}
                          className="text-slate-400 hover:text-white font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                          Patient Name: {selectedRosterPatient.patientName.last}, {selectedRosterPatient.patientName.first}
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const dryWeight = parseFloat((form.elements.namedItem('dryWeight') as HTMLInputElement).value);
                            const targetUF = parseFloat((form.elements.namedItem('targetUF') as HTMLInputElement).value);
                            const accessSite = (form.elements.namedItem('accessSite') as HTMLSelectElement).value;
                            const freq = (form.elements.namedItem('freq') as HTMLSelectElement).value;
                            handleUpdateClinicalPrescription(selectedRosterPatient.id, dryWeight, targetUF, accessSite, freq);
                            setSelectedRosterPatient(null);
                          }}
                          className="space-y-4 text-xs font-bold text-slate-600"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Dry Weight (kg)</label>
                              <input
                                name="dryWeight"
                                type="number"
                                step="0.1"
                                defaultValue={spec.dryWeight}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Target UF (Liters)</label>
                              <input
                                name="targetUF"
                                type="number"
                                step="0.1"
                                defaultValue={spec.targetUF}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Vascular Access Site</label>
                              <select
                                name="accessSite"
                                defaultValue={spec.accessSite}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                              >
                                <option value="AV Fistula">AV Fistula</option>
                                <option value="Right IJ Cath">Right IJ Cath</option>
                                <option value="Left IJ Cath">Left IJ Cath</option>
                                <option value="Femoral Cath">Femoral Cath</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Treatment Frequency</label>
                              <select
                                name="freq"
                                defaultValue={spec.freq}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                              >
                                <option value="2x / week">2x / week</option>
                                <option value="3x / week">3x / week</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedRosterPatient(null)}
                              className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                            >
                              Save Prescription
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>
          </div>
        );
      }

      case 'doctor-sessions': {
        // Filter dialysis sessions assigned to this specific doctor
        const docSessions = sessions.filter((s) => s.attendingNephrologistId === activeDoctorId);
        
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Prescriptions & Clinical Treatment Log</h3>
              <p className="text-slate-500 text-sm mt-1">
                Verify logged hemodialysis treatments and medically sign off claims for PhilHealth Z-Benefits reimbursements.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="p-4 pl-6">Session Date</th>
                      <th className="p-4">Patient Profile</th>
                      <th className="p-4">Machine No</th>
                      <th className="p-4">Claim Coverage</th>
                      <th className="p-4">Sign-Off Status</th>
                      <th className="p-4 pr-6 text-right">Attending Stamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {docSessions.map((session) => {
                      const patient = registrations.find(r => r.id === session.registrationId);
                      return (
                        <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold">{session.sessionDate}</td>
                          <td className="p-4">
                            <div className="font-extrabold text-slate-800">
                              {patient ? `${patient.patientName.last}, ${patient.patientName.first}` : 'Unknown Patient'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              PIN: {patient?.pin || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-600">M-{session.machineNo}</td>
                          <td className="p-4 font-extrabold text-emerald-800">₱{session.amountClaimed.toLocaleString()}.00</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              session.claimStatus === 'approved'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : session.claimStatus === 'rth'
                                ? 'bg-red-50 border-red-100 text-red-600'
                                : 'bg-yellow-50 border-yellow-100 text-emerald-950'
                            }`}>
                              {session.claimStatus === 'approved' ? 'Signed Off' : session.claimStatus}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {session.claimStatus !== 'approved' && session.claimStatus !== 'submitted' ? (
                              <button
                                onClick={() => {
                                  onUpdateSessionStatus(session.id, 'approved');
                                  alert('Treatment session signed off under attending PRC stamp.');
                                }}
                                className="bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-100 font-black px-2.5 py-1.5 rounded-xl text-[10px] transition-all active:scale-95"
                              >
                                Sign-off Case
                              </button>
                            ) : (
                              <span className="text-slate-400 font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                Medically Certified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case 'doctor-profile': {
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Accreditation Stamp & Credentials</h3>
              <p className="text-slate-500 text-sm mt-1">
                Attending Physician specialty validation settings, PRC License numbers, and digital stamp credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Credentials Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm md:col-span-2 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <ShieldCheck className="text-emerald-700" size={24} />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Specialist Registry Verification</h4>
                    <p className="text-[10px] uppercase font-black text-slate-400">Attending Physician Certification</p>
                  </div>
                </div>

                <form onSubmit={handleSaveDocProfile} className="space-y-4 text-xs font-bold text-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">PRC License Number *</label>
                      <input
                        type="text"
                        required
                        value={docPrc}
                        onChange={(e) => setDocPrc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">PhilHealth Accreditation No (PAN) *</label>
                      <input
                        type="text"
                        required
                        value={docPan}
                        onChange={(e) => setDocPan(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Hospital Email *</label>
                    <input
                      type="email"
                      required
                      value={docEmail}
                      onChange={(e) => setDocEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Digital Signature Stamp (Data URL / Image Link)</label>
                    <input
                      type="text"
                      value={signatureStamp}
                      onChange={(e) => setSignatureStamp(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-slate-700 font-mono text-[10px]"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95"
                    >
                      <Save size={16} />
                      Save Credentials
                    </button>
                  </div>
                </form>
              </div>

              {/* Stamp Card Visual */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-850 text-white p-6 rounded-3xl border border-emerald-900 shadow-xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
                      <Stethoscope size={24} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-800 text-emerald-200 border border-emerald-700">
                      Accredited
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight leading-tight">Dr. {activeDoctor.first} {activeDoctor.last}</h4>
                    <p className="text-[9px] uppercase font-bold text-yellow-400 tracking-wider">Dialysis Specialty Nephrologist</p>
                  </div>

                  <div className="border-t border-emerald-800/60 pt-4 space-y-2 text-[10px] text-emerald-200">
                    <div className="flex justify-between">
                      <span>PRC License No:</span>
                      <span className="font-mono text-white font-bold">{docPrc || 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accreditation No:</span>
                      <span className="font-mono text-white font-bold">{docPan || 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clinical Status:</span>
                      <span className="text-yellow-400 font-bold">Active attending</span>
                    </div>
                  </div>
                </div>

                {/* Digital Stamp Signature Preview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Registered Digital Stamp</span>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-center min-h-[100px] overflow-hidden">
                    {signatureStamp ? (
                      <img src={signatureStamp} alt="Doctor Digital Signature Stamp" className="max-h-20 object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-slate-400 text-xs">No Stamp Registered</span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                    This signature stamp will be programmatically overlaid on top of the PhilHealth PDD registration forms when validated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased selection:bg-emerald-500/20 ${tourActive ? 'pt-20' : ''}`}>
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-80 bg-emerald-950 text-white flex flex-col justify-between p-6 shrink-0 border-r border-emerald-900 shadow-2xl relative z-20">
        <div className="space-y-8">
          {/* Institution Brand */}
          <div className="flex items-center gap-3 bg-emerald-900/40 p-4 rounded-3xl border border-emerald-800/30">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black">
              {role === 'doctor' ? <Stethoscope size={20} /> : <Hospital size={20} />}
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-tight text-white">St. Jude Renal Center</h1>
              <p className="text-[9px] uppercase font-black text-yellow-400 tracking-wider mt-0.5">
                {role === 'doctor' ? 'Nephrologist Portal' : 'PhilHealth HCI Portal'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item: any) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between font-bold text-xs tracking-wider active:scale-[0.98] ${
                    isActive
                      ? 'bg-yellow-400 text-emerald-950 shadow-lg'
                      : 'text-slate-300 hover:bg-emerald-900/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-emerald-950' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </div>

                  {Boolean(item.badge) && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${
                      isActive ? 'bg-emerald-950 text-yellow-400' : 'bg-yellow-400 text-emerald-950'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-6 border-t border-emerald-900/60">
          {/* Connection Status Flag */}
          <div className="p-3 bg-emerald-900/30 rounded-2xl border border-emerald-800/20 text-[10px] space-y-1.5 font-bold text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database size={12} className={isSupabaseConnected ? 'text-emerald-400' : 'text-yellow-400'} />
                {isSupabaseConnected ? 'Supabase Live' : 'Offline Sandbox'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 shadow-emerald-400 shadow' : 'bg-yellow-400 shadow-yellow-400 shadow'}`} />
            </div>
            <p className="text-[8px] font-medium leading-relaxed opacity-70">
              {isSupabaseConnected 
                ? 'Clinical records are fully synchronized with remote Supabase cloud tables.' 
                : 'Running inside high-fidelity local database. Use Database controller to seed.'}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-900/40 hover:bg-red-950/20 border border-emerald-800/30 hover:border-red-900/30 text-slate-300 hover:text-red-400 font-extrabold text-xs tracking-widest uppercase py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* TOP STATUS BAR ACCENTS */}
        <header className="bg-white border-b border-slate-200/50 p-5 px-8 shrink-0 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
            <span className="font-extrabold text-xs tracking-wider text-slate-500 uppercase">
              {role === 'doctor' ? 'Clinical Specialty Workspace (CSW) Active' : 'Hospital Clinical Database (HCD) Active'}
            </span>
          </div>

          {/* Database sandbox seeding button controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onSeedDemoData}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
              title="Add high-fidelity mock patients, logs, and doctors to local storage database"
            >
              <Database size={12} />
              Seed Database
            </button>
            <button
              onClick={onResetDemoData}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-red-600 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
              title="Clear all records and reset database"
            >
              <RefreshCw size={12} />
              Reset Database
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA SCROLLBARS */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveView()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
