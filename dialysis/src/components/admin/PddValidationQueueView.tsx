import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, User, Search, MapPin, Eye, CheckCircle2, X, FileSignature } from 'lucide-react';
import type { PDDRegistration, Nephrologist } from '../../types';
import { buildPddRegistrationPdfBytes } from '../../utils/exportPddPdf';

interface PddValidationQueueViewProps {
  registrations: PDDRegistration[];
  doctors: Nephrologist[];
  onApproveRegistration: (id: string, updatedReg: PDDRegistration) => void;
  onRejectRegistration: (id: string) => void;
}

export default function PddValidationQueueView({
  registrations,
  doctors,
  onApproveRegistration,
  onRejectRegistration,
}: PddValidationQueueViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<PDDRegistration | null>(null);
  
  const [assignedDocId, setAssignedDocId] = useState('');
  const [pddRegNo, setPddRegNo] = useState('');
  const [accreditationNo, setAccreditationNo] = useState('HCI-998877'); // Mock baseline hospital accreditation
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);

  const pendingRegs = registrations.filter((reg) => reg.recordStatus === 'Pending');
  const accreditedDoctors = doctors.filter((doc) => doc.isActive);

  const filteredPending = pendingRegs.filter((reg) => {
    const fullName = `${reg.patientName.first} ${reg.patientName.last}`.toLowerCase();
    const pin = reg.pin.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || pin.includes(term);
  });

  const handleOpenReview = (reg: PDDRegistration) => {
    setSelectedReg(reg);
    setAssignedDocId('');
    setPddRegNo(`PDD-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    if (!assignedDocId) {
      alert('Please assign an accredited attending Nephrologist.');
      return;
    }

    const assignedDoctor = accreditedDoctors.find(d => d.id === assignedDocId);
    if (!assignedDoctor) return;

    // Create the fully certified registration
    const approvedReg: PDDRegistration = {
      ...selectedReg,
      recordStatus: 'Active',
      admin: {
        pddRegNo,
        registeredBy: 'Maria Santos (HCI Encoder)',
        accreditationNo,
        registrationDate,
      },
    };

    // Download the PDF immediately as part of HCI workflow
    try {
      const pdfBytes = await buildPddRegistrationPdfBytes({
        ...approvedReg,
        signaturePreview: assignedDoctor.signatureUrl,
      } as any);
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PhilHealth_PDD_CERTIFIED_${approvedReg.patientName.last}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF overlay failed', err);
    }

    onApproveRegistration(selectedReg.id, approvedReg);
    setSelectedReg(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">PDD Validation Queue</h3>
        <p className="text-slate-500 text-sm mt-1">
          Review incoming patient self-registrations, verify demographic logs, assign attending physicians, and certify cases.
        </p>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400 shrink-0" size={20} />
        <input
          type="text"
          placeholder="Filter pending approvals by Patient Name or PhilHealth PIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-700 outline-none text-sm placeholder-slate-400 bg-transparent font-medium"
        />
      </div>

      {/* QUEUE CARDS */}
      {filteredPending.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/50">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-700">Queue is Clear!</h4>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            All self-submitted patient registrations have been verified, certified, and successfully transmitted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPending.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 text-emerald-950 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        {reg.patientName.last}, {reg.patientName.first}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">PIN: {reg.pin}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-50 text-emerald-950 border border-yellow-100 animate-pulse">
                    Pending Review
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Registered Address</span>
                      <span className="text-slate-700 text-[11px] leading-tight block truncate mt-0.5">
                        {reg.address.barangay}, {reg.address.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <ShieldAlert size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Z-Benefits PD Policy</span>
                      <span className="text-slate-700 text-[11px] leading-tight block mt-0.5">
                        {reg.zBenefits.pdFirstPolicy ? 'PD First Declared' : 'Standard Hemodialysis'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    if (confirm(`Reject and delete registration case for ${reg.patientName.first}?`)) {
                      onRejectRegistration(reg.id);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-red-600 font-bold text-xs hover:bg-red-50/50 transition-all active:scale-95"
                >
                  Reject Case
                </button>
                
                <button
                  onClick={() => handleOpenReview(reg)}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow active:scale-95"
                >
                  <Eye size={14} />
                  Review & Certify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED CERTIFY AND REVIEW MODAL */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200/50 w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileSignature size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Verify & Certify Registration</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">HCI Case Management Queue</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleApprove} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Patient Summary Details */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Patient Name:</span>
                    <span className="text-slate-800 font-extrabold">{selectedReg.patientName.last}, {selectedReg.patientName.first}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">PhilHealth PIN:</span>
                    <span className="text-slate-800 font-extrabold font-mono">{selectedReg.pin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Treatment Type:</span>
                    <span className="text-slate-800 font-extrabold">{selectedReg.hdDetails.type ? `Hemodialysis (${selectedReg.hdDetails.type})` : 'Peritoneal Dialysis'}</span>
                  </div>
                </div>

                {/* Attending Physician Assignment */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Assign Accredited attending Nephrologist *
                  </label>
                  <select
                    required
                    value={assignedDocId}
                    onChange={(e) => setAssignedDocId(e.target.value)}
                    className="mt-2 w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {accreditedDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.first} {doc.last} (PAN: {doc.panNo})
                      </option>
                    ))}
                  </select>
                  {accreditedDoctors.length === 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      No accredited doctors available. Please enroll a doctor in the Accredited Doctors Directory first.
                    </p>
                  )}
                </div>

                {/* official PDD Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      PDD Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={pddRegNo}
                      onChange={(e) => setPddRegNo(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Hospital Accreditation No *
                    </label>
                    <input
                      type="text"
                      required
                      value={accreditationNo}
                      onChange={(e) => setAccreditationNo(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Accredited Validation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-[10px] text-emerald-800 font-semibold leading-relaxed">
                  Approving this case marks the registration as **Active** in the facility. This automatically triggers a download of the calibrated, certified PhilHealth PDD PDF overlay and allows session logging for claims billing.
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReg(null)}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Back to Queue
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Certify & Approve Case
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
