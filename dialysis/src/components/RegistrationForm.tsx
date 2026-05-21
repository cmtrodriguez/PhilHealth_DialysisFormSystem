import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  ShieldCheck,
  Stethoscope,
  FileText,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDDRegistration, RecordStatus } from '../types';

interface RegistrationFormProps {
  onSubmit: (reg: PDDRegistration) => void;
}

export default function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]); 
  const totalSteps = 4;

  const [formData, setFormData] = useState<Partial<PDDRegistration>>({
    regType: 'New Registration',
    memberType: 'Principal Member',
    sex: 'Male',
    patientName: { first: '', last: '', middle: '', extension: '' },
    address: { unit: '', building: '', lot: '', street: '', subdivision: '', barangay: '', city: '', province: '', country: 'Philippines', zip: '' },
    contact: { email: '', mobile: '', landline: '' },
    zBenefits: { pdFirstPolicy: false, kidneyTransplant: false },
    previousAvailment: { kidneyTransplant: false },
    dialysisStartDate: '',
    hdDetails: { type: 'High flux' },
    pdDetails: { system: 'CCPD' },
    admin: { pddRegNo: '', registeredBy: '', accreditationNo: '', registrationDate: new Date().toISOString().substring(0, 10) },
  });

  // Signature canvas states & references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    setErrors([]);
  }, [step]);

  // Handle setting up canvas context scaling when step 4 mounts
  useEffect(() => {
    if (step === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b'; // Slate 800
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      
      // If a signature already exists in state, redraw it onto the canvas
      const existingSig = (formData as any).signaturePreview;
      if (existingSig) {
        const img = new Image();
        img.src = existingSig;
        img.onload = () => ctx?.drawImage(img, 0, 0);
        setHasSigned(true);
      }
    }
  }, [step]);

  // --- Drawing Pad Mechanics ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support touch devices alongside desktop mice
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignatureState();
  };

  const saveSignatureState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setFormData(prev => ({
      ...prev,
      signaturePreview: dataUrl,
      signatureFileName: 'handwritten-signature.png'
    } as any));
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    
    setHasSigned(false);
    setFormData(prev => ({
      ...prev,
      signaturePreview: '',
      signatureFileName: ''
    } as any));
  };

  const updateNested = (category: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as object),
        [field]: value
      }
    }));
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Numerical input handler
  const handleNumericalInput = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  };

  // Field name mapping for error display
  const fieldNameMap: Record<string, string> = {
    'pin': 'PIN Number',
    'lastName': 'Last Name',
    'firstName': 'First Name',
    'dob': 'Date of Birth',
    'civilStatus': 'Civil Status',
    'street': 'Building / Street Address',
    'barangay': 'Barangay',
    'city': 'City/Municipality',
    'province': 'Province',
    'mobile': 'Mobile Number',
    'email': 'Email Address',
    'dialysisStartDate': 'Dialysis Initiation Date',
    'othersDetail': 'Other Dialyzer Type',
    'pdSystem': 'For PD: Current PD System Selection',
    'zBenefits': 'Z Benefit Enrollment Status',
    'previousKidneyTransplant': 'Previous Kidney Transplant Case Availment',
    'signatureHandwritten': 'Signature / Thumbmark',
    'signatureDate': 'Signature Date',
    'pddRegNo': 'PDD Registration No.',
    'registeredBy': 'Registered By (HCI)',
    'accreditationNo': 'Accreditation No.',
    'registrationDate': 'Registration Logging Date'
  };

  const validateStep = (currentStep: number): boolean => {
    const missingFields: string[] = [];

    if (currentStep === 1) {
      if (!formData.pin?.trim()) missingFields.push('pin');
      if (!formData.patientName?.last?.trim()) missingFields.push('lastName');
      if (!formData.patientName?.first?.trim()) missingFields.push('firstName');
      if (!formData.dob) missingFields.push('dob');
      if (!formData.civilStatus?.trim()) missingFields.push('civilStatus');
    }

    if (currentStep === 2) {
      if (!formData.address?.street?.trim()) missingFields.push('street');
      if (!formData.address?.barangay?.trim()) missingFields.push('barangay');
      if (!formData.address?.city?.trim()) missingFields.push('city');
      if (!formData.address?.province?.trim()) missingFields.push('province');
      if (!formData.contact?.mobile?.trim()) missingFields.push('mobile');
      if (!formData.contact?.email?.trim()) missingFields.push('email');
      else if (!isValidEmail(formData.contact.email)) missingFields.push('email');
    }

    if (currentStep === 3) {
      if (!formData.dialysisStartDate) missingFields.push('dialysisStartDate');
      if (formData.hdDetails?.type === 'Others' && !formData.hdDetails?.othersDetail?.trim()) {
        missingFields.push('othersDetail');
      }
      if (!formData.pdDetails?.system) missingFields.push('pdSystem');
      if (!formData.zBenefits?.pdFirstPolicy && !formData.zBenefits?.kidneyTransplant) missingFields.push('zBenefits');
      if (formData.previousAvailment?.kidneyTransplant === null || formData.previousAvailment?.kidneyTransplant === undefined) missingFields.push('previousKidneyTransplant');
    }

    if (currentStep === 4) {
      if (!hasSigned) missingFields.push('signatureHandwritten');
      if (!(formData as any).signatureDate) missingFields.push('signatureDate');
      if (!formData.admin?.pddRegNo?.trim()) missingFields.push('pddRegNo');
      if (!formData.admin?.registeredBy?.trim()) missingFields.push('registeredBy');
      if (!formData.admin?.accreditationNo?.trim()) missingFields.push('accreditationNo');
      if (!formData.admin?.registrationDate) missingFields.push('registrationDate');
    }

    setErrors(missingFields);
    return missingFields.length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };
  
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleCommitClick = () => {
    if (validateStep(4)) {
      setShowConfirm(true);
    }
  };

  const handleFinalSubmit = () => {
    setShowConfirm(false);
    const finalData: PDDRegistration = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      recordStatus: 'Pending' as RecordStatus,
    } as PDDRegistration;
    
    onSubmit(finalData);
  };

  // Design UI classes
  const cardPanelClass = "p-6 bg-slate-50/60 border border-slate-100 rounded-3xl space-y-6";
  const cardHeaderClass = "flex items-center gap-3 border-b border-slate-200/50 pb-3";
  const cardTitleClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";
  const fieldLabelClass = "text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-0.5 mb-1.5";
  
  const getInputClass = (hasError: boolean) => 
    `w-full h-12 px-4 bg-white border ${hasError ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'} rounded-xl outline-none focus:ring-1 text-slate-700 font-medium transition-all placeholder:text-slate-300`;
  
  const selectControlClass = "w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-700 font-medium transition-all appearance-none cursor-pointer";
  const segmentedWrapperClass = "flex gap-1.5 h-12 bg-white p-1 border border-slate-200 rounded-xl w-full";
  const segmentedButtonClass = (active: boolean) => `flex-1 rounded-lg text-xs font-bold transition-all ${active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 bg-transparent'}`;

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 relative">
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10"></div>
      {[
        { n: 1, label: 'Identity', icon: User },
        { n: 2, label: 'Contact', icon: MapPin },
        { n: 3, label: 'Medical', icon: Stethoscope },
        { n: 4, label: 'Review', icon: ShieldCheck },
      ].map((s) => (
        <div key={s.n} className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 font-bold shadow-md
            ${step === s.n ? 'bg-emerald-600 text-white border-emerald-400 scale-110 shadow-emerald-100' : 
              step > s.n ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-300 border-slate-100'}
          `}>
            {step > s.n ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s.n ? 'text-emerald-700' : 'text-slate-400'}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/80 transition-all duration-500">
      <div className="max-w-3xl mx-auto">

        <header className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PhilHealth Dialysis Database</h2>
          <p className="text-slate-400 text-sm mt-1">Registration Form (Digital Version 1.0)</p>
        </header>

        <StepIndicator />

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-600 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div>Please complete the following required fields:</div>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                {errors.map((field) => (
                  <li key={field}>{fieldNameMap[field] || field}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="min-h-[420px]"
          >
            {/* Step 1: Identity Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <User className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Account & Membership Identity</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Registration Type <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <div className={segmentedWrapperClass}>
                        {['New Registration', 'Reactivation'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, regType: type as any })}
                            className={segmentedButtonClass(formData.regType === type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>PIN Number <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input 
                        type="text" 
                        placeholder="00-000000000-0"
                        value={formData.pin ?? ''}
                        onChange={(e) => setFormData({ ...formData, pin: handleNumericalInput(e.target.value) })}
                        className={`${getInputClass(errors.includes('pin'))} font-mono tracking-wider`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabelClass}>Full Patient Name <span className="text-rose-500 font-black ml-0.5">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
                      <input 
                        placeholder="Last Name *" 
                        className={`${getInputClass(errors.includes('lastName'))} sm:col-span-3`}
                        value={formData.patientName?.last ?? ''}
                        onChange={(e) => updateNested('patientName', 'last', e.target.value)}
                      />
                      <input 
                        placeholder="First Name *" 
                        className={`${getInputClass(errors.includes('firstName'))} sm:col-span-4`}
                        value={formData.patientName?.first ?? ''}
                        onChange={(e) => updateNested('patientName', 'first', e.target.value)}
                      />
                      <input 
                        placeholder="Ext. (Jr/Sr)" 
                        className={`${getInputClass(false)} sm:col-span-2`}
                        value={formData.patientName?.extension ?? ''}
                        onChange={(e) => updateNested('patientName', 'extension', e.target.value)}
                      />
                      <input 
                        placeholder="M.I." 
                        className={`${getInputClass(false)} sm:col-span-3`}
                        value={formData.patientName?.middle ?? ''}
                        onChange={(e) => updateNested('patientName', 'middle', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 relative">
                      <label className={fieldLabelClass}>Current Membership <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <select 
                        className={selectControlClass}
                        value={formData.memberType}
                        onChange={(e) => setFormData({ ...formData, memberType: e.target.value as any })}
                      >
                        <option value="Principal Member">Principal Member</option>
                        <option value="Dependent">Dependent</option>
                      </select>
                      <div className="pointer-events-none absolute bottom-4 right-4 text-slate-400 text-[10px]">▼</div>
                    </div>
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Date of Birth <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input 
                        type="date" 
                        className={getInputClass(errors.includes('dob'))}
                        value={formData.dob ?? ''}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Sex <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <div className={segmentedWrapperClass}>
                        {['Male', 'Female'].map((sex) => (
                          <button
                            key={sex}
                            type="button"
                            onClick={() => setFormData({ ...formData, sex: sex as any })}
                            className={segmentedButtonClass(formData.sex === sex)}
                          >
                            {sex}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Civil Status <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input 
                        placeholder="e.g. Single, Married, Widowed" 
                        className={getInputClass(errors.includes('civilStatus'))}
                        value={formData.civilStatus ?? ''}
                        onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Mailing Address</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className={fieldLabelClass}>Unit/Room No.</label>
                      <input className={getInputClass(false)} placeholder="e.g. 301" value={formData.address?.unit ?? ''} onChange={(e) => updateNested('address', 'unit', handleNumericalInput(e.target.value))} />
                    </div>
                    <div className="md:col-span-9">
                      <label className={fieldLabelClass}>Building / Street Address <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('street'))} placeholder="Unit Name or Street Address" value={formData.address?.street ?? ''} onChange={(e) => updateNested('address', 'street', e.target.value)} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>Barangay <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('barangay'))} placeholder="e.g. Brgy. 1" value={formData.address?.barangay ?? ''} onChange={(e) => updateNested('address', 'barangay', e.target.value)} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>City/Municipality <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('city'))} placeholder="e.g. Quezon City" value={formData.address?.city ?? ''} onChange={(e) => updateNested('address', 'city', e.target.value)} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>Province <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('province'))} placeholder="e.g. Cavite" value={formData.address?.province ?? ''} onChange={(e) => updateNested('address', 'province', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Contact Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>Mobile Number <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('mobile'))} placeholder="+63 9xx xxxx xxx" value={formData.contact?.mobile ?? ''} onChange={(e) => updateNested('contact', 'mobile', handleNumericalInput(e.target.value))} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>Email Address <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input className={getInputClass(errors.includes('email'))} placeholder="patient@example.com" value={formData.contact?.email ?? ''} onChange={(e) => updateNested('contact', 'email', e.target.value)} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={fieldLabelClass}>Landline Number</label>
                      <input className={getInputClass(false)} placeholder="(02) xxxx-xxxx" value={formData.contact?.landline ?? ''} onChange={(e) => updateNested('contact', 'landline', handleNumericalInput(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Medical Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Benefit & Case Rate Insurance Coverage</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Z Benefit Enrollment Status <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateNested('zBenefits', 'pdFirstPolicy', !formData.zBenefits?.pdFirstPolicy)}
                          className={`h-12 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                            ${formData.zBenefits?.pdFirstPolicy ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}
                          `}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${formData.zBenefits?.pdFirstPolicy ? 'opacity-100' : 'opacity-30'}`} />
                          PD First Policy
                        </button>
                        <button
                          type="button"
                          onClick={() => updateNested('zBenefits', 'kidneyTransplant', !formData.zBenefits?.kidneyTransplant)}
                          className={`h-12 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                            ${formData.zBenefits?.kidneyTransplant ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}
                          `}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${formData.zBenefits?.kidneyTransplant ? 'opacity-100' : 'opacity-30'}`} />
                          Kidney Transplant
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Previous Kidney Transplant Case Availment <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <div className={segmentedWrapperClass}>
                        <button
                          type="button"
                          onClick={() => updateNested('previousAvailment', 'kidneyTransplant', true)}
                          className={segmentedButtonClass(formData.previousAvailment?.kidneyTransplant === true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => updateNested('previousAvailment', 'kidneyTransplant', false)}
                          className={segmentedButtonClass(formData.previousAvailment?.kidneyTransplant === false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Dialysis Logs & Configurations</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className={fieldLabelClass}>Dialysis Initiation (Month & Year) <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input 
                        type="month" 
                        className={getInputClass(errors.includes('dialysisStartDate'))}
                        value={formData.dialysisStartDate ?? ''}
                        onChange={(e) => setFormData({ ...formData, dialysisStartDate: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-6 relative">
                      <label className={fieldLabelClass}>For HD: Type of Dialyzer <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <select 
                        className={selectControlClass}
                        value={formData.hdDetails?.type ?? ''}
                        onChange={(e) => updateNested('hdDetails', 'type', e.target.value)}
                      >
                        <option value="Low flux">Low Flux</option>
                        <option value="High flux">High Flux</option>
                        <option value="Others">Others Description</option>
                      </select>
                      <div className="pointer-events-none absolute bottom-4 right-4 text-slate-400 text-[10px]">▼</div>
                    </div>
                  </div>

                  {formData.hdDetails?.type === 'Others' && (
                    <div className="pt-1">
                      <label className={fieldLabelClass}>Other Dialyzer Type (Please Specify) <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input
                        className={getInputClass(errors.includes('othersDetail'))}
                        placeholder="Specify custom technical model description..."
                        value={formData.hdDetails?.othersDetail ?? ''}
                        onChange={(e) => updateNested('hdDetails', 'othersDetail', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>For PD: Current PD System Selection <span className="text-rose-500 font-black ml-0.5">*</span></h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-10 gap-3">
                    {['CAPD', 'CIPD-C', 'CIPD-M', 'CCPD', 'NIPD'].map((sys) => {
                      const isSelected = formData.pdDetails?.system === sys;
                      return (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => updateNested('pdDetails', 'system', sys)}
                          className={`h-14 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 md:col-span-2
                            ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-slate-600'}
                          `}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                          {sys}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-slate-50/60 border border-slate-100 rounded-3xl">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-100">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Final Verification</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">Please review the setup mapping metrics. Once submitted, metadata maps directly to secure internal validation processing.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sm:col-span-6">
                    <p className={fieldLabelClass}>Patient Profile Summary</p>
                    <p className="text-base font-bold text-slate-800 uppercase tracking-wide">
                      {formData.patientName?.last || '—'}, {formData.patientName?.first || '—'}
                    </p>
                    <div className="flex gap-3 text-xs font-semibold text-slate-400 mt-1">
                      <span>{formData.sex}</span>
                      <span>•</span>
                      <span className="font-mono">{formData.pin || 'No PIN Registered'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sm:col-span-6">
                    <p className={fieldLabelClass}>Dialysis Diagnostics Matrix</p>
                    <p className="text-base font-bold text-slate-800">
                      {formData.pdDetails?.system || formData.hdDetails?.type || 'Not Configured'}
                    </p>
                    <div className="flex gap-3 text-xs font-semibold text-slate-400 mt-1">
                      <span>Start: {formData.dialysisStartDate || '—'}</span>
                      <span>•</span>
                      <span>{formData.regType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100/70 flex gap-3">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800/90 font-medium leading-relaxed italic">
                    I hereby certify that the configuration points registered above match formal system claims. I explicitly authorize information sharing processing for formal diagnostic records.
                  </p>
                </div>

                {/* Certification Fields */}
                <div className={cardPanelClass}>
                  <div className={cardHeaderClass}>
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h4 className={cardTitleClass}>Certification & Verification Matrix</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          Signature / Thumbmark <span className="text-rose-500 font-black ml-0.5">*</span>
                        </label>
                        {hasSigned && (
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Clear Pad
                          </button>
                        )}
                      </div>

                      {/* Handwritten Canvas Writing Area */}
                      <div className={`w-full bg-white border ${errors.includes('signatureHandwritten') ? 'border-rose-500' : 'border-slate-200'} rounded-xl overflow-hidden shadow-inner relative group`}>
                        <canvas
                          ref={canvasRef}
                          width={500}
                          height={150}
                          className="w-full h-[150px] cursor-crosshair touch-none block bg-slate-50/30"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        {!hasSigned && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-xs text-slate-300 font-medium italic">
                            Draw your signature directly inside this box
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 font-semibold">
                        Sign using your mouse, trackpad, or touchscreen. Your drawing will save directly into the output document schema.
                      </p>
                    </div>

                    <div className="md:col-span-6 space-y-4">
                      <div>
                        <label className={fieldLabelClass}>Signature Date <span className="text-rose-500 font-black ml-0.5">*</span></label>
                        <input
                          type="date"
                          className={getInputClass(errors.includes('signatureDate'))}
                          value={(formData as any).signatureDate ?? ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value } as any))}
                        />
                      </div>
                      <div>
                        <label className={fieldLabelClass}>PDD Registration No. <span className="text-rose-500 font-black ml-0.5">*</span></label>
                        <input
                          className={getInputClass(errors.includes('pddRegNo'))}
                          placeholder="Facility Assigned Registration ID"
                          value={formData.admin?.pddRegNo ?? ''}
                          onChange={(e) => updateNested('admin', 'pddRegNo', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-4">
                      <label className={fieldLabelClass}>Registered By (HCI) <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input
                        className={getInputClass(errors.includes('registeredBy'))}
                        placeholder="Facility Entity Label"
                        value={formData.admin?.registeredBy ?? ''}
                        onChange={(e) => updateNested('admin', 'registeredBy', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className={fieldLabelClass}>20. Accreditation No. <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input
                        className={getInputClass(errors.includes('accreditationNo'))}
                        placeholder="HCI-YYYY-00000"
                        value={formData.admin?.accreditationNo ?? ''}
                        onChange={(e) => updateNested('admin', 'accreditationNo', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className={fieldLabelClass}>21. Registration Logging Date <span className="text-rose-500 font-black ml-0.5">*</span></label>
                      <input
                        type="date"
                        className={getInputClass(errors.includes('registrationDate'))}
                        value={formData.admin?.registrationDate ? formData.admin.registrationDate.substring(0, 10) : ''}
                        onChange={(e) => updateNested('admin', 'registrationDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Form Execution Controllers */}
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 h-12 px-5 rounded-xl font-bold text-xs transition-all
              ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
            `}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-100 transition-all outline-none"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCommitClick}
              className="flex items-center gap-2 h-12 px-8 bg-slate-950 hover:bg-slate-900 text-emerald-400 rounded-xl font-bold text-xs shadow-lg transition-all outline-none border border-slate-800"
            >
              Complete Submission
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Animated Confirmation Overlay Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirm(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative bg-white max-w-sm w-full p-6 rounded-3xl shadow-xl border border-slate-100 text-center z-10 space-y-4"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Info className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">Confirm Submission</h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Are you sure you want to submit this registration form? Please review your metrics to verify that the information is accurate.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex-1 h-11 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}