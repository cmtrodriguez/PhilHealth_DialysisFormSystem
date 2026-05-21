import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, User, Calendar, MapPin, Phone, Hospital, Download, Trash2, X, PlusCircle, CheckCircle, Clock, UserPlus } from 'lucide-react';
import type { PDDRegistration, DialysisSession, Nephrologist } from '../../types';
import { buildPddRegistrationPdfBytes } from '../../utils/exportPddPdf';

interface PatientRegistryViewProps {
  registrations: PDDRegistration[];
  sessions: DialysisSession[];
  doctors: Nephrologist[];
  onDeletePatient: (id: string) => void;
  onAddPatient: (reg: PDDRegistration) => void;
}

export default function PatientRegistryView({
  registrations,
  sessions,
  doctors,
  onDeletePatient,
  onAddPatient,
}: PatientRegistryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<PDDRegistration | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    pin: '',
    dob: '',
    sex: 'Male' as 'Male' | 'Female',
    memberType: 'Principal Member' as 'Principal Member' | 'Dependent',
    treatmentType: 'Low flux' as 'Low flux' | 'High flux' | 'Others',
    startDate: new Date().toISOString().split('T')[0],
  });

  const filteredRegs = registrations.filter((reg) => {
    const fullName = `${reg.patientName.first} ${reg.patientName.last}`.toLowerCase();
    const pin = reg.pin.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || pin.includes(term);
  });

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleExportPdf = async (reg: PDDRegistration) => {
    try {
      const pdfBytes = await buildPddRegistrationPdfBytes(reg);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PhilHealth_PDD_${reg.patientName.last}_${reg.patientName.first}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Error rendering PhilHealth PDF template.');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.lastName || !newPatient.firstName || !newPatient.pin || !newPatient.dob) {
      alert('Please fill out all fields.');
      return;
    }

    const regObj: PDDRegistration = {
      id: `reg_${Date.now()}`,
      regType: 'New Registration',
      pin: newPatient.pin,
      patientName: {
        last: newPatient.lastName,
        first: newPatient.firstName,
        middle: newPatient.middleName,
        extension: '',
      },
      memberType: newPatient.memberType,
      dob: newPatient.dob,
      sex: newPatient.sex,
      civilStatus: 'Single',
      address: {
        unit: '',
        building: '',
        lot: '',
        street: '',
        subdivision: '',
        barangay: 'Barangay 1',
        city: 'Manila',
        province: 'Metro Manila',
        country: 'Philippines',
        zip: '1000',
      },
      contact: {
        email: `${newPatient.firstName.toLowerCase()}@example.com`,
        mobile: '09171234567',
        landline: '',
      },
      zBenefits: {
        pdFirstPolicy: false,
        kidneyTransplant: false,
      },
      previousAvailment: {
        kidneyTransplant: false,
      },
      dialysisStartDate: newPatient.startDate,
      hdDetails: {
        type: newPatient.treatmentType,
      },
      pdDetails: {
        system: '',
      },
      admin: {
        pddRegNo: `PDD-${Date.now().toString().slice(-6)}`,
        registeredBy: 'Maria Santos',
        accreditationNo: 'HCI-123456',
        registrationDate: new Date().toISOString().split('T')[0],
      },
      recordStatus: 'Active',
      createdAt: new Date().toISOString(),
    };

    onAddPatient(regObj);
    setIsAddOpen(false);
    setNewPatient({
      lastName: '',
      firstName: '',
      middleName: '',
      pin: '',
      dob: '',
      sex: 'Male',
      memberType: 'Principal Member',
      treatmentType: 'Low flux',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Patient Directory</h3>
          <p className="text-slate-500 text-sm mt-1">
            Search demographics, view clinical files, verify Z-Benefits status, and export PDD PDF certifications.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-center"
        >
          <PlusCircle size={18} />
          Direct Enroll Patient
        </button>
      </div>

      {/* SEARCH CARD */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400 shrink-0" size={20} />
        <input
          type="text"
          placeholder="Search by Patient Name or PhilHealth PIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-700 outline-none text-sm placeholder-slate-400 bg-transparent font-medium"
        />
      </div>

      {/* PATIENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Patient Name</th>
                <th className="p-4">PhilHealth PIN</th>
                <th className="p-4">Age / Sex</th>
                <th className="p-4">Treatment Type</th>
                <th className="p-4">PDD Registry Code</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <User className="mx-auto text-slate-300 mb-3" size={28} />
                    <p className="font-bold text-sm">No Patients Registered</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use the "Direct Enroll Patient" button or submit from the patient portal.</p>
                  </td>
                </tr>
              ) : (
                filteredRegs.map((reg) => {
                  const patientSessions = sessions.filter(s => s.registrationId === reg.id);

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-slate-800">
                          {reg.patientName.last}, {reg.patientName.first}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {reg.contact.email}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-600">{reg.pin}</td>
                      <td className="p-4">
                        <span className="font-extrabold">{calculateAge(reg.dob)} yrs</span>
                        <span className="text-slate-400"> / {reg.sex}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-800">
                          {reg.hdDetails.type ? 'Hemodialysis' : 'Peritoneal'}
                        </div>
                        <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                          {reg.hdDetails.type || reg.pdDetails.system || 'Stage 5 CKD'}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600 font-bold">
                        {reg.admin.pddRegNo || <span className="text-slate-400 font-normal">Pending Approval</span>}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            reg.recordStatus === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : reg.recordStatus === 'Pending'
                              ? 'bg-yellow-50 border-yellow-200 text-emerald-950 animate-pulse'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {reg.recordStatus}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-black px-2.5 py-1.5 rounded-xl text-[10px] transition-all active:scale-95"
                        >
                          Clinical File
                        </button>

                        <button
                          onClick={() => handleExportPdf(reg)}
                          disabled={reg.recordStatus !== 'Active'}
                          className={`p-2 rounded-xl border transition-all active:scale-95 ${
                            reg.recordStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          }`}
                          title="Export PhilHealth PDF"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Archive dialysis registration for ${reg.patientName.first} ${reg.patientName.last}?`)) {
                              onDeletePatient(reg.id);
                            }
                          }}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded-xl transition-all active:scale-95"
                          title="Archive Patient"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PATIENT CLINICAL FILE MODAL */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200/50 w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">
                      {selectedReg.patientName.last}, {selectedReg.patientName.first} {selectedReg.patientName.middle}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Attending Speciality Case Registry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Clinical Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dialysis Start</p>
                    <p className="font-extrabold text-slate-700 text-sm mt-1">
                      {new Date(selectedReg.dialysisStartDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Treatment Class</p>
                    <p className="font-extrabold text-slate-700 text-sm mt-1">
                      {selectedReg.hdDetails.type ? 'Hemodialysis' : 'Peritoneal'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Z-Benefits PD First</p>
                    <p className="font-extrabold text-slate-700 text-sm mt-1">
                      {selectedReg.zBenefits.pdFirstPolicy ? 'PD First Declared' : 'Standard HD'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Registry Number</p>
                    <p className="font-extrabold text-slate-700 text-sm mt-1 font-mono">
                      {selectedReg.admin.pddRegNo || 'UNREGISTERED'}
                    </p>
                  </div>
                </div>

                {/* Patient Profile Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Registered Address</span>
                        <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                          {selectedReg.address.barangay}, {selectedReg.address.city}, {selectedReg.address.province}, {selectedReg.address.country} {selectedReg.address.zip}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact Channels</span>
                        <p className="text-xs text-slate-600 mt-1 font-semibold">
                          Mobile: {selectedReg.contact.mobile}
                        </p>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          Email: {selectedReg.contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Allocation progress bar */}
                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Hospital className="text-emerald-700" size={18} />
                      <span className="font-extrabold text-emerald-950 text-sm">Hemodialysis Session Balance</span>
                    </div>
                    <span className="font-black text-emerald-800 text-sm">
                      {sessions.filter(s => s.registrationId === selectedReg.id).length} / 156 Sessions Used
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${(sessions.filter(s => s.registrationId === selectedReg.id).length / 156) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed">
                    PhilHealth standard covers up to 156 session treatments per patient per calendar year. Under-allocation triggers warning indicators.
                  </p>
                </div>
              </div>

              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedReg(null)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-100 transition-all active:scale-95"
                >
                  Close File
                </button>
                <button
                  onClick={() => handleExportPdf(selectedReg)}
                  disabled={selectedReg.recordStatus !== 'Active'}
                  className={`px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                    selectedReg.recordStatus !== 'Active' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Download size={16} />
                  Export certified PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT ENROLL MODAL */}
      <AnimatePresence>
        {isAddOpen && (
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
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Direct Patient Enrollment</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Administrative Registry Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cardo"
                      value={newPatient.firstName}
                      onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dalisay"
                      value={newPatient.lastName}
                      onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      PhilHealth PIN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00-000000000-0"
                      value={newPatient.pin}
                      onChange={(e) => setNewPatient({ ...newPatient, pin: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Birth Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newPatient.dob}
                      onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Sex *
                    </label>
                    <select
                      value={newPatient.sex}
                      onChange={(e) => setNewPatient({ ...newPatient, sex: e.target.value as 'Male' | 'Female' })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Member Classification *
                    </label>
                    <select
                      value={newPatient.memberType}
                      onChange={(e) => setNewPatient({ ...newPatient, memberType: e.target.value as 'Principal Member' | 'Dependent' })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    >
                      <option value="Principal Member">Principal Member</option>
                      <option value="Dependent">Dependent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      HD Flux Detail *
                    </label>
                    <select
                      value={newPatient.treatmentType}
                      onChange={(e) => setNewPatient({ ...newPatient, treatmentType: e.target.value as any })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    >
                      <option value="Low flux">Low flux</option>
                      <option value="High flux">High flux</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      First Treatment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newPatient.startDate}
                      onChange={(e) => setNewPatient({ ...newPatient, startDate: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-95"
                  >
                    Enroll Case Profile
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
