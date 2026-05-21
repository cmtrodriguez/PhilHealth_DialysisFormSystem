import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Search, ShieldCheck, Mail, FileSignature, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import type { Nephrologist } from '../../types';

interface DoctorsDirectoryViewProps {
  doctors: Nephrologist[];
  onAddDoctor: (doc: Nephrologist) => void;
  onUpdateDoctor: (doc: Nephrologist) => void;
  onDeleteDoctor: (id: string) => void;
}

export default function DoctorsDirectoryView({
  doctors,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}: DoctorsDirectoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<Nephrologist>>({
    first: '',
    last: '',
    prcLicenseNo: '',
    panNo: '',
    email: '',
    isActive: true,
  });

  const filteredDoctors = doctors.filter((doc) =>
    `${doc.first} ${doc.last} ${doc.panNo} ${doc.prcLicenseNo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.first || !newDoc.last || !newDoc.prcLicenseNo || !newDoc.panNo) {
      alert('Please fill out all required fields.');
      return;
    }

    const doctorToAdd: Nephrologist = {
      id: `doc_${Date.now()}`,
      first: newDoc.first,
      last: newDoc.last,
      prcLicenseNo: newDoc.prcLicenseNo,
      panNo: newDoc.panNo,
      email: newDoc.email || `${newDoc.first.toLowerCase()}.${newDoc.last.toLowerCase()}@hospital.gov.ph`,
      isActive: newDoc.isActive ?? true,
      signatureUrl: 'https://raw.githubusercontent.com/user-attachments/assets/5e0034a7-8025-4cde-a178-65363e77f000', // Mock baseline signature URL
    };

    onAddDoctor(doctorToAdd);
    setNewDoc({
      first: '',
      last: '',
      prcLicenseNo: '',
      panNo: '',
      email: '',
      isActive: true,
    });
    setIsAddModalOpen(false);
  };

  const toggleDoctorStatus = (doc: Nephrologist) => {
    onUpdateDoctor({
      ...doc,
      isActive: !doc.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Accredited Doctors</h3>
          <p className="text-slate-500 text-sm mt-1">
            Manage accredited facility nephrologists authorized to certify PhilHealth Dialysis registrations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-center"
        >
          <UserPlus size={18} />
          Accredit Nephrologist
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400 shrink-0" size={20} />
        <input
          type="text"
          placeholder="Search by Doctor Name, PRC License, or PhilHealth PAN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-700 outline-none text-sm placeholder-slate-400 bg-transparent font-medium"
        />
      </div>

      {/* DOCTORS GRID */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/50">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <X size={28} className="text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-700">No Nephrologists Found</h4>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Try refining your search keyword or click "Accredit Nephrologist" to enroll a new attending specialist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <motion.div
              layout
              key={doc.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                doc.isActive 
                  ? 'border-slate-200/60 shadow-sm hover:shadow-lg' 
                  : 'border-slate-100 bg-slate-50/50 opacity-70'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base shadow-inner">
                      {doc.first[0]}{doc.last[0]}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                        Dr. {doc.first} {doc.last}
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase mt-0.5">
                        Attending Nephrologist
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      doc.isActive
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        : 'bg-slate-100 border border-slate-200 text-slate-500'
                    }`}
                  >
                    {doc.isActive ? 'Accredited' : 'Suspended'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">PRC License No:</span>
                    <span className="text-slate-700 font-bold">{doc.prcLicenseNo}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">PhilHealth PAN:</span>
                    <span className="text-slate-700 font-bold">{doc.panNo}</span>
                  </div>
                  <div className="flex justify-between font-medium items-center">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 truncate max-w-[150px] inline-flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      {doc.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-5 pt-3.5 flex items-center justify-between">
                <button
                  onClick={() => toggleDoctorStatus(doc)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                    doc.isActive ? 'text-slate-500 hover:text-yellow-600' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  {doc.isActive ? (
                    <>
                      <ToggleRight size={18} className="text-emerald-600 shrink-0" />
                      Revoke Accreditation
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={18} className="text-slate-400 shrink-0" />
                      Grant Accreditation
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove Dr. ${doc.last} from accreditation directory?`)) {
                      onDeleteDoctor(doc.id);
                    }
                  }}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all active:scale-95"
                  title="Delete Record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ACCREDIT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
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
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">Accredit Nephrologist</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">PhilHealth HCI Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Edgardo"
                      value={newDoc.first}
                      onChange={(e) => setNewDoc({ ...newDoc, first: e.target.value })}
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
                      placeholder="e.g. Perez"
                      value={newDoc.last}
                      onChange={(e) => setNewDoc({ ...newDoc, last: e.target.value })}
                      className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    PRC License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0123456"
                    value={newDoc.prcLicenseNo}
                    onChange={(e) => setNewDoc({ ...newDoc, prcLicenseNo: e.target.value })}
                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    PhilHealth PAN (Accreditation Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 99-123456789-0"
                    value={newDoc.panNo}
                    onChange={(e) => setNewDoc({ ...newDoc, panNo: e.target.value })}
                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. edgardo.perez@hospital.gov.ph"
                    value={newDoc.email}
                    onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                    className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
                  />
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Enroll Nephrologist
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
