import {
  Search,
  Trash2,
  // ExternalLink, // PDF Layout Editor icon - keep for future debugging
  Download,
  AlertCircle,
  FileText,
  // Settings, // PDF Layout Editor icon - keep for future debugging
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PDDRegistration } from '../types';
// import PdfLayoutDebugger from './PdfLayoutDebugger'; // Keep for future PDF layout debugging
import EditRegistrationModal from './EditRegistrationModal';
import { downloadPddRegistrationPdf } from '../utils/exportPddPdf';

interface RecordsListProps {
  registrations: PDDRegistration[];
  onDelete: (id: string) => void;
  onUpdate: (registration: PDDRegistration) => void;
}

export default function RecordsList({
  registrations,
  onDelete,
  onUpdate,
}: RecordsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Active' | 'Pending' | 'Archived'
  >('All');
  // PDF LAYOUT EDITOR STATE - hidden for production, keep for future debugging
  // const [layoutEditorReg, setLayoutEditorReg] =
  //   useState<PDDRegistration | null>(null);
  const [editingReg, setEditingReg] = useState<PDDRegistration | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const filteredRegistrations = registrations.filter((reg) => {
    const normalizedSearch = searchTerm.toLowerCase();

    const matchesSearch =
      reg.patientName.first.toLowerCase().includes(normalizedSearch) ||
      reg.patientName.last.toLowerCase().includes(normalizedSearch) ||
      (reg.pin && reg.pin.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'All' || reg.recordStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const latestRegistration = filteredRegistrations[0];

  const handleDownloadLatest = () => {
    if (!latestRegistration) {
      alert('No application record available to download.');
      return;
    }

    downloadPddRegistrationPdf(latestRegistration);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleFinalDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
    }

    setShowDeleteConfirm(false);
    setRecordToDelete(null);
  };

  // PDF LAYOUT EDITOR HANDLER - hidden for production, keep for future debugging
  // const handleOpenLayoutEditor = () => {
  //   if (!latestRegistration) {
  //     alert('No application record available to edit.');
  //     return;
  //   }
  //
  //   setLayoutEditorReg(latestRegistration);
  // };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Filter my applications..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'All'
                  | 'Active'
                  | 'Pending'
                  | 'Archived',
              )
            }
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none focus:border-emerald-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/*
            PDF Layout Editor button - hidden for production.
            Uncomment this block, the PdfLayoutDebugger import, the layoutEditorReg state,
            handleOpenLayoutEditor, the row-level editor button, and the render block below
            when you need to recalibrate PDF coordinates again.

          <button
            onClick={handleOpenLayoutEditor}
            disabled={filteredRegistrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors border border-slate-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings className="w-4 h-4" />
            PDF Layout Editor
          </button>
          */}

          <button
            onClick={handleDownloadLatest}
            disabled={filteredRegistrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Application Type
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  My PhilHealth PIN
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Dialysis Start
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Current Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Submission Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">
                        You haven't submitted any applications yet.
                      </p>

                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('All');
                        }}
                        className="mt-2 text-emerald-600 hover:underline text-sm font-semibold"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredRegistrations.map((reg) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shadow-sm shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>

                          <div>
                            <p className="font-bold text-slate-800 leading-tight">
                              {reg.regType}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 capitalize">
                              {reg.hdDetails?.type || 'Standard'} Dialyzer
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {reg.pin || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 font-medium italic">
                        {reg.dialysisStartDate || 'Not provided'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reg.recordStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : reg.recordStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              reg.recordStatus === 'Active'
                                ? 'bg-emerald-500'
                                : reg.recordStatus === 'Pending'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                            }`}
                          />
                          {reg.recordStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(reg.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadPddRegistrationPdf(reg)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Download Filled Dialysis Form"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingReg(reg)}
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                            title="Edit Record Information"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/*
                            Row-level PDF Layout Editor button - hidden for production.
                            Uncomment this when recalibrating with a specific record.

                          <button
                            onClick={() => setLayoutEditorReg(reg)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit PDF Layout Using This Record"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          */}

                          <button
                            onClick={() => handleDeleteClick(reg.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Showing {filteredRegistrations.length} of {registrations.length}{' '}
            total records
          </p>

          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-400 cursor-not-allowed">
              Previous
            </button>

            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:border-emerald-500 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/*
        PDF Layout Editor render block - hidden for production.
        Uncomment this together with the related import/state/buttons above
        when you need the in-app PDF coordinate debugger again.

      {layoutEditorReg && (
        <PdfLayoutDebugger
          registration={layoutEditorReg}
          onClose={() => setLayoutEditorReg(null)}
        />
      )}
      */}

      {editingReg && (
        <EditRegistrationModal
          registration={editingReg}
          onClose={() => setEditingReg(null)}
          onSave={onUpdate}
        />
      )}


      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDeleteConfirm(false);
                setRecordToDelete(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative z-10 w-full max-w-sm space-y-4 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-800">
                  Delete Registration Record
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  Are you sure you want to permanently remove this dialysis application record? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setRecordToDelete(null);
                  }}
                  className="h-11 flex-1 rounded-xl border border-slate-200/60 bg-slate-50 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalDelete}
                  className="h-11 flex-1 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-md shadow-rose-100 transition-colors hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}