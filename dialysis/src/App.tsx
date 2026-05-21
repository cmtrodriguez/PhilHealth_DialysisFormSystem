import { useState, useEffect, type FormEvent } from 'react';
import philhealthLogo from './assets/philhealth-logo.png';
import doctorSignatureStamp from './assets/doctor_signature_stamp.png';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  FileText,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Bell,
  Menu,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Activity,
  ArrowRight,
  Hospital,
  Mail,
  LockKeyhole,
} from 'lucide-react';

// Types and Component Imports
import { PDDRegistration, Nephrologist, DialysisSession, DialysisSessionClaimStatus } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import RegistrationForm from './components/RegistrationForm.tsx';
import RecordsList from './components/RecordsList.tsx';
import PersonaSwitcher, { UserRole } from './components/PersonaSwitcher.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient.ts';

type View = 'home' | 'apply' | 'my-records' | 'profile';
type PublicView = 'landing' | 'login' | 'signup' | 'portal';

function getViewFromPath(): PublicView {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/login') return 'login';
  if (path === '/signup') return 'signup';
  if (path === '/portal') return 'portal';

  return 'landing';
}

function PublicHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src={philhealthLogo}
              alt="PhilHealth Logo"
              className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200 p-1 shadow-sm"
            />
            <div>
              <h1 className="text-lg font-black text-emerald-900 leading-tight">
                PhilHealth
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                Patient Portal
              </p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Features
            </a>
            <a href="/login" className="hover:text-emerald-700 transition-colors">
              Login
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition-all"
            >
              Login
            </a>
            <a
              href="/signup"
              className="inline-flex px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-800 transition-all"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="pt-28">
        <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-yellow-300 text-xs font-black uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" />
                Secure PhilHealth Dialysis Access
              </div>

              <h2 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Manage your PhilHealth dialysis registration online.
              </h2>

              <p className="mt-6 text-lg text-emerald-50 leading-relaxed max-w-xl">
                A simple patient homepage for login, signup, application tracking,
                and PhilHealth Dialysis Database records.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-yellow-400 text-emerald-950 font-black shadow-xl hover:bg-white transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Account
                </a>

                <a
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/10 border border-white/25 text-white font-black hover:bg-white/20 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Portal Preview
                    </p>
                    <h3 className="text-2xl font-black text-slate-800">
                      Patient Dashboard
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-emerald-900">
                        Latest Application Status
                      </p>
                      <span className="px-3 py-1 rounded-full bg-yellow-300 text-emerald-950 text-[10px] font-black uppercase">
                        Pending
                      </span>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="h-full w-2/3 bg-emerald-600 rounded-full" />
                    </div>
                    <p className="mt-3 text-sm text-emerald-800">
                      Your registration is being reviewed by the Medical Evaluation Team.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-3xl font-black text-slate-800">24/7</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        Online Access
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-3xl font-black text-slate-800">Z</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">
                        Benefit Support
                      </p>
                    </div>
                  </div>

                  <a
                    href="/portal"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-900 text-yellow-300 font-black hover:bg-black transition-all"
                  >
                    Open Demo Portal
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-black text-emerald-700 uppercase tracking-[0.2em]">
              Portal Features
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">
              Simple tools for patients
            </h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Login, register, track your dialysis application, and view your records
              in one patient-friendly homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                <LogIn className="w-7 h-7 text-emerald-700" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Patient Login</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Access your account using your email or PhilHealth information.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mb-5">
                <UserPlus className="w-7 h-7 text-yellow-700" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Signup Page</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Create a new patient account before using the dialysis portal.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <Hospital className="w-7 h-7 text-blue-700" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Application Portal</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Submit and monitor PhilHealth Dialysis Database registrations.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-emerald-950 text-white">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={philhealthLogo}
                alt="PhilHealth Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white p-1"
              />
              <div>
                <p className="font-black">PhilHealth Patient Portal</p>
                <p className="text-xs text-emerald-300">
                  Dialysis registration homepage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-sm font-bold text-emerald-100">
              <a href="/" className="hover:text-yellow-300">
                Home
              </a>
              <a href="/login" className="hover:text-yellow-300">
                Login
              </a>
              <a href="/signup" className="hover:text-yellow-300">
                Sign Up
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <a href="/" className="flex items-center justify-center gap-3 mb-8">
          <img
            src={philhealthLogo}
            alt="PhilHealth Logo"
            className="w-14 h-14 rounded-2xl bg-white object-contain p-2 shadow-xl"
          />
          <div>
            <h1 className="text-2xl font-black text-white">PhilHealth</h1>
            <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest">
              Patient Login
            </p>
          </div>
        </a>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-[2rem] p-8 shadow-2xl border border-emerald-100"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-emerald-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Login to your account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Enter your patient login details to continue.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Email or PhilHealth PIN
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="juan@email.com or 00-000000000-0"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-emerald-800 text-white font-black shadow-lg shadow-emerald-100 hover:bg-emerald-900 transition-all"
            >
              Login
            </button>
          </div>

          <div className="mt-7 text-center text-sm">
            <p className="text-slate-500">
              No account yet?{' '}
              <a href="/signup" className="font-black text-emerald-700 hover:underline">
                Sign up here
              </a>
            </p>
            <a
              href="/"
              className="inline-block mt-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-700"
            >
              Back to homepage
            </a>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function SignupPage({ onSignup }: { onSignup: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignup();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <a href="/" className="flex items-center justify-center gap-3 mb-8">
          <img
            src={philhealthLogo}
            alt="PhilHealth Logo"
            className="w-14 h-14 rounded-2xl bg-white object-contain p-2 shadow-xl border border-slate-200"
          />
          <div>
            <h1 className="text-2xl font-black text-emerald-950">PhilHealth</h1>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Patient Signup
            </p>
          </div>
        </a>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-yellow-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Create your patient account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign up to access the PhilHealth Dialysis Patient Portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                First Name
              </label>
              <input
                type="text"
                required
                placeholder="Juan"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Last Name
              </label>
              <input
                type="text"
                required
                placeholder="Dela Cruz"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="juan@email.com"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                PhilHealth PIN
              </label>
              <input
                type="text"
                required
                placeholder="00-000000000-0"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Create password"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm password"
                className="mt-2 w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 w-full py-4 rounded-2xl bg-emerald-800 text-white font-black shadow-lg shadow-emerald-100 hover:bg-emerald-900 transition-all"
          >
            Create Account
          </button>

          <div className="mt-7 text-center text-sm">
            <p className="text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-black text-emerald-700 hover:underline">
                Login here
              </a>
            </p>
            <a
              href="/"
              className="inline-block mt-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-700"
            >
              Back to homepage
            </a>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole>('patient');
  const [publicView, setPublicView] = useState<PublicView>(() => getViewFromPath());
  const [activeView, setActiveView] = useState<View>('home');
  
  const [adminActiveView, setAdminActiveView] = useState('dashboard');
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);

  const [registrations, setRegistrations] = useState<PDDRegistration[]>([]);
  const [doctors, setDoctors] = useState<Nephrologist[]>([]);
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const TOUR_STEPS = [
    {
      title: "St. Jude Renal Center Landing Page",
      description: "Welcome to the PhilHealth Dialysis Registry. The presentation begins on the patient-facing portal landing dashboard.",
      role: "patient" as UserRole,
      publicView: "landing" as PublicView,
      activeView: "home" as View
    },
    {
      title: "Patient Self-Service Enrollment Intake",
      description: "Patient Juan Dela Cruz completes the multi-page registration form declaring Stage 5 CKD and Z-Benefits eligibility.",
      role: "patient" as UserRole,
      publicView: "portal" as PublicView,
      activeView: "apply" as View
    },
    {
      title: "Registry Application Tracking",
      description: "Juan's application is sent to the central hospital queue and logs securely as 'Pending' verification.",
      role: "patient" as UserRole,
      publicView: "portal" as PublicView,
      activeView: "my-records" as View
    },
    {
      title: "HCI Billing & Financial Estimations",
      description: "Switching roles to Billing Encoder Maria Santos. Pointing out projected dialysis revenues (₱6,350 package rate) and mending Return-to-Hospital (RTH) claims.",
      role: "admin_encoder" as UserRole,
      publicView: "portal" as PublicView,
      adminView: "dashboard"
    },
    {
      title: "PDD Queue Review & Certified PDF Export",
      description: "Maria validates Juan's case file, binds accredited specialist Dr. Perez, and downloads the certified overlay PDF with digital stamp verified.",
      role: "admin_encoder" as UserRole,
      publicView: "portal" as PublicView,
      adminView: "pdd-queue"
    },
    {
      title: "156 Session Limit Coverage Tracking",
      description: "Monitoring session coverage caps (156 max per year). Highlighting depletion red-warning metrics as logs approach limit.",
      role: "admin_encoder" as UserRole,
      publicView: "portal" as PublicView,
      adminView: "session-tracker"
    },
    {
      title: "Specialist Attending Physician Workspace",
      description: "Switching to Nephrologist Dr. Perez's dashboard. Attending doctors focus strictly on patient prescription sheets and signing clinical sessions.",
      role: "doctor" as UserRole,
      publicView: "portal" as PublicView,
      adminView: "doctor-patients"
    },
    {
      title: "PRC Accreditation & Signature Stamp Setup",
      description: "Dr. Perez verifies his specialist credentials and PRC seal. The clinical registry flow is fully complete!",
      role: "doctor" as UserRole,
      publicView: "portal" as PublicView,
      adminView: "doctor-profile"
    }
  ];

  const applyTourStep = (stepIndex: number) => {
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    setRole(step.role);
    if (step.publicView) {
      setPublicView(step.publicView);
      window.history.pushState(null, '', step.publicView === 'portal' ? '/portal' : '/');
    }
    if (step.activeView) {
      setActiveView(step.activeView);
    }
    if (step.adminView) {
      setAdminActiveView(step.adminView);
    }
  };

  useEffect(() => {
    let interval: any;
    if (tourActive && isTourPlaying) {
      interval = setInterval(() => {
        setTourStep((prev) => {
          if (prev >= TOUR_STEPS.length - 1) {
            setIsTourPlaying(false);
            return prev;
          }
          const nextStep = prev + 1;
          applyTourStep(nextStep);
          return nextStep;
        });
      }, 7000); // 7 seconds per slide
    }
    return () => clearInterval(interval);
  }, [tourActive, isTourPlaying]);

  // Sync routes
  useEffect(() => {
    const syncRoute = () => {
      setPublicView(getViewFromPath());
    };
    window.addEventListener('popstate', syncRoute);
    syncRoute();
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  // Database Seeding Logic
  const seedDemoData = () => {
    const defaultDoctors: Nephrologist[] = [
      {
        id: 'doc_1',
        first: 'Edgardo',
        last: 'Perez',
        prcLicenseNo: '0098765',
        panNo: '99-012345678-0',
        email: 'edgardo.perez@hospital.gov.ph',
        isActive: true,
        signatureUrl: doctorSignatureStamp
      },
      {
        id: 'doc_2',
        first: 'Maria',
        last: 'Santos',
        prcLicenseNo: '0054321',
        panNo: '99-876543210-9',
        email: 'maria.santos@hospital.gov.ph',
        isActive: true,
        signatureUrl: doctorSignatureStamp
      },
      {
        id: 'doc_3',
        first: 'Jose',
        last: 'Reyes',
        prcLicenseNo: '0077777',
        panNo: '99-555555555-5',
        email: 'jose.reyes@hospital.gov.ph',
        isActive: false,
        signatureUrl: doctorSignatureStamp
      }
    ];

    const defaultRegistrations: PDDRegistration[] = [
      {
        id: 'reg_1',
        regType: 'New Registration',
        pin: '12-345678901-2',
        patientName: { first: 'Juan', last: 'Dela Cruz', middle: 'Santos', extension: '' },
        memberType: 'Principal Member',
        dob: '1985-05-15',
        sex: 'Male',
        civilStatus: 'Married',
        address: { unit: '12', building: 'Tower A', lot: '45', street: 'Mabini', subdivision: 'Residences', barangay: 'Barangay 669', city: 'Ermita', province: 'Metro Manila', country: 'Philippines', zip: '1000' },
        contact: { email: 'juan.delacruz@example.com', mobile: '09171234567', landline: '028123456' },
        zBenefits: { pdFirstPolicy: false, kidneyTransplant: false },
        previousAvailment: { kidneyTransplant: false },
        dialysisStartDate: '2026-01-10',
        hdDetails: { type: 'Low flux' },
        pdDetails: { system: '' },
        admin: { pddRegNo: 'PDD-998811', registeredBy: 'Maria Santos (HCI Encoder)', accreditationNo: 'HCI-123456', registrationDate: '2026-01-12' },
        recordStatus: 'Active',
        createdAt: '2026-01-10T08:00:00.000Z'
      },
      {
        id: 'reg_2',
        regType: 'New Registration',
        pin: '99-888888888-9',
        patientName: { first: 'Pedro', last: 'Penduko', middle: 'Agua', extension: '' },
        memberType: 'Dependent',
        dob: '1992-09-20',
        sex: 'Male',
        civilStatus: 'Single',
        address: { unit: '3B', building: 'Green Plaza', lot: '12', street: 'Rizal Ave', subdivision: '', barangay: 'Barangay 12', city: 'Pasay', province: 'Metro Manila', country: 'Philippines', zip: '1300' },
        contact: { email: 'pedro.penduko@example.com', mobile: '09187654321', landline: '' },
        zBenefits: { pdFirstPolicy: true, kidneyTransplant: false },
        previousAvailment: { kidneyTransplant: false },
        dialysisStartDate: '2026-05-01',
        hdDetails: { type: 'Low flux' },
        pdDetails: { system: 'CAPD' },
        admin: { pddRegNo: '', registeredBy: '', accreditationNo: '', registrationDate: '' },
        recordStatus: 'Pending',
        createdAt: '2026-05-15T10:30:00.000Z'
      },
      {
        id: 'reg_3',
        regType: 'New Registration',
        pin: '11-222333444-5',
        patientName: { first: 'Maria', last: 'Clara', middle: 'Ibarra', extension: '' },
        memberType: 'Principal Member',
        dob: '1978-11-30',
        sex: 'Female',
        civilStatus: 'Single',
        address: { unit: 'Suite 9', building: 'Rizal Mansions', lot: '', street: 'Taft Ave', subdivision: '', barangay: 'Barangay 700', city: 'Malate', province: 'Metro Manila', country: 'Philippines', zip: '1004' },
        contact: { email: 'maria.clara@example.com', mobile: '09223344556', landline: '028776655' },
        zBenefits: { pdFirstPolicy: false, kidneyTransplant: false },
        previousAvailment: { kidneyTransplant: false },
        dialysisStartDate: '2025-08-15',
        hdDetails: { type: 'High flux' },
        pdDetails: { system: '' },
        admin: { pddRegNo: 'PDD-776655', registeredBy: 'Maria Santos (HCI Encoder)', accreditationNo: 'HCI-123456', registrationDate: '2025-08-16' },
        recordStatus: 'Active',
        createdAt: '2025-08-15T09:15:00.000Z'
      }
    ];

    const defaultSessions: DialysisSession[] = [];
    // Generate sessions for Juan Dela Cruz (reg_1)
    for (let i = 1; i <= 15; i++) {
      defaultSessions.push({
        id: `session_juan_${i}`,
        registrationId: 'reg_1',
        sessionDate: `2026-04-${String(i).padStart(2, '0')}`,
        attendingNephrologistId: 'doc_1',
        machineNo: '03',
        claimStatus: 'approved',
        amountClaimed: 6350,
        createdAt: new Date().toISOString()
      });
    }
    // Generate sessions for Maria Clara (reg_3) - 140 approved, 2 Return To Hospital (RTH)
    for (let i = 1; i <= 140; i++) {
      defaultSessions.push({
        id: `session_maria_${i}`,
        registrationId: 'reg_3',
        sessionDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
        attendingNephrologistId: 'doc_2',
        machineNo: '05',
        claimStatus: 'approved',
        amountClaimed: 6350,
        createdAt: new Date().toISOString()
      });
    }
    // Add 2 RTH sessions
    defaultSessions.push({
      id: `session_maria_rth_1`,
      registrationId: 'reg_3',
      sessionDate: '2026-05-10',
      attendingNephrologistId: 'doc_2',
      machineNo: '05',
      claimStatus: 'rth',
      amountClaimed: 6350,
      rthReason: 'PRC License Accreditation Number out of sync',
      createdAt: new Date().toISOString()
    });
    defaultSessions.push({
      id: `session_maria_rth_2`,
      registrationId: 'reg_3',
      sessionDate: '2026-05-12',
      attendingNephrologistId: 'doc_2',
      machineNo: '05',
      claimStatus: 'rth',
      amountClaimed: 6350,
      rthReason: 'PIN and Member Birthdate mismatch on regional databases',
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('pdd_doctors', JSON.stringify(defaultDoctors));
    localStorage.setItem('pdd_registrations', JSON.stringify(defaultRegistrations));
    localStorage.setItem('pdd_sessions', JSON.stringify(defaultSessions));

    setDoctors(defaultDoctors);
    setRegistrations(defaultRegistrations);
    setSessions(defaultSessions);
    alert('Demo Sandbox seeded with 3 Doctors, 3 Patients, and 157 historical Dialysis claims.');
  };

  const resetDemoData = () => {
    localStorage.removeItem('pdd_doctors');
    localStorage.removeItem('pdd_registrations');
    localStorage.removeItem('pdd_sessions');
    setDoctors([]);
    setRegistrations([]);
    setSessions([]);
    alert('Local storage database cleared. App is now completely clean.');
  };
  // Load from local storage and Supabase on startup
  useEffect(() => {
    const loadStartupData = async () => {
      const savedRegs = localStorage.getItem('pdd_registrations');
      const savedDocs = localStorage.getItem('pdd_doctors');
      const savedSessions = localStorage.getItem('pdd_sessions');

      if (savedRegs) {
        try { setRegistrations(JSON.parse(savedRegs)); } catch (e) { console.error(e); }
      }
      if (savedDocs) {
        try {
          const parsed = JSON.parse(savedDocs);
          const migrated = parsed.map((doc: any) => {
            if (!doc.signatureUrl || doc.signatureUrl.includes('raw.githubusercontent.com') || doc.signatureUrl.includes('user-attachments')) {
              return { ...doc, signatureUrl: doctorSignatureStamp };
            }
            return doc;
          });
          setDoctors(migrated);
          localStorage.setItem('pdd_doctors', JSON.stringify(migrated));
        } catch (e) {
          console.error(e);
        }
      }
      if (savedSessions) {
        try { setSessions(JSON.parse(savedSessions)); } catch (e) { console.error(e); }
      }

      // Auto-seed on first launch if database is clean
      if (!savedRegs && !savedDocs && !savedSessions) {
        const defaultDoctors: Nephrologist[] = [
          {
            id: 'doc_1',
            first: 'Edgardo',
            last: 'Perez',
            prcLicenseNo: '0098765',
            panNo: '99-012345678-0',
            email: 'edgardo.perez@hospital.gov.ph',
            isActive: true,
            signatureUrl: doctorSignatureStamp
          },
          {
            id: 'doc_2',
            first: 'Maria',
            last: 'Santos',
            prcLicenseNo: '0054321',
            panNo: '99-876543210-9',
            email: 'maria.santos@hospital.gov.ph',
            isActive: true,
            signatureUrl: doctorSignatureStamp
          },
          {
            id: 'doc_3',
            first: 'Jose',
            last: 'Reyes',
            prcLicenseNo: '0077777',
            panNo: '99-555555555-5',
            email: 'jose.reyes@hospital.gov.ph',
            isActive: false,
            signatureUrl: doctorSignatureStamp
          }
        ];

        const defaultRegistrations: PDDRegistration[] = [
          {
            id: 'reg_1',
            regType: 'New Registration',
            pin: '12-345678901-2',
            patientName: { first: 'Juan', last: 'Dela Cruz', middle: 'Santos', extension: '' },
            memberType: 'Principal Member',
            dob: '1985-05-15',
            sex: 'Male',
            civilStatus: 'Married',
            address: { unit: '12', building: 'Tower A', lot: '45', street: 'Mabini', subdivision: 'Residences', barangay: 'Barangay 669', city: 'Ermita', province: 'Metro Manila', country: 'Philippines', zip: '1000' },
            contact: { email: 'juan.delacruz@example.com', mobile: '09171234567', landline: '028123456' },
            zBenefits: { pdFirstPolicy: false, kidneyTransplant: false },
            previousAvailment: { kidneyTransplant: false },
            dialysisStartDate: '2026-01-10',
            hdDetails: { type: 'Low flux' },
            pdDetails: { system: '' },
            admin: { pddRegNo: 'PDD-998811', registeredBy: 'Maria Santos (HCI Encoder)', accreditationNo: 'HCI-123456', registrationDate: '2026-01-12' },
            recordStatus: 'Active',
            createdAt: '2026-01-10T08:00:00.000Z'
          },
          {
            id: 'reg_2',
            regType: 'New Registration',
            pin: '99-888888888-9',
            patientName: { first: 'Pedro', last: 'Penduko', middle: 'Agua', extension: '' },
            memberType: 'Dependent',
            dob: '1992-09-20',
            sex: 'Male',
            civilStatus: 'Single',
            address: { unit: '3B', building: 'Green Plaza', lot: '12', street: 'Rizal Ave', subdivision: '', barangay: 'Barangay 12', city: 'Pasay', province: 'Metro Manila', country: 'Philippines', zip: '1300' },
            contact: { email: 'pedro.penduko@example.com', mobile: '09187654321', landline: '' },
            zBenefits: { pdFirstPolicy: true, kidneyTransplant: false },
            previousAvailment: { kidneyTransplant: false },
            dialysisStartDate: '2026-05-01',
            hdDetails: { type: 'Low flux' },
            pdDetails: { system: 'CAPD' },
            admin: { pddRegNo: '', registeredBy: '', accreditationNo: '', registrationDate: '' },
            recordStatus: 'Pending',
            createdAt: '2026-05-15T10:30:00.000Z'
          },
          {
            id: 'reg_3',
            regType: 'New Registration',
            pin: '11-222333444-5',
            patientName: { first: 'Maria', last: 'Clara', middle: 'Ibarra', extension: '' },
            memberType: 'Principal Member',
            dob: '1978-11-30',
            sex: 'Female',
            civilStatus: 'Single',
            address: { unit: 'Suite 9', building: 'Rizal Mansions', lot: '', street: 'Taft Ave', subdivision: '', barangay: 'Barangay 700', city: 'Malate', province: 'Metro Manila', country: 'Philippines', zip: '1004' },
            contact: { email: 'maria.clara@example.com', mobile: '09223344556', landline: '028776655' },
            zBenefits: { pdFirstPolicy: false, kidneyTransplant: false },
            previousAvailment: { kidneyTransplant: false },
            dialysisStartDate: '2025-08-15',
            hdDetails: { type: 'High flux' },
            pdDetails: { system: '' },
            admin: { pddRegNo: 'PDD-776655', registeredBy: 'Maria Santos (HCI Encoder)', accreditationNo: 'HCI-123456', registrationDate: '2025-08-16' },
            recordStatus: 'Active',
            createdAt: '2025-08-15T09:15:00.000Z'
          }
        ];

        const defaultSessions: DialysisSession[] = [];
        for (let i = 1; i <= 15; i++) {
          defaultSessions.push({
            id: `session_juan_${i}`,
            registrationId: 'reg_1',
            sessionDate: `2026-04-${String(i).padStart(2, '0')}`,
            attendingNephrologistId: 'doc_1',
            machineNo: '03',
            claimStatus: 'approved',
            amountClaimed: 6350,
            createdAt: new Date().toISOString()
          });
        }
        for (let i = 1; i <= 140; i++) {
          defaultSessions.push({
            id: `session_maria_${i}`,
            registrationId: 'reg_3',
            sessionDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
            attendingNephrologistId: 'doc_2',
            machineNo: '05',
            claimStatus: 'approved',
            amountClaimed: 6350,
            createdAt: new Date().toISOString()
          });
        }
        defaultSessions.push({
          id: `session_maria_rth_1`,
          registrationId: 'reg_3',
          sessionDate: '2026-05-10',
          attendingNephrologistId: 'doc_2',
          machineNo: '05',
          claimStatus: 'rth',
          amountClaimed: 6350,
          rthReason: 'PRC License Accreditation Number out of sync',
          createdAt: new Date().toISOString()
        });
        defaultSessions.push({
          id: `session_maria_rth_2`,
          registrationId: 'reg_3',
          sessionDate: '2026-05-12',
          attendingNephrologistId: 'doc_2',
          machineNo: '05',
          claimStatus: 'rth',
          amountClaimed: 6350,
          rthReason: 'PIN and Member Birthdate mismatch on regional databases',
          createdAt: new Date().toISOString()
        });

        localStorage.setItem('pdd_doctors', JSON.stringify(defaultDoctors));
        localStorage.setItem('pdd_registrations', JSON.stringify(defaultRegistrations));
        localStorage.setItem('pdd_sessions', JSON.stringify(defaultSessions));

        setDoctors(defaultDoctors);
        setRegistrations(defaultRegistrations);
        setSessions(defaultSessions);
      }

      // Silently fetch and sync from Supabase if connected
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: dbDocs, error: errDocs } = await supabase.from('pdd_doctors').select('*');
          if (!errDocs && dbDocs && dbDocs.length > 0) {
            setDoctors(dbDocs);
            localStorage.setItem('pdd_doctors', JSON.stringify(dbDocs));
          }
          const { data: dbRegs, error: errRegs } = await supabase.from('pdd_registrations').select('*');
          if (!errRegs && dbRegs && dbRegs.length > 0) {
            setRegistrations(dbRegs);
            localStorage.setItem('pdd_registrations', JSON.stringify(dbRegs));
          }
          const { data: dbSessions, error: errSessions } = await supabase.from('pdd_sessions').select('*');
          if (!errSessions && dbSessions && dbSessions.length > 0) {
            setSessions(dbSessions);
            localStorage.setItem('pdd_sessions', JSON.stringify(dbSessions));
          }
        } catch (error) {
          console.error('Supabase live database fetch failed:', error);
        }
      }
    };

    loadStartupData();
  }, []);

  const navigateTo = (view: PublicView) => {
    const routes: Record<PublicView, string> = {
      landing: '/',
      login: '/login',
      signup: '/signup',
      portal: '/portal',
    };
    setPublicView(view);
    window.history.pushState(null, '', routes[view]);
    window.scrollTo(0, 0);
  };

  const saveRegistrations = (newRegs: PDDRegistration[]) => {
    setRegistrations(newRegs);
    localStorage.setItem('pdd_registrations', JSON.stringify(newRegs));
  };

  const handleLogout = () => {
    setRole('patient');
    setActiveView('home');
    setAdminActiveView('dashboard');
    setIsSidebarOpen(false);
    setTourActive(false);
    navigateTo('landing');
  };

  // Attending Doctors State Actions
  const addDoctor = async (doc: Nephrologist) => {
    const updated = [doc, ...doctors];
    setDoctors(updated);
    localStorage.setItem('pdd_doctors', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_doctors').insert([doc]);
      } catch (e) {
        console.error('Supabase addDoctor failed:', e);
      }
    }
  };

  const updateDoctor = async (updatedDoc: Nephrologist) => {
    const updated = doctors.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    setDoctors(updated);
    localStorage.setItem('pdd_doctors', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_doctors').update(updatedDoc).eq('id', updatedDoc.id);
      } catch (e) {
        console.error('Supabase updateDoctor failed:', e);
      }
    }
  };

  const deleteDoctor = async (id: string) => {
    const updated = doctors.filter(d => d.id !== id);
    setDoctors(updated);
    localStorage.setItem('pdd_doctors', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_doctors').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteDoctor failed:', e);
      }
    }
  };

  // Dialysis Sessions State Actions
  const logSession = async (session: DialysisSession) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    localStorage.setItem('pdd_sessions', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_sessions').insert([session]);
      } catch (e) {
        console.error('Supabase logSession failed:', e);
      }
    }
  };

  const updateSessionStatus = async (id: string, status: DialysisSessionClaimStatus, rthReason?: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, claimStatus: status, rthReason: rthReason || '' } : s);
    setSessions(updated);
    localStorage.setItem('pdd_sessions', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_sessions').update({ claimStatus: status, rthReason: rthReason || '' }).eq('id', id);
      } catch (e) {
        console.error('Supabase updateSessionStatus failed:', e);
      }
    }
  };

  // Patient Registry State Actions
  const addPatient = async (reg: PDDRegistration) => {
    saveRegistrations([reg, ...registrations]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').insert([reg]);
      } catch (e) {
        console.error('Supabase addPatient failed:', e);
      }
    }
  };

  const deletePatient = async (id: string) => {
    saveRegistrations(registrations.filter(r => r.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deletePatient failed:', e);
      }
    }
  };

  const approveRegistration = async (id: string, updatedReg: PDDRegistration) => {
    saveRegistrations(registrations.map(r => r.id === id ? updatedReg : r));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').update(updatedReg).eq('id', id);
      } catch (e) {
        console.error('Supabase approveRegistration failed:', e);
      }
    }
  };

  const rejectRegistration = async (id: string) => {
    saveRegistrations(registrations.filter(r => r.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase rejectRegistration failed:', e);
      }
    }
  };

  const addRegistration = async (reg: PDDRegistration) => {
    saveRegistrations([reg, ...registrations]);
    setActiveView('my-records');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').insert([reg]);
      } catch (e) {
        console.error('Supabase addRegistration failed:', e);
      }
    }
  };

  const deleteRegistration = async (id: string) => {
    saveRegistrations(registrations.filter((r) => r.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteRegistration failed:', e);
      }
    }
  };

  const updateRegistration = async (updatedReg: PDDRegistration) => {
    saveRegistrations(
      registrations.map((reg) =>
        reg.id === updatedReg.id ? updatedReg : reg,
      ),
    );
    setActiveView('my-records');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pdd_registrations').update(updatedReg).eq('id', updatedReg.id);
      } catch (e) {
        console.error('Supabase updateRegistration failed:', e);
      }
    }
  };

  const navItems = [
    { id: 'home', label: 'Home Portal', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply for Registry', icon: PlusCircle },
    { id: 'my-records', label: 'My Applications', icon: FileText },
    { id: 'profile', label: 'Personal Profile', icon: Users },
  ];

  const renderFloatingTourButton = () => {
    return (
      <button
        onClick={() => {
          setTourActive(true);
          setTourStep(0);
          applyTourStep(0);
          setIsTourPlaying(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-emerald-950 font-black px-6 py-3.5 rounded-full shadow-2xl border border-yellow-400/20 active:scale-95 hover:scale-105 hover:shadow-yellow-500/20 transition-all flex items-center gap-2.5 text-xs tracking-wider uppercase animate-bounce"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 animate-ping"></span>
        🎥 Presentation Tour
      </button>
    );
  };

  const renderTourBanner = () => {
    const current = TOUR_STEPS[tourStep];
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b-2 border-yellow-400 text-white p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black animate-pulse text-xs">
            {tourStep + 1}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-yellow-400 tracking-tight leading-none uppercase">
              Presentation Phase: {current.title}
            </h4>
            <p className="text-[11px] text-slate-300 font-bold mt-1 leading-relaxed max-w-2xl">
              {current.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const prev = Math.max(0, tourStep - 1);
              setTourStep(prev);
              applyTourStep(prev);
              setIsTourPlaying(false);
            }}
            disabled={tourStep === 0}
            className="px-3.5 py-2 bg-emerald-900/50 hover:bg-emerald-900 text-white rounded-xl border border-emerald-800 disabled:opacity-40 text-xs font-black transition-all"
          >
            ◀ Previous
          </button>

          <button
            onClick={() => {
              setIsTourPlaying(!isTourPlaying);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              isTourPlaying ? 'bg-amber-400 text-emerald-950 hover:bg-amber-500' : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {isTourPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => {
              const next = Math.min(TOUR_STEPS.length - 1, tourStep + 1);
              setTourStep(next);
              applyTourStep(next);
              setIsTourPlaying(false);
            }}
            disabled={tourStep === TOUR_STEPS.length - 1}
            className="px-3.5 py-2 bg-emerald-900/50 hover:bg-emerald-900 text-white rounded-xl border border-emerald-800 disabled:opacity-40 text-xs font-black transition-all"
          >
            Next ▶
          </button>

          <button
            onClick={() => {
              setTourActive(false);
              setIsTourPlaying(false);
              setRole('patient');
              setPublicView('landing');
              window.history.pushState(null, '', '/');
            }}
            className="px-3.5 py-2 bg-red-950/60 hover:bg-red-950 text-red-300 border border-red-900/50 rounded-xl text-xs font-black transition-all"
          >
            Exit Tour ✕
          </button>
        </div>
      </div>
    );
  };

  if (publicView === 'landing') {
    return (
      <>
        {tourActive && renderTourBanner()}
        {!tourActive && renderFloatingTourButton()}
        <div className={tourActive ? 'pt-20' : ''}>
          <PublicHomePage />
        </div>
        <PersonaSwitcher currentRole={role} onChangeRole={setRole} />
      </>
    );
  }

  if (publicView === 'login') {
    return (
      <>
        {tourActive && renderTourBanner()}
        <LoginPage
          onLogin={() => {
            setActiveView('home');
            navigateTo('portal');
          }}
        />
      </>
    );
  }

  if (publicView === 'signup') {
    return (
      <>
        {tourActive && renderTourBanner()}
        <SignupPage
          onSignup={() => {
            setActiveView('home');
            navigateTo('portal');
          }}
        />
      </>
    );
  }

  if (role === 'admin_encoder' || role === 'doctor') {
    return (
      <>
        {tourActive && renderTourBanner()}
        <AdminPortal
          role={role}
          registrations={registrations}
          sessions={sessions}
          doctors={doctors}
          onAddDoctor={addDoctor}
          onUpdateDoctor={updateDoctor}
          onDeleteDoctor={deleteDoctor}
          onLogSession={logSession}
          onUpdateSessionStatus={updateSessionStatus}
          onDeletePatient={deletePatient}
          onAddPatient={addPatient}
          onApproveRegistration={approveRegistration}
          onRejectRegistration={rejectRegistration}
          onResetDemoData={resetDemoData}
          onSeedDemoData={seedDemoData}
          isSupabaseConnected={isSupabaseConfigured}
          onLogout={handleLogout}
          activeView={adminActiveView}
          onViewChange={setAdminActiveView}
          tourActive={tourActive}
        />
        <PersonaSwitcher currentRole={role} onChangeRole={setRole} />
      </>
    );
  }

  return (
    <>
      {tourActive && renderTourBanner()}
      {!tourActive && renderFloatingTourButton()}
      <div className={`flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative ${tourActive ? 'pt-20' : ''}`}>
        {/* --- SIDEBAR --- */}
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarOpen ? 280 : 0,
            opacity: isSidebarOpen ? 1 : 0,
          }}
          className="bg-emerald-900 text-white flex flex-col shadow-2xl z-40 overflow-hidden whitespace-nowrap"
        >
          {/* Sidebar Header with Close Button */}
          <div className="p-6 flex items-center justify-between border-b border-emerald-800/50 min-h-[80px]">
            <div className="flex items-center gap-3">
              <img
                src={philhealthLogo}
                alt="PhilHealth Logo"
                className="w-10 h-10 rounded-lg object-contain bg-white p-1"
              />
              <div className="overflow-hidden">
                <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-semibold">
                  Patient Workspace
                </p>
                <h1 className="font-bold text-lg leading-tight">PhilHealth Portal</h1>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-emerald-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                  ${
                    activeView === item.id
                      ? 'bg-emerald-800 text-yellow-400 shadow-inner'
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${
                    activeView === item.id
                      ? 'text-yellow-400'
                      : 'text-emerald-400 group-hover:text-emerald-200'
                  }`}
                />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          
        </motion.aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header with the ONLY sidebar button */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all active:scale-95"
                aria-label="Toggle Sidebar"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
                {activeView.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700">Juan Dela Cruz</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">
                    Patient
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-black shadow-sm">
                  JC
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto"
              >
                {activeView === 'home' && <Dashboard registrations={registrations} />}

                {activeView === 'apply' && (
                  <RegistrationForm onSubmit={addRegistration} />
                )}

                {activeView === 'my-records' && (
                  <RecordsList
                    registrations={registrations}
                    onDelete={deleteRegistration}
                    onUpdate={updateRegistration}
                  />
                )}

                {activeView === 'profile' && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">
                      Personal Profile
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-600">
                        Account settings and security management.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Optional: Dark overlay when sidebar is open on smaller screens */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </div>
      <PersonaSwitcher currentRole={role} onChangeRole={setRole} />
    </>
  );
}