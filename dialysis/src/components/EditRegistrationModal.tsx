import { useState, type FormEvent } from 'react';
import { X, Save } from 'lucide-react';
import type {
  HDType,
  MemberType,
  PDDRegistration,
  PDSystem,
  RecordStatus,
  RegistrationStatus,
  Sex,
} from '../types';

type EditableRegistration = PDDRegistration & {
  signaturePreview?: string;
  signatureFileName?: string;
  signatureDate?: string;
};

interface EditRegistrationModalProps {
  registration: PDDRegistration;
  onClose: () => void;
  onSave: (registration: PDDRegistration) => void;
}

function toDatetimeLocal(value?: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function EditRegistrationModal({
  registration,
  onClose,
  onSave,
}: EditRegistrationModalProps) {
  const [formData, setFormData] = useState<EditableRegistration>({
    ...registration,
    patientName: { ...registration.patientName },
    address: { ...registration.address },
    contact: { ...registration.contact },
    zBenefits: { ...registration.zBenefits },
    previousAvailment: { ...registration.previousAvailment },
    hdDetails: { ...registration.hdDetails },
    pdDetails: { ...registration.pdDetails },
    admin: { ...registration.admin },
  });

  const updateRoot = <K extends keyof EditableRegistration>(
    key: K,
    value: EditableRegistration[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateNested = <
    K extends keyof EditableRegistration,
    F extends keyof NonNullable<EditableRegistration[K]>,
  >(
    category: K,
    field: F,
    value: NonNullable<EditableRegistration[K]>[F],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [category]: {
        ...(previous[category] as object),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave(formData as PDDRegistration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[998] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Edit Application Record
            </h2>
            <p className="text-xs text-slate-500">
              Update the stored patient information. The PDF will use these updated values.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Application Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Registration Type
                </span>
                <select
                  value={formData.regType}
                  onChange={(event) =>
                    updateRoot(
                      'regType',
                      event.target.value as RegistrationStatus,
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="New Registration">New Registration</option>
                  <option value="Reactivation">Reactivation</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Record Status
                </span>
                <select
                  value={formData.recordStatus}
                  onChange={(event) =>
                    updateRoot('recordStatus', event.target.value as RecordStatus)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-bold text-slate-500">
                  PhilHealth PIN
                </span>
                <input
                  value={formData.pin}
                  onChange={(event) => updateRoot('pin', event.target.value)}
                  placeholder="00-000000000-0"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 font-mono"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Patient Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Last Name
                </span>
                <input
                  value={formData.patientName.last}
                  onChange={(event) =>
                    updateNested('patientName', 'last', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  First Name
                </span>
                <input
                  value={formData.patientName.first}
                  onChange={(event) =>
                    updateNested('patientName', 'first', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Extension
                </span>
                <input
                  value={formData.patientName.extension}
                  onChange={(event) =>
                    updateNested('patientName', 'extension', event.target.value)
                  }
                  placeholder="JR/SR/III"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Middle Name
                </span>
                <input
                  value={formData.patientName.middle}
                  onChange={(event) =>
                    updateNested('patientName', 'middle', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Member Type
                </span>
                <select
                  value={formData.memberType}
                  onChange={(event) =>
                    updateRoot('memberType', event.target.value as MemberType)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="Principal Member">Principal Member</option>
                  <option value="Dependent">Dependent</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Date of Birth
                </span>
                <input
                  type="date"
                  value={formData.dob || ''}
                  onChange={(event) => updateRoot('dob', event.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">Sex</span>
                <select
                  value={formData.sex}
                  onChange={(event) =>
                    updateRoot('sex', event.target.value as Sex)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Civil Status
                </span>
                <input
                  value={formData.civilStatus}
                  onChange={(event) =>
                    updateRoot('civilStatus', event.target.value)
                  }
                  placeholder="Single, Married, etc."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Mailing Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                ['unit', 'Unit/Room/Floor'],
                ['building', 'Building Name'],
                ['lot', 'Lot/Block/House/Bldg. No.'],
                ['street', 'Street'],
                ['subdivision', 'Subdivision/Village'],
                ['barangay', 'Barangay'],
                ['city', 'City/Municipality'],
                ['province', 'Province'],
                ['country', 'Country'],
                ['zip', 'Zip Code'],
              ].map(([field, label]) => (
                <label key={field} className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">
                    {label}
                  </span>
                  <input
                    value={
                      formData.address[field as keyof typeof formData.address] ??
                      ''
                    }
                    onChange={(event) =>
                      updateNested(
                        'address',
                        field as keyof typeof formData.address,
                        event.target.value,
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Email Address
                </span>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(event) =>
                    updateNested('contact', 'email', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Mobile Number
                </span>
                <input
                  value={formData.contact.mobile}
                  onChange={(event) =>
                    updateNested('contact', 'mobile', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Landline
                </span>
                <input
                  value={formData.contact.landline}
                  onChange={(event) =>
                    updateNested('contact', 'landline', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Dialysis and Benefit Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.zBenefits.pdFirstPolicy}
                  onChange={(event) =>
                    updateNested(
                      'zBenefits',
                      'pdFirstPolicy',
                      event.target.checked,
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-slate-700">
                  PD First Policy
                </span>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.zBenefits.kidneyTransplant}
                  onChange={(event) =>
                    updateNested(
                      'zBenefits',
                      'kidneyTransplant',
                      event.target.checked,
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-slate-700">
                  Z Benefit: Kidney Transplantation
                </span>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.previousAvailment.kidneyTransplant}
                  onChange={(event) =>
                    updateNested(
                      'previousAvailment',
                      'kidneyTransplant',
                      event.target.checked,
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-slate-700">
                  Previous Kidney Transplant Availment
                </span>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Dialysis Start Month
                </span>
                <input
                  type="month"
                  value={formData.dialysisStartDate || ''}
                  onChange={(event) =>
                    updateRoot('dialysisStartDate', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  HD Dialyzer Type
                </span>
                <select
                  value={formData.hdDetails.type}
                  onChange={(event) =>
                    updateNested(
                      'hdDetails',
                      'type',
                      event.target.value as HDType,
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="Low flux">Low flux</option>
                  <option value="High flux">High flux</option>
                  <option value="Others">Others</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Other Dialyzer Type
                </span>
                <input
                  value={formData.hdDetails.othersDetail ?? ''}
                  onChange={(event) =>
                    updateNested('hdDetails', 'othersDetail', event.target.value)
                  }
                  disabled={formData.hdDetails.type !== 'Others'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Current PD System
                </span>
                <select
                  value={formData.pdDetails.system}
                  onChange={(event) =>
                    updateNested(
                      'pdDetails',
                      'system',
                      event.target.value as PDSystem | '',
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">None</option>
                  <option value="CAPD">CAPD</option>
                  <option value="CIPD-C">CIPD-C</option>
                  <option value="CIPD-M">CIPD-M</option>
                  <option value="CCPD">CCPD</option>
                  <option value="NIPD">NIPD</option>
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest">
              Admin Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  PDD Registration No.
                </span>
                <input
                  value={formData.admin.pddRegNo}
                  onChange={(event) =>
                    updateNested('admin', 'pddRegNo', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Registered By
                </span>
                <input
                  value={formData.admin.registeredBy}
                  onChange={(event) =>
                    updateNested('admin', 'registeredBy', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Accreditation No.
                </span>
                <input
                  value={formData.admin.accreditationNo}
                  onChange={(event) =>
                    updateNested('admin', 'accreditationNo', event.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">
                  Registration Date
                </span>
                <input
                  type="datetime-local"
                  value={toDatetimeLocal(formData.admin.registrationDate)}
                  onChange={(event) =>
                    updateNested(
                      'admin',
                      'registrationDate',
                      new Date(event.target.value).toISOString(),
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
                />
              </label>
            </div>
          </section>
        </main>

        <footer className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </footer>
      </form>
    </div>
  );
}